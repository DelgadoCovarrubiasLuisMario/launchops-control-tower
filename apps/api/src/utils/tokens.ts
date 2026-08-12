import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type AuthTokenPayload = {
  sub: number;
  name: string;
  email: string;
  role: 'admin' | 'engineer' | 'viewer';
  organizationId: number;
};

export function signAccessToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '8h' });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as unknown as AuthTokenPayload;
}
