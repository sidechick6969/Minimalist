import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { findUserById } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const user = await findUserById(session.id);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ 
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      isAdmin: !!user.isAdmin 
    } 
  }, { status: 200 });
}
