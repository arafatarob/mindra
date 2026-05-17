import { NextResponse } from 'next/server';
import { getSupportChatByUserId, upsertSupportChat } from '@/lib/localSupportChat';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId query parameter is required.' }, { status: 400 });
  }

  const chat = await getSupportChatByUserId(userId);
  if (!chat) {
    return NextResponse.json({ userId, messages: [], status: 'ai' });
  }

  return NextResponse.json(chat);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, messages, status } = body;

    if (!userId || !Array.isArray(messages) || !status) {
      return NextResponse.json({ error: 'userId, messages, and status are required.' }, { status: 400 });
    }

    const chat = await upsertSupportChat(userId, messages, status);
    return NextResponse.json({ success: true, chat });
  } catch (error) {
    console.error('User chat API error:', error);
    const status = error instanceof SyntaxError ? 400 : 500;
    return NextResponse.json({ error: status === 400 ? 'Invalid request body.' : 'Server error while saving chat.' }, { status });
  }
}
