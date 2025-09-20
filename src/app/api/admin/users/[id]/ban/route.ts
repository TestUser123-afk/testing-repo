import { NextRequest, NextResponse } from 'next/server';
import { banUser, unbanUser } from '@/lib/database';
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

    if (action === 'ban') {
      banUser(userId);
      return NextResponse.json({ message: 'User banned successfully' });
    } else if (action === 'unban') {
      unbanUser(userId);
      return NextResponse.json({ message: 'User unbanned successfully' });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "ban" or "unban"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Ban/unban user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
