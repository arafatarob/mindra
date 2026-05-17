import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getSessionUser } from '@/lib/authUtils'; // Import the shared utility


export async function POST(request: Request) {
  const userEmail = await getSessionUser();

  if (!userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { messages } = await request.json();
    const client = await clientPromise;
    const db = client.db();

    await db.collection('chats').updateOne(
      { user: userEmail },
      { $set: { messages, user: userEmail, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}