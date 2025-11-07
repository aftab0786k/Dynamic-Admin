import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    
    // Get connection string
    const mongoURI = process.env.MONGODB_URL;
    if (!mongoURI) {
      throw new Error('MONGODB_URL not set in .env file');
    }

    // Try to connect
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    console.log('✅ MongoDB Connection successful!');
    console.log('Connected to database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    
    await mongoose.disconnect();
    console.log('Disconnected successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();