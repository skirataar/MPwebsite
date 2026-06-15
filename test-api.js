const { MongoClient } = require('mongodb');
require('dotenv').config({ path: 'apps/web/.env.local' });

async function check() {
  const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('vmarket');
  const user = await db.collection('users').findOne({ role: { $in: ['SELLER', 'seller'] } });
  console.log('Seller:', user ? JSON.stringify(user, null, 2) : 'No seller found');
  process.exit(0);
}
check();
