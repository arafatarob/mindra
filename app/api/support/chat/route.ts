import { NextResponse } from 'next/server';
import { getAllSupportChats, getSupportChatByUserId, upsertSupportChat } from '@/lib/localSupportChat';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const listParam = url.searchParams.get('list');
  const userId = url.searchParams.get('userId');

  if (listParam === 'true') {
    const chats = await getAllSupportChats();
    return NextResponse.json({ chats });
  }

  if (userId) {
    const chat = await getSupportChatByUserId(userId);
    if (!chat) {
      return NextResponse.json({ userId, messages: [], status: 'ai' }, { status: 200 });
    }
    return NextResponse.json(chat);
  }

  return NextResponse.json({ error: 'Missing query param userId or list=true.' }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, messages, status } = body;

    if (!userId || !Array.isArray(messages) || !status) {
      return NextResponse.json({ error: 'userId, messages, and status are required.' }, { status: 400 });
    }

    const record = await upsertSupportChat(userId, messages, status);
    return NextResponse.json({ success: true, chat: record });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
}
