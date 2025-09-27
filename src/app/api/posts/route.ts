import { NextRequest, NextResponse } from 'next/server';
import { createPost, getAllPosts } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { containsProfanity } from '@/lib/profanityFilter';

export async function GET() {
  try {
    const posts = getAllPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    console.log('POST /api/posts - Current user:', user ? { id: user.id, username: user.username, displayName: user.displayName } : 'null');

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
        { error: 'You are muted and cannot create posts' },
        { status: 403 }
      );
    }

    const { title, content, categoryId } = await request.json();

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    if (title.length < 3 || title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be between 3 and 200 characters' },
        { status: 400 }
      );
    }

    if (content.length < 10 || content.length > 5000) {
      return NextResponse.json(
        { error: 'Content must be between 10 and 5000 characters' },
        { status: 400 }
      );
    }

    // Check for profanity
    if (containsProfanity(title) || containsProfanity(content)) {
      return NextResponse.json(
        { error: 'Your post contains inappropriate content that is not allowed' },
        { status: 400 }
      );
    }

    const result = createPost(title, content, user.id, categoryId);

    return NextResponse.json(
      { message: 'Post created successfully', postId: result.lastInsertRowid },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
