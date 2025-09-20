import { NextRequest, NextResponse } from 'next/server';
import { voteOnComment, removeCommentVote, getUserCommentVote } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const commentId = parseInt(id);
    const { voteType } = await request.json();

    if (voteType !== 1 && voteType !== -1) {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be 1 (upvote) or -1 (downvote)' },
        { status: 400 }
      );
    }

    // Check if user already voted
    const existingVote = getUserCommentVote(user.id, commentId);

    if (existingVote && existingVote.vote_type === voteType) {
      // Remove vote if clicking the same vote type
      removeCommentVote(user.id, commentId);
      return NextResponse.json({ message: 'Vote removed' });
    } else {
      // Add or update vote
      voteOnComment(user.id, commentId, voteType);
      return NextResponse.json({ message: 'Vote recorded' });
    }
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
