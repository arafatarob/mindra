import { NextResponse } from 'next/server';
import { addNotification } from '@/lib/localNotifications';
import { findLocalUserByUsername } from '@/lib/localAuth';

async function findUserByUsername(username: string) {
  // localAuth helper handles MongoDB/File fallback and correct collection naming
  return await findLocalUserByUsername(username);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, message } = body;

    if (!username || !message) {
      return NextResponse.json({ error: 'Username and message are required.' }, { status: 400 });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Save the notification to MongoDB
    await addNotification({
      username: username.toLowerCase(),
      message,
      from: 'Admin',
    });

    return NextResponse.json({ success: true, message: 'Notification sent successfully.' });
  } catch (error) {
    console.error('Admin notify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}