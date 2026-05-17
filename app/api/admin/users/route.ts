import { NextResponse } from 'next/server';
import { findLocalUserByUsername, getAllLocalUsers } from '@/lib/localAuth';

async function tryMongoGetUsers() {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  const users = client.db().collection('users');
  return await users.find({}).toArray();
}

export async function GET(request: Request) {
  const usernameCookie = request.cookies.get('authToken');
  const username = usernameCookie?.value;
  if (!username) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let currentUser = null;

  if (process.env.MONGODB_URI) {
    try {
      const { default: clientPromise } = await import('@/lib/mongodb');
      const client = await clientPromise;
      const users = client.db().collection('users');
      currentUser = await users.findOne({ username });
    } catch (mongoError) {
      console.warn('MongoDB unavailable, falling back to local auth:', mongoError);
    }
  }

  if (!currentUser) {
    currentUser = await findLocalUserByUsername(username);
  }

  if (!currentUser || (currentUser as any).role !== 'admin') {
    return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
  }

  let allUsers = [];

  if (process.env.MONGODB_URI) {
    try {
      allUsers = await tryMongoGetUsers();
    } catch (mongoError) {
      console.warn('MongoDB unavailable, falling back to local auth:', mongoError);
    }
  }

  if (allUsers.length === 0) {
    allUsers = await getAllLocalUsers();
  }

  return NextResponse.json(allUsers);
}