import { NextResponse } from 'next/server';
import { updateLocalUser, findLocalUserByUsername } from '@/lib/localAuth';

async function tryMongoUpdateProfile(username: string, updates: { name?: string; profileImage?: string; leadsUsed?: number }) {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  const users = client.db().collection('users');
  const result = await users.findOneAndUpdate(
    { username },
    { $set: updates },
    { returnDocument: 'after' },
  );
  return result.value;
}

export async function PATCH(request: Request) {
  try {
    const usernameCookie = request.cookies.get('authToken');
    const authUsername = usernameCookie?.value;
    if (!authUsername) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, profileImage, leadsUsed, plan, planStartDate } = body as { name?: string; profileImage?: string; leadsUsed?: number; plan?: string; planStartDate?: string };
    const updates: Record<string, unknown> = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof profileImage === 'string') updates.profileImage = profileImage;
    if (typeof leadsUsed === 'number' && Number.isFinite(leadsUsed) && leadsUsed >= 0) updates.leadsUsed = leadsUsed;

    const validPlans = ['Free', 'Starter', 'Outbound', 'Growth'];
    if (typeof plan === 'string' && validPlans.includes(plan)) {
      updates.plan = plan;
      if (typeof planStartDate === 'string' && !Number.isNaN(new Date(planStartDate).getTime())) {
        updates.planStartDate = planStartDate;
      }
      if (plan !== 'Free') {
        updates.leadsUsed = 0;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
    }

    const normalizedUsername = authUsername.toLowerCase();
    let updatedUser: any = null;

    if (process.env.MONGODB_URI) {
      try {
        updatedUser = await tryMongoUpdateProfile(normalizedUsername, updates as any);
      } catch (mongoError) {
        console.warn('MongoDB unavailable, falling back to local auth:', mongoError);
      }
    }

    if (!updatedUser) {
      const existingUser = await findLocalUserByUsername(normalizedUsername);
      if (!existingUser) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
      }
      updatedUser = await updateLocalUser(normalizedUsername, updates as any);
    }

    return NextResponse.json({
      success: true,
      user: {
        name: updatedUser.name,
        username: updatedUser.username,
        profileImage: updatedUser.profileImage || '',
        leadsUsed: updatedUser.leadsUsed ?? 0,
      },
    });
  } catch (error) {
    console.error('Update profile API error:', error);
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 });
  }
}
