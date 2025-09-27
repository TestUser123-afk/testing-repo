import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, verifyPassword } from '@/lib/database';
import { createToken, isValidAdmin } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Login API: Starting login request ===');

    const { username, password } = await request.json();
    console.log('Login API - Login attempt for username:', username);

    if (!username || !password) {
      console.log('Login API - Missing credentials');
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if admin login
    const isAdmin = isValidAdmin(username, password);
    console.log('Login API - Admin check result:', isAdmin);

    if (isAdmin) {
      console.log('Login API - Processing admin login');

      // Get the real admin user from database
      const adminUser = getUserByUsername(username);
      console.log('Login API - Admin user from database:', adminUser ? {
        id: adminUser.id,
        username: adminUser.username,
        display_name: adminUser.display_name
      } : 'null');

      if (!adminUser) {
        console.log('Login API - Admin user not found in database');
        return NextResponse.json(
          { error: 'Admin user not found in database' },
          { status: 500 }
        );
      }

      console.log('Login API - Creating admin token');
      const token = createToken(adminUser);
      const cookieStore = await cookies();

      console.log('Login API - Setting admin auth cookie');
      cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });

      console.log('Login API - Admin login successful:', {
        id: adminUser.id,
        username: adminUser.username,
        displayName: adminUser.display_name
      });

      const adminResponse = {
        message: 'Login successful',
        user: {
          id: adminUser.id,
          username: adminUser.username,
          displayName: adminUser.display_name,
          isAdmin: true,
          isBanned: adminUser.is_banned,
          isMuted: adminUser.is_muted
        }
      };

      console.log('Login API - Returning admin response:', adminResponse.user);
      return NextResponse.json(adminResponse);
    }

    // Regular user login
    console.log('Login API - Processing regular user login');
    const user = getUserByUsername(username);
    console.log('Login API - User from database:', user ? {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      is_banned: user.is_banned
    } : 'null');

    if (!user) {
      console.log('Login API - User not found');
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    console.log('Login API - Verifying password');
    if (!verifyPassword(password, user.password)) {
      console.log('Login API - Password verification failed');
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    if (user.is_banned) {
      console.log('Login API - User is banned');
      return NextResponse.json(
        { error: 'Your account has been banned' },
        { status: 403 }
      );
    }

    console.log('Login API - Creating user token');
    const token = createToken(user);
    const cookieStore = await cookies();

    console.log('Login API - Setting user auth cookie');
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    console.log('Login API - Regular user login successful:', {
      id: user.id,
      username: user.username,
      displayName: user.display_name
    });

    const userResponse = {
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        isAdmin: false,
        isBanned: user.is_banned,
        isMuted: user.is_muted
      }
    };

    console.log('Login API - Returning user response:', userResponse.user);
    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Login API - Error occurred:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
