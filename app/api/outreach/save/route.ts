import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getSessionUser } from '@/lib/authUtils'; // Import the shared utility


export async function POST(request: Request) {
  const userEmail = await getSessionUser();

  if (!userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const item = await request.json();
    const client = await clientPromise;
    const db = client.db();

    // Fixed collection name to match outreachStorage.ts
    await db.collection('outreach_items').updateOne(
      { id: item.id, user: userEmail },
      { $set: { ...item, user: userEmail } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save outreach item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}