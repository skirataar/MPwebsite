import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL || process.env.MONGODB_URI || "";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  console.warn("Please add your Mongo URI to .env.local as DATABASE_URL or MONGODB_URI");
  clientPromise = Promise.reject(new Error("Missing Mongo URI in environment variables."));
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
  }
}

export default clientPromise;
