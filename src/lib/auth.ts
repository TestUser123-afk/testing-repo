import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { getUserById } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'ember-forum-secret-key-2025';
const ADMIN_USERNAME = 'Helix_Staff';
const ADMIN_PASSWORD = 'Helix_Staff_2025_Ember_Supreme!';

export interface UserSession {
  id: number;
  username: string;
  displayName: string;
  isAdmin: boolean;
  isBanned: boolean;
  isMuted: boolean;
}

interface DatabaseUser {
  id: number;
  username: string;
  display_name: string;
  is_banned: boolean;
  is_muted: boolean;
}

export function createToken(user: DatabaseUser): string {
  const isAdmin = user.username === ADMIN_USERNAME;
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      isAdmin,
      isBanned: user.is_banned,
      isMuted: user.is_muted
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
      id: number;
      username: string;
      displayName: string;
      isAdmin: boolean;
      isBanned: boolean;
      isMuted: boolean;
    };
    return {
      id: decoded.id,
      username: decoded.username,
      displayName: decoded.displayName,
      isAdmin: decoded.isAdmin,
      isBanned: decoded.isBanned,
      isMuted: decoded.isMuted
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    // Get fresh user data from database
    const user = getUserById(decoded.id);
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      isAdmin: decoded.isAdmin,
      isBanned: user.is_banned,
      isMuted: user.is_muted
    };
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<UserSession | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    // Get fresh user data from database
    const user = getUserById(decoded.id);
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      isAdmin: decoded.isAdmin,
      isBanned: user.is_banned,
      isMuted: user.is_muted
    };
  } catch {
    return null;
  }
}

export function isValidAdmin(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (real) {
    return real;
  }

  return '127.0.0.1'; // fallback
}
