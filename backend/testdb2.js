import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function testMongoDirectly() {
  const uri = process.env.MONGODB_URL;
  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });

  try {
    console.log('Attempting to connect...');
    await client.connect();
    
    // Try to list databases as a connection test
    const adminDb = client.db('admin');
    const result = await adminDb.command({ ping: 1 });
    console.log('Ping successful:', result);

    // List databases we can access
    const dbs = await client.db().admin().listDatabases();
    console.log('Available databases:', dbs.databases.map(db => db.name).join(', '));

    console.log('✅ Connection successful!');
  } catch (err) {
    console.error('❌ Connection error:', err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

testMongoDirectly().catch(console.error);