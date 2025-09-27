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
  const tokenPayload = {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    isAdmin,
    isBanned: user.is_banned,
    isMuted: user.is_muted,
    // Add a timestamp to ensure tokens are unique
    iat: Math.floor(Date.now() / 1000)
  };

  console.log('Creating token for user:', { id: user.id, username: user.username, isAdmin });

  return jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
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

    console.log('Token verified for user:', { id: decoded.id, username: decoded.username, isAdmin: decoded.isAdmin });

    return {
      id: decoded.id,
      username: decoded.username,
      displayName: decoded.displayName,
      isAdmin: decoded.isAdmin,
      isBanned: decoded.isBanned,
      isMuted: decoded.isMuted
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      console.log('getCurrentUser: No auth token found');
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('getCurrentUser: Token verification failed');
      return null;
    }

    // Get fresh user data from database to ensure up-to-date information
    const user = getUserById(decoded.id);
    if (!user) {
      console.log('getCurrentUser: User not found in database:', decoded.id);
      return null;
    }

    // Always determine admin status from username comparison
    const isAdmin = user.username === ADMIN_USERNAME;

    const currentUser = {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      isAdmin: isAdmin,
      isBanned: user.is_banned,
      isMuted: user.is_muted
    };

    console.log('getCurrentUser: Returning user:', { id: currentUser.id, username: currentUser.username, isAdmin: currentUser.isAdmin });

    return currentUser;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<UserSession | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      console.log('getUserFromRequest: No auth token found');
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('getUserFromRequest: Token verification failed');
      return null;
    }

    // Get fresh user data from database
    const user = getUserById(decoded.id);
    if (!user) {
      console.log('getUserFromRequest: User not found in database:', decoded.id);
      return null;
    }

    // Determine admin status dynamically from current username
    const isAdmin = user.username === ADMIN_USERNAME;

    const currentUser = {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      isAdmin: isAdmin,
      isBanned: user.is_banned,
      isMuted: user.is_muted
    };

    console.log('getUserFromRequest: Returning user:', { id: currentUser.id, username: currentUser.username, isAdmin: currentUser.isAdmin });

    return currentUser;
  } catch (error) {
    console.error('getUserFromRequest error:', error);
    return null;
  }
}

export function isValidAdmin(username: string, password: string): boolean {
  const isValid = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
  console.log('isValidAdmin check:', { username, isValid });
  return isValid;
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
