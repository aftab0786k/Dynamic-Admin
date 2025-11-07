import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Build a safe mongo URI that ensures the database name is inserted
 * before any query string. Handles these common forms of MONGODB_URL:
 *  - <base>/?params
 *  - <base>?params
 *  - <base>/<dbname>?params
 *  - <base>
 */
function buildMongoURI(raw, dbName = 'dynamic') {
  if (!raw || typeof raw !== 'string') return null;

  // if URI already contains a non-empty path (i.e. db name present) leave it
  // match: scheme://host/... (where ... is not empty and not just '/')
  const hasDbPath = /mongodb(?:\+srv)?:\/\/[^/]+\/[^?\/]+/.test(raw);
  if (hasDbPath) return raw;

  // Case: contains '/?' sequence like '...net/?retryWrites...'
  if (raw.includes('/?')) {
    return raw.replace('/?', `/${dbName}?`);
  }

  // Case: contains '?' but not '/?'
  if (raw.includes('?')) {
    return raw.replace('?', `/${dbName}?`);
  }

  // Case: ends with '/' -> append dbName
  if (raw.endsWith('/')) return raw + dbName;

  // Default: append '/<dbName>'
  return `${raw}/${dbName}`;
}

const connectDB = async () => {
  try {
    const raw = process.env.MONGODB_URL;
    if (!raw) {
      console.error('❌ MONGODB_URL not set in environment');
      return;
    }

    const mongoURI = buildMongoURI(raw, 'dynamic');

    // Connect (mongoose 6+ no longer requires useNewUrlParser/useUnifiedTopology flags,
    // but passing them is harmless if present. Remove if your mongoose version warns.)
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB is connected');
  } catch (error) {
    console.error('❌ MongoDB not connected:', error && error.message ? error.message : error);
  }
};

export default connectDB;
