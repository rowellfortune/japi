import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../lib/db';
import { handler, json, parseBody, type ApiEvent } from '../lib/http';
import { isAdminRequest } from '../lib/auth';
import { User } from '../models/User';
import { isValidEmail, isNonEmptyString } from '../utils/validators';

const signToken = (user: { id: string; email: string; role: string }) =>
  jwt.sign(user, process.env.JWT_SECRET as string, { expiresIn: '7d' });

// Mirrors authController.register.
export const register = handler(async (event: ApiEvent) => {
  await db();
  const { email, password, role } = parseBody<{ email?: string; password?: string; role?: string }>(event);

  if (!isValidEmail(email || '') || !isNonEmptyString(password)) {
    return json(400, { error: 'Valid email and password required' });
  }

  const existing = await User.findOne({ email });
  if (existing) return json(409, { error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  // Only an already-authenticated admin may mint another admin account; anonymous callers
  // always get 'passenger'. The first admin must be created directly in the database (seed).
  const grantAdmin = role === 'admin' && isAdminRequest(event);
  const user = await User.create({ email, passwordHash, role: grantAdmin ? 'admin' : 'passenger' });

  const token = signToken({ id: String(user._id), email: user.email, role: user.role });
  return json(201, { token, user: { id: user._id, email: user.email, role: user.role } });
});

// Mirrors authController.login.
export const login = handler(async (event: ApiEvent) => {
  await db();
  const { email, password } = parseBody<{ email?: string; password?: string }>(event);

  if (!isValidEmail(email || '') || !isNonEmptyString(password)) {
    return json(400, { error: 'Valid email and password required' });
  }

  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) return json(401, { error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return json(401, { error: 'Invalid credentials' });

  const token = signToken({ id: String(user._id), email: user.email, role: user.role });
  return json(200, { token, user: { id: user._id, email: user.email, role: user.role } });
});
