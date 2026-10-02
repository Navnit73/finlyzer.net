import { getDatabase } from '../mongodb';

export interface UserRecord {
  _id?: string;
  email: string;
  name?: string | null;
  image?: string | null;
  tier: 'free' | 'pro' | 'enterprise';
  pages_processed: number;
  free_pages_limit: number;
  created_at: Date;
  updated_at: Date;
}

// In-memory fallback if MongoDB is not running locally during development
const memoryUsers = new Map<string, UserRecord>();

export async function findOrCreateUser(email: string, name?: string | null, image?: string | null): Promise<UserRecord> {
  const db = await getDatabase();
  
  if (!db) {
    if (!memoryUsers.has(email)) {
      memoryUsers.set(email, {
        email,
        name: name || 'Demo User',
        image: image || null,
        tier: 'free',
        pages_processed: 0,
        free_pages_limit: 10,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
    return memoryUsers.get(email)!;
  }

  const usersCollection = db.collection<UserRecord>('users');
  let user = await usersCollection.findOne({ email });

  if (!user) {
    const newUser: UserRecord = {
      email,
      name: name || null,
      image: image || null,
      tier: 'free',
      pages_processed: 0,
      free_pages_limit: 10,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = await usersCollection.insertOne(newUser as unknown as import('mongodb').OptionalUnlessRequiredId<UserRecord>);
    user = { ...newUser, _id: result.insertedId.toString() };
  }

  return user;
}

export async function getUserQuota(email?: string | null): Promise<{
  isLoggedIn: boolean;
  tier: 'free' | 'pro' | 'enterprise';
  freePagesRemaining: number;
  totalPagesProcessed: number;
  maxFreePages: number;
}> {
  if (!email) {
    return {
      isLoggedIn: false,
      tier: 'free',
      freePagesRemaining: 10,
      totalPagesProcessed: 0,
      maxFreePages: 10,
    };
  }

  const user = await findOrCreateUser(email);
  const remaining = Math.max(0, user.free_pages_limit - user.pages_processed);

  return {
    isLoggedIn: true,
    tier: user.tier,
    freePagesRemaining: user.tier === 'pro' ? 99999 : remaining,
    totalPagesProcessed: user.pages_processed,
    maxFreePages: user.free_pages_limit,
  };
}

export async function incrementUserPageCount(email: string, pageCount: number): Promise<void> {
  const db = await getDatabase();
  if (!db) {
    const mem = memoryUsers.get(email);
    if (mem) {
      mem.pages_processed += pageCount;
      mem.updated_at = new Date();
    }
    return;
  }

  const usersCollection = db.collection<UserRecord>('users');
  await usersCollection.updateOne(
    { email },
    {
      $inc: { pages_processed: pageCount },
      $set: { updated_at: new Date() }
    },
    { upsert: true }
  );
}
