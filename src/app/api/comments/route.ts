import { NextRequest, NextResponse } from 'next/server';
import { createComment } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { containsProfanity } from '@/lib/profanityFilter';

export async function POST(request: NextRequest) {
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

    if (user.isMuted) {
      return NextResponse.json(
        { error: 'You are muted and cannot comment' },
        { status: 403 }
      );
    }

    const { content, postId } = await request.json();

    if (!content || !postId) {
      return NextResponse.json(
        { error: 'Content and post ID are required' },
        { status: 400 }
      );
    }

    if (content.length < 1 || content.length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be between 1 and 2000 characters' },
        { status: 400 }
      );
    }

    // Check for profanity
    if (containsProfanity(content)) {
      return NextResponse.json(
        { error: 'Your comment contains inappropriate content that is not allowed' },
        { status: 400 }
      );
    }

    const result = createComment(content, user.id, postId);

    return NextResponse.json(
      { message: 'Comment created successfully', commentId: result.lastInsertRowid },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
