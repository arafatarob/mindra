import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findLocalUserByUsername, saveLocalUser } from '@/lib/localAuth';

const PROVIDER_USERS: Record<string, { name: string; username: string }> = {
  google: {
    name: 'Google User',
    username: 'google.user@arfa.local',
  },
  github: {
    name: 'GitHub User',
    username: 'github.user@arfa.local',
  },
};

async function tryMongoFindUser(username: string) {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  const users = client.db().collection('users');
  return await users.findOne({ username });
}

async function tryMongoCreateUser(name: string, username: string, hashedPassword: string) {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  const users = client.db().collection('users');
  await users.insertOne({ name, username, password: hashedPassword, createdAt: new Date(), role: 'user', plan: 'Free' });
}

export async function POST(
  request: Request,
  context: { params?: { provider?: string } }
) {
  const providerParam = context?.params?.provider;
  const fallbackProvider = new URL(request.url).pathname.match(/\/api\/auth\/oauth\/([^\/\?#]+)/)?.[1];
  const provider = (providerParam || fallbackProvider || '').toString().toLowerCase();

  const providerUser = PROVIDER_USERS[provider];
  if (!providerUser) {
    return NextResponse.json({ error: 'Unsupported social provider.' }, { status: 400 });
  }

  const normalizedUsername = providerUser.username.toLowerCase();
  let existingUser = null;
  let created = false;
  const randomPassword = await bcrypt.hash(`${provider}-${Date.now()}`, 10);

  if (process.env.MONGODB_URI) {
    try {
      existingUser = await tryMongoFindUser(normalizedUsername);
    } catch (mongoError) {
      console.warn('MongoDB unavailable, falling back to local auth:', mongoError);
    }
  }

  if (!existingUser) {
    existingUser = await findLocalUserByUsername(normalizedUsername);
  }

  if (!existingUser) {
    created = true;
    if (process.env.MONGODB_URI) {
      try {
        await tryMongoCreateUser(providerUser.name, normalizedUsername, randomPassword);
      } catch (mongoError) {
        console.warn('MongoDB save failed, falling back to local auth:', mongoError);
        await saveLocalUser({
          name: providerUser.name,
          username: normalizedUsername,
          password: randomPassword,
          createdAt: new Date().toISOString(),
          role: 'user',
          plan: 'Free',
        });
      }
    } else {
      await saveLocalUser({
        name: providerUser.name,
        username: normalizedUsername,
        password: randomPassword,
        createdAt: new Date().toISOString(),
        role: 'user',
        plan: 'Free',
      });
    }
  }

  const response = NextResponse.json({
    success: true,
    created,
    user: { name: providerUser.name, username: normalizedUsername },
    provider,
  });
  response.cookies.set('authToken', normalizedUsername, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
