import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Import database here to see what error occurs
    const { getAllCategories } = await import('@/lib/database');
    const categories = getAllCategories();

    return NextResponse.json({
      message: 'Database test successful',
      categoriesCount: categories.length
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
