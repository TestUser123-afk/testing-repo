import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, verifyPassword } from '@/lib/database';
import { createToken, isValidAdmin } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if admin login
    if (isValidAdmin(username, password)) {
      // Get the real admin user from database
      const adminUser = getUserByUsername(username);
      if (!adminUser) {
        return NextResponse.json(
          { error: 'Admin user not found in database' },
          { status: 500 }
        );
      }

      const token = createToken(adminUser);
      const cookieStore = await cookies();

      cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });

      console.log('Admin user logged in:', { id: adminUser.id, username: adminUser.username });

      return NextResponse.json({
        message: 'Login successful',
        user: {
          id: adminUser.id,
          username: adminUser.username,
          displayName: adminUser.display_name,
          isAdmin: true,
          isBanned: adminUser.is_banned,
          isMuted: adminUser.is_muted
        }
      });
    }

    // Regular user login
    const user = getUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    if (user.is_banned) {
      return NextResponse.json(
        { error: 'Your account has been banned' },
        { status: 403 }
      );
    }

    const token = createToken(user);
    const cookieStore = await cookies();

    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    console.log('Regular user logged in:', { id: user.id, username: user.username });

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        isAdmin: false,
        isBanned: user.is_banned,
        isMuted: user.is_muted
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
