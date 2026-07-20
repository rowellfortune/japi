import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export const connectDB = async () => {
  try {
    if (!env.mongodbUri) throw new Error('MONGODB_URI not defined');

    await mongoose.connect(env.mongodbUri);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};
