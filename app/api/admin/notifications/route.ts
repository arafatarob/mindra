import { NextResponse } from 'next/server';
import { addNotification } from '@/lib/localNotifications';
import { findLocalUserByUsername } from '@/lib/localAuth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, message } = body;

    if (!username || !message) {
      return NextResponse.json({ error: 'Username and message are required.' }, { status: 400 });
    }

    const user = await findLocalUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    await addNotification({
      username: username.toLowerCase(),
      message,
      from: 'Admin',
    });

    return NextResponse.json({ success: true, message: 'Notification sent successfully.' });
  } catch (error) {
    console.error('Admin notifications API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
