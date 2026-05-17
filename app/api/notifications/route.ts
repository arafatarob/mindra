import { NextResponse } from 'next/server';
import { getNotificationsForUser } from '@/lib/localNotifications';

export async function GET(request: Request) {
  const usernameCookie = request.cookies.get('authToken');
  const username = usernameCookie?.value;
  if (!username) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const notifications = await getNotificationsForUser(username);
  return NextResponse.json({ notifications });
}
