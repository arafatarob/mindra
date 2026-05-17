import { NextResponse } from 'next/server';
import { addActivity } from '@/lib/activityLog';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, details } = body as { action?: string; details?: Record<string, any> };

    if (!action || typeof action !== 'string') {
      return NextResponse.json({ error: 'Action is required.' }, { status: 400 });
    }

    const user = request.cookies.get('authToken')?.value || 'anonymous';

    await addActivity({
      user,
      action: action.trim(),
      details: details || {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Activity log API error:', error);
    return NextResponse.json({ error: 'Unable to log activity.' }, { status: 500 });
  }
}
