import { getDatabase } from '../mongodb';
import { measureDbQuery } from '../db-logger';

export interface UserRecord {
  _id?: string;
  email: string;
  name?: string | null;
  image?: string | null;
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  pages_processed: number;
  free_pages_limit: number;
  purchased_pages: number;
  created_at: Date;
  updated_at: Date;
}

// In-memory fallback if MongoDB is not running locally during development
const memoryUsers = new Map<string, UserRecord>();

export async function findOrCreateUser(
  email: string,
  name?: string | null,
  image?: string | null
): Promise<UserRecord> {
  const normalizedEmail = email.toLowerCase().trim();

  return await measureDbQuery('findOrCreateUser', async () => {
    try {
      const db = await getDatabase();
      if (db) {
        const usersCollection = db.collection<UserRecord>('users');
        let user = await usersCollection.findOne({ email: normalizedEmail });

        if (!user) {
          const now = new Date();
          const newUser: UserRecord = {
            email: normalizedEmail,
            name: name || null,
            image: image || null,
            tier: 'free',
            pages_processed: 0,
            free_pages_limit: 10,
            purchased_pages: 0,
            created_at: now,
            updated_at: now,
          };
          const result = await usersCollection.insertOne(
            newUser as unknown as import('mongodb').OptionalUnlessRequiredId<UserRecord>
          );
          user = { ...newUser, _id: result.insertedId.toString() };
        } else {
          if (user.purchased_pages === undefined || user.purchased_pages === null) {
            user.purchased_pages = 0;
          }

          // Auto-reconcile with completed orders in DB using optimized aggregation
          try {
            const orderAggregation = await db
              .collection('orders')
              .aggregate([
                { $match: { user_email: normalizedEmail, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$pages_credited' } } },
              ])
              .toArray();

            const totalFromOrders = (orderAggregation[0]?.total as number) || 0;
            if (user.purchased_pages < totalFromOrders) {
              const updatedTier: UserRecord['tier'] =
                totalFromOrders >= 5000
                  ? 'enterprise'
                  : totalFromOrders >= 1000
                  ? 'pro'
                  : totalFromOrders > 0
                  ? 'starter'
                  : user.tier;

              user.purchased_pages = totalFromOrders;
              user.tier = updatedTier;

              await usersCollection.updateOne(
                { email: normalizedEmail },
                {
                  $set: {
                    purchased_pages: totalFromOrders,
                    tier: updatedTier,
                    updated_at: new Date(),
                  },
                }
              );
            }
          } catch (orderErr) {
            console.warn('Order reconciliation warning:', (orderErr as Error).message);
          }
        }

        return user;
      }
    } catch (err) {
      console.warn('⚠️ MongoDB User lookup fallback to memory:', (err as Error).message);
    }

    // Memory fallback
    if (!memoryUsers.has(normalizedEmail)) {
      const now = new Date();
      memoryUsers.set(normalizedEmail, {
        email: normalizedEmail,
        name: name || 'User',
        image: image || null,
        tier: 'free',
        pages_processed: 0,
        free_pages_limit: 10,
        purchased_pages: 0,
        created_at: now,
        updated_at: now,
      });
    }
    return memoryUsers.get(normalizedEmail)!;
  }, { email: normalizedEmail });
}

export async function getUserQuota(email?: string | null): Promise<{
  isLoggedIn: boolean;
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  freePagesRemaining: number;
  totalPagesProcessed: number;
  maxFreePages: number;
  purchasedPages: number;
  totalAvailablePages: number;
}> {
  if (!email) {
    return {
      isLoggedIn: false,
      tier: 'free',
      freePagesRemaining: 10,
      totalPagesProcessed: 0,
      maxFreePages: 10,
      purchasedPages: 0,
      totalAvailablePages: 10,
    };
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await findOrCreateUser(normalizedEmail);
    const purchased = typeof user.purchased_pages === 'number' ? user.purchased_pages : 0;
    const freeLimit = typeof user.free_pages_limit === 'number' ? user.free_pages_limit : 10;
    const processed = typeof user.pages_processed === 'number' ? user.pages_processed : 0;
    const totalAllowed = freeLimit + purchased;
    const remaining = Math.max(0, totalAllowed - processed);

    return {
      isLoggedIn: true,
      tier: user.tier || 'free',
      freePagesRemaining: remaining,
      totalPagesProcessed: processed,
      maxFreePages: freeLimit,
      purchasedPages: purchased,
      totalAvailablePages: totalAllowed,
    };
  } catch {
    return {
      isLoggedIn: true,
      tier: 'free',
      freePagesRemaining: 10,
      totalPagesProcessed: 0,
      maxFreePages: 10,
      purchasedPages: 0,
      totalAvailablePages: 10,
    };
  }
}

export async function getUserStats(email: string): Promise<{
  user: UserRecord;
  stats: {
    totalDocuments: number;
    totalPagesProcessed: number;
    creditsRemaining: number;
    totalAvailableCredits: number;
    purchasedCredits: number;
    freeCredits: number;
    tier: string;
  };
}> {
  const normalizedEmail = email.toLowerCase().trim();

  return await measureDbQuery('getUserStats', async () => {
    // Run user lookup and count query concurrently
    const [user, totalDocuments] = await Promise.all([
      findOrCreateUser(normalizedEmail),
      (async () => {
        try {
          const db = await getDatabase();
          if (db) {
            return await db.collection('extractions').countDocuments({ user_email: normalizedEmail });
          }
        } catch (err) {
          console.warn('⚠️ MongoDB countDocuments fallback:', (err as Error).message);
        }
        const { getMemoryDocumentCount } = await import('./Document');
        return getMemoryDocumentCount(normalizedEmail);
      })(),
    ]);

    const purchased = typeof user.purchased_pages === 'number' ? user.purchased_pages : 0;
    const freeLimit = typeof user.free_pages_limit === 'number' ? user.free_pages_limit : 10;
    const processed = typeof user.pages_processed === 'number' ? user.pages_processed : 0;
    const totalAllowed = freeLimit + purchased;
    const remaining = Math.max(0, totalAllowed - processed);

    return {
      user,
      stats: {
        totalDocuments,
        totalPagesProcessed: processed,
        creditsRemaining: remaining,
        totalAvailableCredits: totalAllowed,
        purchasedCredits: purchased,
        freeCredits: freeLimit,
        tier: user.tier || 'free',
      },
    };
  }, { email: normalizedEmail });
}

export async function incrementUserPageCount(email: string, pageCount: number): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();

  await measureDbQuery('incrementUserPageCount', async () => {
    try {
      const db = await getDatabase();
      if (db) {
        const usersCollection = db.collection<UserRecord>('users');
        const now = new Date();
        await usersCollection.updateOne(
          { email: normalizedEmail },
          {
            $inc: { pages_processed: pageCount },
            $set: { updated_at: now },
            $setOnInsert: {
              email: normalizedEmail,
              name: null,
              image: null,
              tier: 'free',
              free_pages_limit: 10,
              purchased_pages: 0,
              created_at: now,
            },
          },
          { upsert: true }
        );
        return;
      }
    } catch (err) {
      console.warn('⚠️ MongoDB increment fallback to memory:', (err as Error).message);
    }

    const mem = memoryUsers.get(normalizedEmail);
    if (mem) {
      mem.pages_processed = (mem.pages_processed || 0) + pageCount;
      mem.updated_at = new Date();
    }
  }, { email: normalizedEmail, pageCount });
}

export async function addPurchasedPages(
  email: string,
  pageCount: number,
  newTier?: UserRecord['tier']
): Promise<UserRecord> {
  const normalizedEmail = email.toLowerCase().trim();

  return await measureDbQuery('addPurchasedPages', async () => {
    const existingUser = await findOrCreateUser(normalizedEmail);
    // Tiers only ever go up: buying a smaller pack after a bigger one must not downgrade the account.
    const tierRank: Record<UserRecord['tier'], number> = { free: 0, starter: 1, pro: 2, enterprise: 3 };
    const candidateTier = newTier || 'starter';
    const updatedTier = tierRank[candidateTier] > tierRank[existingUser.tier || 'free'] ? candidateTier : (existingUser.tier || 'free');

    try {
      const db = await getDatabase();
      if (db) {
        const usersCollection = db.collection<UserRecord>('users');
        const now = new Date();
        const updated = await usersCollection.findOneAndUpdate(
          { email: normalizedEmail },
          {
            $inc: { purchased_pages: pageCount },
            $set: {
              tier: updatedTier,
              updated_at: now,
            },
          },
          { returnDocument: 'after', upsert: true }
        );

        if (updated) {
          const freshUser = updated as unknown as UserRecord;
          memoryUsers.set(normalizedEmail, freshUser);
          return freshUser;
        }
      }
    } catch (err) {
      console.warn('⚠️ MongoDB addPurchasedPages fallback to memory:', (err as Error).message);
    }

    const currentPurchased = typeof existingUser.purchased_pages === 'number' ? existingUser.purchased_pages : 0;
    const mem: UserRecord = {
      ...existingUser,
      purchased_pages: currentPurchased + pageCount,
      tier: updatedTier,
      updated_at: new Date(),
    };
    memoryUsers.set(normalizedEmail, mem);
    return mem;
  }, { email: normalizedEmail, pageCount });
}

export async function deleteUserAccount(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();

  return await measureDbQuery('deleteUserAccount', async () => {
    try {
      const db = await getDatabase();
      if (db) {
        const usersCollection = db.collection<UserRecord>('users');
        const result = await usersCollection.deleteOne({ email: normalizedEmail });
        memoryUsers.delete(normalizedEmail);
        return result.deletedCount > 0;
      }
    } catch (err) {
      console.warn('⚠️ MongoDB deleteUserAccount fallback to memory:', (err as Error).message);
    }

    const existed = memoryUsers.has(normalizedEmail);
    memoryUsers.delete(normalizedEmail);
    return existed;
  }, { email: normalizedEmail });
}
