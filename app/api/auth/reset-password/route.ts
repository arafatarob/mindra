import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { findLocalUserByUsername, saveResetToken } from '@/lib/localAuth';

async function tryMongoFindUser(username: string) {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  const users = client.db().collection('users');
  return await users.findOne({ username });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username } = body as { username?: string };

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Please provide a valid username.' }, { status: 400 });
    }

    const normalizedUsername = username.toLowerCase();
    let user = null;

    if (process.env.MONGODB_URI) {
      try {
        user = await tryMongoFindUser(normalizedUsername);
      } catch (mongoError) {
        console.warn('MongoDB unavailable for reset-password:', mongoError);
      }
    }

    if (!user) {
      user = await findLocalUserByUsername(normalizedUsername);
    }

    const isRegistered = Boolean(user);
    if (!isRegistered) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists for ' + normalizedUsername + ', a password reset link will be shown.',
      });
    }

    const origin = new URL(request.url).origin;
    const resetToken = randomUUID();
    const resetLink = `${origin}/authentication?tab=login&resetToken=${resetToken}&username=${encodeURIComponent(normalizedUsername)}`;
    await saveResetToken({
      username: normalizedUsername,
      token: resetToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'A password reset link was created for ' + normalizedUsername + '. Copy the preview below.',
      resetLink,
    });
  } catch (error) {
    console.error('Reset password API error:', error);
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 });
  }
}
