import { NextRequest, NextResponse } from 'next/server';
import { deleteAllPostsAndComments, deleteAllPosts, deleteAllComments } from '@/lib/database';
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

    const { type } = await request.json();

    switch (type) {
      case 'all':
        deleteAllPostsAndComments();
        return NextResponse.json({ message: 'All posts and comments deleted successfully' });
      case 'posts':
        deleteAllPosts();
        return NextResponse.json({ message: 'All posts deleted successfully' });
      case 'comments':
        deleteAllComments();
        return NextResponse.json({ message: 'All comments deleted successfully' });
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
