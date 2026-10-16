import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { User, AuthSession } from './types.js';

// PBKDF2 configuration
const ITERATIONS = 100000;
const KEYLEN = 64;
const DIGEST = 'sha512';

export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}

import fs from 'fs';
import path from 'path';

// Stable token secret stored in data directory
const DATA_DIR = path.resolve(process.cwd(), 'data');
const SECRET_FILE = path.join(DATA_DIR, '.auth_secret');
let TOKEN_SECRET = process.env.AUTH_SECRET || '';

if (!TOKEN_SECRET) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(SECRET_FILE)) {
      TOKEN_SECRET = fs.readFileSync(SECRET_FILE, 'utf-8').trim();
    } else {
      TOKEN_SECRET = crypto.randomBytes(32).toString('hex');
      fs.writeFileSync(SECRET_FILE, TOKEN_SECRET, 'utf-8');
    }
  } catch {
    TOKEN_SECRET = 'truthlens_persistent_academic_secret_key_2026';
  }
}

// In-memory blacklist for explicitly revoked tokens
const revokedTokens = new Set<string>();

export function generateToken(userId: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `${userId}.${expiresAt}`;
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

export function revokeToken(token: string): void {
  revokedTokens.add(token);
}

export function getUserIdFromToken(token: string): string | null {
  if (!token || revokedTokens.has(token)) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [userId, expiresAtStr, signature] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || expiresAt < Date.now()) {
    return null;
  }

  const payload = `${userId}.${expiresAtStr}`;
  const expectedSignature = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');

  try {
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
    return isMatch ? userId : null;
  } catch {
    return null;
  }
}

// Express Request augmentation
export interface AuthenticatedRequest extends Request {
  user?: User;
  token?: string;
}

// Auth Middleware
export function authenticate(db: { getUserById: (id: string) => User | undefined }) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Please provide a valid Bearer token.' });
      return;
    }

    const token = authHeader.substring(7).trim();
    const userId = getUserIdFromToken(token);
    if (!userId) {
      res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
      return;
    }

    const user = db.getUserById(userId);
    if (!user) {
      res.status(401).json({ error: 'User account not found.' });
      return;
    }

    req.user = user;
    req.token = token;
    next();
  };
}

// Optional Auth Middleware (doesn't fail if no token, but populates req.user if present)
export function optionalAuthenticate(db: { getUserById: (id: string) => User | undefined }) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const userId = getUserIdFromToken(token);
      if (userId) {
        const user = db.getUserById(userId);
        if (user) {
          req.user = user;
          req.token = token;
        }
      }
    }
    next();
  };
}

// Admin only middleware
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access required for this action.' });
    return;
  }
  next();
}
