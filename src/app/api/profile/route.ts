import { NextRequest, NextResponse } from 'next/server';
import { updateUserDisplayName } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: 'Your account has been banned' },
        { status: 403 }
      );
    }

    const { displayName } = await request.json();

    if (!displayName) {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      );
    }

    if (displayName.length < 1 || displayName.length > 30) {
      return NextResponse.json(
        { error: 'Display name must be between 1 and 30 characters' },
        { status: 400 }
      );
    }

    updateUserDisplayName(user.id, displayName);

    return NextResponse.json({ message: 'Display name updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
