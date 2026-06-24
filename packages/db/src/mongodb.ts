import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL || process.env.MONGODB_URI || "";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  console.warn("Please add your Mongo URI to .env.local as DATABASE_URL or MONGODB_URI");
  // Use a lazy Thenable to prevent eager unhandled promise rejections at module load time (e.g. during next build)
  clientPromise = {
    then(onFulfilled, onRejected) {
      const err = new Error("Missing Mongo URI in environment variables.");
      if (onRejected) {
        onRejected(err);
      } else {
        throw err;
      }
    }
  } as unknown as Promise<MongoClient>;
} else {
  declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
    // Catch connection errors at module level to prevent crashing the build process
    // if the database is not accessible during the build phase.
    clientPromise.catch((err) => {
      console.error("[mongodb] Production connection failed:", err.message);
    });
  }
}

export default clientPromise;
