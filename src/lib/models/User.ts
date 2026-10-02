import { getDatabase } from '../mongodb';

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

export async function findOrCreateUser(email: string, name?: string | null, image?: string | null): Promise<UserRecord> {
  const normalizedEmail = email.toLowerCase().trim();
  
  try {
    const db = await getDatabase();
    if (db) {
      const usersCollection = db.collection<UserRecord>('users');
      let user = await usersCollection.findOne({ email: normalizedEmail });

      if (!user) {
        const newUser: UserRecord = {
          email: normalizedEmail,
          name: name || null,
          image: image || null,
          tier: 'free',
          pages_processed: 0,
          free_pages_limit: 10,
          purchased_pages: 0,
          created_at: new Date(),
          updated_at: new Date(),
        };
        const result = await usersCollection.insertOne(newUser as unknown as import('mongodb').OptionalUnlessRequiredId<UserRecord>);
        user = { ...newUser, _id: result.insertedId.toString() };
      } else if (user.purchased_pages === undefined || user.purchased_pages === null) {
        user.purchased_pages = 0;
        await usersCollection.updateOne(
          { email: normalizedEmail },
          { $set: { purchased_pages: 0, updated_at: new Date() } }
        );
      }

      return user;
    }
  } catch (err) {
    console.warn('⚠️ MongoDB User lookup fallback to memory:', (err as Error).message);
  }

  // Memory fallback
  if (!memoryUsers.has(normalizedEmail)) {
    memoryUsers.set(normalizedEmail, {
      email: normalizedEmail,
      name: name || 'User',
      image: image || null,
      tier: 'free',
      pages_processed: 0,
      free_pages_limit: 10,
      purchased_pages: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
  return memoryUsers.get(normalizedEmail)!;
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
      freePagesRemaining: user.tier === 'enterprise' ? 99999 : remaining,
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
  const user = await findOrCreateUser(normalizedEmail);

  let totalDocuments = 0;
  try {
    const db = await getDatabase();
    if (db) {
      totalDocuments = await db.collection('extractions').countDocuments({ user_email: normalizedEmail });
    }
  } catch (err) {
    console.warn('⚠️ MongoDB countDocuments fallback:', (err as Error).message);
  }

  const purchased = typeof user.purchased_pages === 'number' ? user.purchased_pages : 0;
  const freeLimit = typeof user.free_pages_limit === 'number' ? user.free_pages_limit : 10;
  const processed = typeof user.pages_processed === 'number' ? user.pages_processed : 0;
  const totalAllowed = freeLimit + purchased;
  const remaining = user.tier === 'enterprise' ? 99999 : Math.max(0, totalAllowed - processed);

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
}

export async function incrementUserPageCount(email: string, pageCount: number): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  
  try {
    const db = await getDatabase();
    if (db) {
      const usersCollection = db.collection<UserRecord>('users');
      await usersCollection.updateOne(
        { email: normalizedEmail },
        {
          $inc: { pages_processed: pageCount },
          $set: { updated_at: new Date() }
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
}

export async function addPurchasedPages(
  email: string,
  pageCount: number,
  newTier?: UserRecord['tier']
): Promise<UserRecord> {
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await findOrCreateUser(normalizedEmail);
  const currentPurchased = typeof existingUser.purchased_pages === 'number' ? existingUser.purchased_pages : 0;
  const updatedTier = newTier || (existingUser.tier === 'free' ? 'starter' : existingUser.tier);

  try {
    const db = await getDatabase();
    if (db) {
      const usersCollection = db.collection<UserRecord>('users');
      await usersCollection.updateOne(
        { email: normalizedEmail },
        {
          $inc: { purchased_pages: pageCount },
          $set: {
            tier: updatedTier,
            updated_at: new Date(),
          },
        },
        { upsert: true }
      );
      const freshUser = await usersCollection.findOne({ email: normalizedEmail });
      if (freshUser) {
        memoryUsers.set(normalizedEmail, freshUser);
        return freshUser;
      }
    }
  } catch (err) {
    console.warn('⚠️ MongoDB addPurchasedPages fallback to memory:', (err as Error).message);
  }

  const mem: UserRecord = {
    ...existingUser,
    purchased_pages: currentPurchased + pageCount,
    tier: updatedTier,
    updated_at: new Date(),
  };
  memoryUsers.set(normalizedEmail, mem);
  return mem;
}
