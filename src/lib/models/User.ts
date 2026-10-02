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
      } else if (user.purchased_pages === undefined) {
        // Upgrade existing records
        user.purchased_pages = 0;
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
    const purchased = user.purchased_pages || 0;
    const totalAllowed = (user.free_pages_limit || 10) + purchased;
    const remaining = Math.max(0, totalAllowed - (user.pages_processed || 0));

    return {
      isLoggedIn: true,
      tier: user.tier,
      freePagesRemaining: user.tier === 'enterprise' ? 99999 : remaining,
      totalPagesProcessed: user.pages_processed || 0,
      maxFreePages: user.free_pages_limit || 10,
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

  const purchased = user.purchased_pages || 0;
  const freeLimit = user.free_pages_limit || 10;
  const totalAllowed = freeLimit + purchased;
  const remaining = user.tier === 'enterprise' ? 99999 : Math.max(0, totalAllowed - (user.pages_processed || 0));

  return {
    user,
    stats: {
      totalDocuments,
      totalPagesProcessed: user.pages_processed || 0,
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
    mem.pages_processed += pageCount;
    mem.updated_at = new Date();
  }
}

export async function addPurchasedPages(email: string, pageCount: number, newTier?: UserRecord['tier']): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  
  try {
    const db = await getDatabase();
    if (db) {
      const usersCollection = db.collection<UserRecord>('users');
      const updateDoc: Record<string, unknown> = {
        $inc: { purchased_pages: pageCount },
        $set: { updated_at: new Date() },
      };
      if (newTier) {
        (updateDoc.$set as Record<string, unknown>).tier = newTier;
      }
      await usersCollection.updateOne({ email: normalizedEmail }, updateDoc, { upsert: true });
      return;
    }
  } catch (err) {
    console.warn('⚠️ MongoDB addPurchasedPages fallback to memory:', (err as Error).message);
  }

  const mem = memoryUsers.get(normalizedEmail);
  if (mem) {
    mem.purchased_pages = (mem.purchased_pages || 0) + pageCount;
    if (newTier) mem.tier = newTier;
    mem.updated_at = new Date();
  }
}
