import { MongoClient, Db, MongoClientOptions } from 'mongodb';

const rawUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finlyzer';
// Ensure standard Atlas query parameters if not present
const uri = rawUri.includes('?') ? rawUri : `${rawUri}?retryWrites=true&w=majority`;

const maxPoolSize = parseInt(process.env.MONGODB_MAX_POOL_SIZE || '20', 10);
const minPoolSize = parseInt(process.env.MONGODB_MIN_POOL_SIZE || '2', 10);
const serverSelectionTimeoutMS = parseInt(process.env.MONGODB_SERVER_TIMEOUT_MS || '5000', 10);
const connectTimeoutMS = parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS || '5000', 10);
const maxIdleTimeMS = parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS || '60000', 10);

const options: MongoClientOptions = {
  maxPoolSize,
  minPoolSize,
  serverSelectionTimeoutMS,
  connectTimeoutMS,
  maxIdleTimeMS,
  socketTimeoutMS: 45000,
  retryWrites: true,
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoIndexesEnsured: boolean | undefined;
  var _mongoLastFailureTime: number | undefined;
}

const CIRCUIT_BREAKER_COOLDOWN_MS = 5000; // Wait 5s before retrying failed connection

/**
 * Singleton MongoClient Promise manager across development and production
 */
function getClientPromise(): Promise<MongoClient> {
  // If recently failed, throw immediately to use memory fallback without blocking
  if (
    global._mongoLastFailureTime &&
    Date.now() - global._mongoLastFailureTime < CIRCUIT_BREAKER_COOLDOWN_MS
  ) {
    return Promise.reject(new Error('MongoDB connection is in circuit-breaker cooldown'));
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      // Record failure timestamp for circuit breaker
      global._mongoLastFailureTime = Date.now();
      global._mongoClientPromise = undefined;
      console.error('❌ [MongoDB Connection Error]:', (err as Error).message);
      throw err;
    });
  }
  return global._mongoClientPromise;
}

export default getClientPromise;

/**
 * Safely creates necessary production indexes idempotently in the background.
 */
export async function ensureDatabaseIndexes(db: Db): Promise<void> {
  if (global._mongoIndexesEnsured) return;
  global._mongoIndexesEnsured = true;

  try {
    // 1. Users Collection Indexes
    const usersCol = db.collection('users');
    await Promise.allSettled([
      usersCol.createIndex({ email: 1 }, { unique: true, background: true }),
      usersCol.createIndex({ created_at: -1 }, { background: true }),
      usersCol.createIndex({ tier: 1 }, { background: true }),
    ]);

    // 2. Extractions Collection Indexes
    const extractionsCol = db.collection('extractions');
    await Promise.allSettled([
      extractionsCol.createIndex({ id: 1 }, { unique: true, background: true }),
      extractionsCol.createIndex({ user_email: 1, created_at: -1 }, { background: true }),
      extractionsCol.createIndex({ user_email: 1, document_type: 1, created_at: -1 }, { background: true }),
      extractionsCol.createIndex({ job_id: 1 }, { sparse: true, background: true }),
      extractionsCol.createIndex({ status: 1 }, { background: true }),
    ]);

    // 3. Orders Collection Indexes
    const ordersCol = db.collection('orders');
    await Promise.allSettled([
      ordersCol.createIndex({ order_id: 1 }, { unique: true, background: true }),
      ordersCol.createIndex({ user_email: 1, created_at: -1 }, { background: true }),
      ordersCol.createIndex({ user_email: 1, status: 1 }, { background: true }),
      ordersCol.createIndex({ razorpay_order_id: 1 }, { sparse: true, background: true }),
      ordersCol.createIndex({ razorpay_payment_id: 1 }, { sparse: true, background: true }),
    ]);

    if (process.env.NODE_ENV !== 'production') {
      console.log('⚡ [MongoDB] Production compound indexes verified.');
    }
  } catch (indexErr) {
    console.warn('⚠️ [MongoDB] Index verification warning:', (indexErr as Error).message);
  }
}

/**
 * Get active MongoDB database instance with automatic connection pooling, circuit-breaker, and index validation.
 */
export async function getDatabase(dbName?: string): Promise<Db | null> {
  try {
    const connectedClient = await getClientPromise();
    // Clear failure timestamp on successful connection
    global._mongoLastFailureTime = undefined;

    const resolvedDbName = dbName || process.env.MONGODB_DB_NAME || 'finlyzer';
    const db = connectedClient.db(resolvedDbName);

    // Ensure indexes in background without blocking immediate query
    if (!global._mongoIndexesEnsured) {
      ensureDatabaseIndexes(db).catch(() => {});
    }

    return db;
  } catch (error) {
    if ((error as Error).message !== 'MongoDB connection is in circuit-breaker cooldown') {
      console.warn('⚠️ MongoDB connection warning (falling back to memory cache):', (error as Error).message);
    }
    return null;
  }
}
