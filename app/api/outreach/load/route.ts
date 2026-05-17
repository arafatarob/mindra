import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getSessionUser } from '@/lib/authUtils'; // Import the shared utility


export async function GET(request: Request) {
  const userEmail = await getSessionUser();

  if (!userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // Fixed collection name to match outreachStorage.ts
    const items = await db.collection('outreach_items')
      .find({ user: userEmail })
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Failed to load outreach items:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}