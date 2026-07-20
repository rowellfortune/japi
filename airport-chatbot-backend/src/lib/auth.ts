import jwt from 'jsonwebtoken';
import type { ApiEvent } from './http';

// Ports middleware/auth.ts to the Lambda world. Instead of Express middleware that mutates
// req and calls next(), protected handlers call requireAdmin(event) and short-circuit on the
// returned error. Same JWT secret, same 401/403 semantics.

export interface AuthUser {
  id: string;
  email: string;
  role: 'passenger' | 'admin';
}

const bearer = (event: ApiEvent): string | undefined =>
  event.headers?.authorization?.split(' ')[1] ?? event.headers?.Authorization?.split(' ')[1];

const verify = (token: string): AuthUser | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as AuthUser;
  } catch {
    return null;
  }
};

// Best-effort decode for endpoints usable both anonymously and by admins (public baggage
// lookup, register). Never throws. Mirrors middleware/auth.ts:isAdminRequest.
export const isAdminRequest = (event: ApiEvent): boolean => {
  const token = bearer(event);
  if (!token) return false;
  return verify(token)?.role === 'admin';
};

// Returns the auth error to return, or null if the caller is a valid admin. Usage:
//   const denied = requireAdmin(event); if (denied) return denied;
export const requireAdmin = (event: ApiEvent): { statusCode: number; body: string; headers: Record<string, string> } | null => {
  const token = bearer(event);
  if (!token) return err(401, 'No token provided');
  const user = verify(token);
  if (!user) return err(403, 'Invalid token');
  if (user.role !== 'admin') return err(403, 'Admin access required');
  return null;
};

const err = (statusCode: number, message: string) => ({
  statusCode,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ error: message }),
});
