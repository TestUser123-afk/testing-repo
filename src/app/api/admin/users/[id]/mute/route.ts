import { NextRequest, NextResponse } from 'next/server';
import { muteUser, unmuteUser } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const { action } = await request.json();

    if (action === 'mute') {
      muteUser(userId);
      return NextResponse.json({ message: 'User muted successfully' });
    } else if (action === 'unmute') {
      unmuteUser(userId);
      return NextResponse.json({ message: 'User unmuted successfully' });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "mute" or "unmute"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Mute/unmute user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
