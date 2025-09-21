import { NextRequest, NextResponse } from 'next/server';
import { deleteAllPostsAndCommentsWithBackup, deleteAllPostsWithBackup, deleteAllCommentsWithBackup } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { type, confirmationCode } = await request.json();

    // Require confirmation code to prevent accidental deletion
    const expectedConfirmationCode = 'DELETE_ALL_DATA_PERMANENTLY';
    if (confirmationCode !== expectedConfirmationCode) {
      return NextResponse.json(
        {
          error: 'Deletion requires confirmation code. This action cannot be undone.',
          requiredConfirmationCode: expectedConfirmationCode
        },
        { status: 400 }
      );
    }

    switch (type) {
      case 'all':
        deleteAllPostsAndCommentsWithBackup();
        return NextResponse.json({
          message: 'All posts and comments deleted successfully. Backup created before deletion.'
        });
      case 'posts':
        deleteAllPostsWithBackup();
        return NextResponse.json({
          message: 'All posts deleted successfully. Backup created before deletion.'
        });
      case 'comments':
        deleteAllCommentsWithBackup();
        return NextResponse.json({
          message: 'All comments deleted successfully. Backup created before deletion.'
        });
      default:
        return NextResponse.json(
          { error: 'Invalid deletion type. Use "all", "posts", or "comments"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Delete all error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
