import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    console.log('GET /api/admin/users - Current user:', user ? { id: user.id, username: user.username, isAdmin: user.isAdmin } : 'null');

    if (!user || !user.isAdmin) {
      console.log('GET /api/admin/users - Access denied. User:', user);
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const users = getAllUsers();
    console.log('GET /api/admin/users - Fetched users count:', users.length);
    console.log('GET /api/admin/users - Users:', users.map(u => ({ id: u.id, username: u.username, display_name: u.display_name })));

    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
