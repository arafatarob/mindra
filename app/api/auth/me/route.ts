import { NextResponse } from 'next/server';
import { findLocalUserByUsername, updateLocalUser } from '@/lib/localAuth';

async function tryMongoFindUser(username: string) {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  const users = client.db().collection('users');
  return await users.findOne({ username });
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export async function GET(request: Request) {
  const usernameCookie = request.cookies.get('authToken');
  const username = usernameCookie?.value;
  if (!username) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let user = null;

  if (process.env.MONGODB_URI) {
    try {
      user = await tryMongoFindUser(username);
    } catch (mongoError) {
      console.warn('MongoDB unavailable, falling back to local auth:', mongoError);
    }
  }

  if (!user) {
    user = await findLocalUserByUsername(username);
  }

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  if ((user as any).plan !== 'Free' && (user as any).planStartDate) {
    const expiry = addDays(new Date((user as any).planStartDate), 30);
    if (new Date() > expiry) {
      if (process.env.MONGODB_URI) {
        try {
          const { default: clientPromise } = await import('@/lib/mongodb');
          const client = await clientPromise;
          const users = client.db().collection('users');
          await users.updateOne(
            { username },
            { $set: { plan: 'Free', planStartDate: undefined } },
          );
          (user as any).plan = 'Free';
          (user as any).planStartDate = undefined;
        } catch (mongoUpdateError) {
          console.warn('Failed to persist plan expiry to MongoDB:', mongoUpdateError);
          (user as any).plan = 'Free';
          (user as any).planStartDate = undefined;
        }
      } else {
        user = await updateLocalUser(username, { plan: 'Free', planStartDate: undefined });
      }
    }
  }

  return NextResponse.json({
    user: {
      name: user.name,
      username: user.username,
      email: user.username,
      role: (user as any).role || 'user',
      plan: (user as any).plan || 'Free',
      planStartDate: (user as any).planStartDate || null,
      paymentMethod: (user as any).paymentMethod || null,
      billingHistory: Array.isArray((user as any).billingHistory) ? (user as any).billingHistory : [],
      profileImage: (user as any).profileImage || '',
      leadsUsed: typeof (user as any).leadsUsed === 'number' ? (user as any).leadsUsed : 0,
    },
  });
}
