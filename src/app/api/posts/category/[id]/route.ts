import { NextRequest, NextResponse } from 'next/server';
import { getPostsByCategory } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const posts = getPostsByCategory(categoryId);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Get posts by category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
