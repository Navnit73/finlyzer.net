import { MongoClient, Db } from 'mongodb';

const rawUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finlyzer';
// Ensure standard Atlas query parameters if not present
const uri = rawUri.includes('?') ? rawUri : `${rawUri}?retryWrites=true&w=majority`;

const options = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}


function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect().catch((err) => {
        // Reset cached promise on failure so subsequent calls can retry
        global._mongoClientPromise = undefined;
        throw err;
      });
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri, options);
      clientPromise = client.connect().catch((err) => {
        clientPromise = null;
        throw err;
      });
    }
    return clientPromise;
  }
}

export default getClientPromise;

export async function getDatabase(dbName = 'finlyzer'): Promise<Db | null> {
  try {
    const connectedClient = await getClientPromise();
    return connectedClient.db(dbName);
  } catch (error) {
    console.warn('⚠️ MongoDB connection warning (falling back to memory cache):', (error as Error).message);
    return null;
  }
}
