import { NextRequest, NextResponse } from 'next/server';
import { deleteUser, verifyPassword, getUserById } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required to delete account' },
        { status: 400 }
      );
    }

    // Get the user's current password hash from database
    const dbUser = getUserById(user.id);
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify the password
    if (!verifyPassword(password, dbUser.password)) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Prevent deletion of admin account
    if (dbUser.username === 'Helix_Staff') {
      return NextResponse.json(
        { error: 'Admin account cannot be deleted' },
        { status: 403 }
      );
    }

    // Delete the user and all their data
    const result = deleteUser(user.id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Account could not be deleted' },
        { status: 500 }
      );
    }

    // Clear the auth cookie
    const response = NextResponse.json({
      message: 'Account deleted successfully'
    });

    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
