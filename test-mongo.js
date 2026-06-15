const { MongoClient } = require('mongodb');
require('dotenv').config({ path: 'apps/web/.env.local' });
const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;
console.log("URI:", uri ? "Found" : "Missing");
const client = new MongoClient(uri);
client.connect().then(() => {
  console.log("Connected to MongoDB successfully!");
  process.exit(0);
}).catch(err => {
  console.error("Connection failed:", err);
  process.exit(1);
});
