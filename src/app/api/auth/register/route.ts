import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByUsername } from '@/lib/database';
import { getClientIP } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password, displayName } = await request.json();

    // Validation
    if (!username || !password || !displayName) {
      return NextResponse.json(
        { error: 'Username, password, and display name are required' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 20 characters' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (displayName.length < 1 || displayName.length > 30) {
      return NextResponse.json(
        { error: 'Display name must be between 1 and 30 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Get client IP
    const ipAddress = getClientIP(request);

    // Create user
    const result = createUser(username, password, displayName, ipAddress);

    return NextResponse.json(
      { message: 'User created successfully', userId: result.lastInsertRowid },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
