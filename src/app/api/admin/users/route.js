import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { findUserById, getUsers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await findUserById(session.id);
    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = (await getUsers()).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: !!user.isAdmin
    }));

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
