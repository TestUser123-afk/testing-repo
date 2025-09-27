import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    console.log('=== Admin Users API: Starting request ===');

    const user = await getCurrentUser();
    console.log('Admin Users API - Current user:', user ? {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      displayName: user.displayName
    } : 'null');

    if (!user) {
      console.log('Admin Users API - Access denied: No authenticated user');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!user.isAdmin) {
      console.log('Admin Users API - Access denied: User is not admin', {
        userId: user.id,
        username: user.username,
        isAdmin: user.isAdmin
      });
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log('Admin Users API - Admin access granted, fetching all users...');
    const users = getAllUsers();
    console.log('Admin Users API - Fetched users:', {
      count: users.length,
      userList: users.map(u => ({
        id: u.id,
        username: u.username,
        display_name: u.display_name,
        created_at: u.created_at
      }))
    });

    console.log('Admin Users API - Successfully returning users');
    return NextResponse.json(users);
  } catch (error) {
    console.error('Admin Users API - Error occurred:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
