import { NextRequest, NextResponse } from 'next/server';
import { createPost, getAllPosts } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { containsProfanity } from '@/lib/profanityFilter';

export async function GET() {
  try {
    console.log('=== Posts API GET: Fetching all posts ===');
    const posts = getAllPosts();
    console.log('Posts API GET - Fetched posts count:', posts.length);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Posts API GET - Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Posts API POST: Starting post creation ===');

    const user = await getCurrentUser();
    console.log('Posts API POST - Current user:', user ? {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      isAdmin: user.isAdmin
    } : 'null');

    if (!user) {
      console.log('Posts API POST - Authentication required');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.isBanned) {
      console.log('Posts API POST - User is banned:', user.username);
      return NextResponse.json(
        { error: 'Your account has been banned' },
        { status: 403 }
      );
    }

    if (user.isMuted) {
      console.log('Posts API POST - User is muted:', user.username);
      return NextResponse.json(
        { error: 'You are muted and cannot create posts' },
        { status: 403 }
      );
    }

    const { title, content, categoryId } = await request.json();
    console.log('Posts API POST - Post data:', {
      title: title?.substring(0, 50) + '...',
      contentLength: content?.length,
      categoryId,
      authorId: user.id,
      authorUsername: user.username
    });

    if (!title || !content || !categoryId) {
      console.log('Posts API POST - Missing required fields');
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    if (title.length < 3 || title.length > 200) {
      console.log('Posts API POST - Invalid title length:', title.length);
      return NextResponse.json(
        { error: 'Title must be between 3 and 200 characters' },
        { status: 400 }
      );
    }

    if (content.length < 10 || content.length > 5000) {
      console.log('Posts API POST - Invalid content length:', content.length);
      return NextResponse.json(
        { error: 'Content must be between 10 and 5000 characters' },
        { status: 400 }
      );
    }

    // Check for profanity
    if (containsProfanity(title) || containsProfanity(content)) {
      console.log('Posts API POST - Profanity detected for user:', user.username);
      return NextResponse.json(
        { error: 'Your post contains inappropriate content that is not allowed' },
        { status: 400 }
      );
    }

    console.log('Posts API POST - Creating post with user ID:', user.id);
    const result = createPost(title, content, user.id, categoryId);
    console.log('Posts API POST - Post created successfully:', {
      postId: result.lastInsertRowid,
      authorId: user.id,
      authorUsername: user.username,
      authorDisplayName: user.displayName
    });

    return NextResponse.json(
      {
        message: 'Post created successfully',
        postId: result.lastInsertRowid,
        author: {
          id: user.id,
          username: user.username,
          displayName: user.displayName
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Posts API POST - Error occurred:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
