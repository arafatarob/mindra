import { NextResponse } from 'next/server';
import { findLocalUserByUsername, getAllLocalUsers, saveUsers } from '@/lib/localAuth';

async function tryMongoUpdateUser(username: string, plan: string) {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  const users = client.db().collection('users');
  await users.updateOne({ username }, { $set: { plan } });
}

export async function POST(request: Request) {
  const usernameCookie = request.cookies.get('authToken');
  const currentUsername = usernameCookie?.value;
  if (!currentUsername) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let currentUser = null;

  if (process.env.MONGODB_URI) {
    try {
      const { default: clientPromise } = await import('@/lib/mongodb');
      const client = await clientPromise;
      const users = client.db().collection('users');
      currentUser = await users.findOne({ username: currentUsername });
    } catch (mongoError) {
      console.warn('MongoDB unavailable, falling back to local auth:', mongoError);
    }
  }

  if (!currentUser) {
    currentUser = await findLocalUserByUsername(currentUsername);
  }

  if (!currentUser || (currentUser as any).role !== 'admin') {
    return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
  }

  const { username, plan } = await request.json();
  if (!username || !plan) {
    return NextResponse.json({ error: 'Username and plan required.' }, { status: 400 });
  }

  if (process.env.MONGODB_URI) {
    try {
      await tryMongoUpdateUser(username, plan);
    } catch (mongoError) {
      console.warn('MongoDB unavailable, falling back to local auth:', mongoError);
    }
  }

  // Update local
  const users = await getAllLocalUsers();
  const updatedUsers = users.map(user =>
    user.username === username ? { ...user, plan } : user
  );
  await saveUsers(updatedUsers);

  return NextResponse.json({ success: true });
}