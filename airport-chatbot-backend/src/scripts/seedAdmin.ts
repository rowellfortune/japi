import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';

const EMAIL = process.argv[2] || 'tunewebdesign@gmail.com';

const generatePassword = (): string => crypto.randomBytes(18).toString('base64url');

const run = async () => {
  if (!env.mongodbUri) throw new Error('MONGODB_URI not defined');
  await mongoose.connect(env.mongodbUri);

  const existing = await User.findOne({ email: EMAIL });
  if (existing) {
    console.log(`User ${EMAIL} already exists (role: ${existing.role}). No changes made.`);
    await mongoose.disconnect();
    return;
  }

  const password = generatePassword();
  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ email: EMAIL, passwordHash, role: 'admin' });

  console.log('Admin account created:');
  console.log(`  email:    ${EMAIL}`);
  console.log(`  password: ${password}`);
  console.log('Log in and note this password now - it will not be shown again.');

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
