import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findLocalUserByUsername, updateLocalUserPassword } from '@/lib/localAuth';

async function tryMongoUpdatePassword(username: string, hashedPassword: string) {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  const users = client.db().collection('users');
  await users.updateOne({ username }, { $set: { password: hashedPassword } });
}

async function tryMongoFindUser(username: string) {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  const users = client.db().collection('users');
  return users.findOne({ username }) as { name: string; username: string; password: string } | null;
}

export async function POST(request: Request) {
  try {
    const usernameCookie = request.cookies.get('authToken');
    const authUsername = usernameCookie?.value;
    if (!authUsername) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body as { currentPassword?: string; newPassword?: string; confirmPassword?: string };

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'All password fields are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New password and confirmation do not match.' }, { status: 400 });
    }

    const normalizedUsername = authUsername.toLowerCase();
    let user = null;

    if (process.env.MONGODB_URI) {
      try {
        user = await tryMongoFindUser(normalizedUsername);
      } catch (mongoError) {
        console.warn('MongoDB unavailable, falling back to local auth:', mongoError);
      }
    }

    if (!user) {
      user = await findLocalUserByUsername(normalizedUsername);
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (process.env.MONGODB_URI) {
      try {
        await tryMongoUpdatePassword(normalizedUsername, hashedPassword);
      } catch (mongoError) {
        console.warn('MongoDB unavailable, falling back to local auth:', mongoError);
      }
    }

    await updateLocalUserPassword(normalizedUsername, hashedPassword);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update password API error:', error);
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 });
  }
}
