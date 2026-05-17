import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findLocalUserByUsername, saveLocalUser } from '@/lib/localAuth';

async function tryMongoRegister(name: string, username: string, hashedPassword: string, profileImage?: string) {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  const users = client.db().collection('users');
  const existingUser = await users.findOne({ username });

  if (existingUser) {
    return { error: 'Username is already registered.' };
  }

  await users.insertOne({ name, username, password: hashedPassword, profileImage: profileImage || null, createdAt: new Date(), role: 'user', plan: 'Free' });
  return { success: true };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, username, password, profileImage } = body as { name?: string; username?: string; password?: string; profileImage?: string };

    if (!name || !username || !password) {
      return NextResponse.json({ error: 'Name, username, and password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (process.env.MONGODB_URI) {
      try {
        const result = await tryMongoRegister(name, username, hashedPassword, profileImage);
        if (result.error) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true });
      } catch (mongoError) {
        console.warn('MongoDB unavailable, falling back to local auth:', mongoError);
      }
    }

    const existingLocalUser = await findLocalUserByUsername(username);
    if (existingLocalUser) {
      return NextResponse.json({ error: 'Username is already registered.' }, { status: 400 });
    }

    await saveLocalUser({
      name,
      username,
      password: hashedPassword,
      profileImage,
      createdAt: new Date().toISOString(),
      role: 'user',
      plan: 'Free',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 });
  }
}
