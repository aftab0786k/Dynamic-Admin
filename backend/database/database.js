import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URL;
    if (!mongoURI) {
      console.error('❌ MONGODB_URL not set in environment');
      process.exit(1);
    }

    // Connection options
    const options = {
      serverSelectionTimeoutMS: 5000,    // Fail fast if can't select server
      connectTimeoutMS: 10000,           // Socket timeout for initial connection
      socketTimeoutMS: 45000,            // Socket timeout for operations
    };

    console.log('📡 Attempting MongoDB connection...');
    await mongoose.connect(mongoURI, options);

    // Set up connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully to:', 
        mongoose.connection.host,
        'Database:', mongoose.connection.name);
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error after initial connection:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('🔌 MongoDB disconnected');
    });

    // Handle application shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB disconnect:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error(`
🔧 Troubleshooting steps:
1. Check your MongoDB Atlas dashboard: https://cloud.mongodb.com
2. Make sure your IP is whitelisted in Network Access
3. Verify username and password are correct
4. Check if the cluster is running (green/active)
5. Try connecting from MongoDB Compass to test credentials

Need help? Copy this command to check your IP:
curl https://api.ipify.org
`);
    process.exit(1);
  }
};

export default connectDB;
