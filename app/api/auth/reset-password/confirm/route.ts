import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { deleteResetToken, findLocalUserByUsername, findResetToken, updateLocalUserPassword } from '@/lib/localAuth';

async function tryMongoFindUser(username: string) {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  const users = client.db().collection('users');
  return await users.findOne({ username });
}

async function tryMongoUpdatePassword(username: string, hashedPassword: string) {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  const users = client.db().collection('users');
  await users.updateOne({ username }, { $set: { password: hashedPassword } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body as { token?: string; password?: string };

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Reset token is required.' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const tokenRecord = await findResetToken(token);
    if (!tokenRecord || new Date(tokenRecord.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Reset token is invalid or expired.' }, { status: 400 });
    }

    const username = tokenRecord.username;
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = null;
    if (process.env.MONGODB_URI) {
      try {
        user = await tryMongoFindUser(username);
        if (user) {
          await tryMongoUpdatePassword(username, hashedPassword);
        }
      } catch (mongoError) {
        console.warn('MongoDB unavailable for reset confirm:', mongoError);
      }
    }

    if (!user) {
      const localUser = await findLocalUserByUsername(username);
      if (!localUser) {
        return NextResponse.json({ error: 'Reset token is invalid or expired.' }, { status: 400 });
      }
      await updateLocalUserPassword(username, hashedPassword);
    }

    await deleteResetToken(token);

    return NextResponse.json({ success: true, message: 'Password updated successfully. You may now sign in.' });
  } catch (error) {
    console.error('Reset confirm API error:', error);
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 });
  }
}
