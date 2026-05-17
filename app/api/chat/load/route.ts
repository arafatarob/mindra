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

    const chat = await db.collection('chats').findOne({ user: userEmail });

    return NextResponse.json({ messages: chat?.messages || [] });
  } catch (error) {
    console.error('Failed to load chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}