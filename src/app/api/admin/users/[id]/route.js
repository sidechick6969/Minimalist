import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { findUserById, deleteUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await findUserById(session.id);
    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Unwrap params in Next 15+
    const resolvedParams = await params;
    const userIdToDelete = resolvedParams.id;

    if (userIdToDelete === currentUser.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    await deleteUser(userIdToDelete);

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
