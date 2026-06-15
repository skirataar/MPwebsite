import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  console.warn('[db] DATABASE_URL is not set. DB calls will fail.');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache;
}

const cache: MongooseCache = globalThis._mongooseCache ?? { conn: null, promise: null };
globalThis._mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    if (!MONGODB_URI) {
      cache.promise = Promise.reject(new Error("DATABASE_URL or MONGODB_URI is not set."));
    } else {
      cache.promise = mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
      });
    }
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
