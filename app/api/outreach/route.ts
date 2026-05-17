import { NextResponse } from 'next/server';
import { getOutreachItems, saveOutreachItem } from '@/lib/outreachStorage';

export async function GET() {
  try {
    const outreachItems = await getOutreachItems();
    return NextResponse.json({ outreachItems });
  } catch (error) {
    console.error('Outreach GET API error:', error);
    return NextResponse.json({ error: 'Unable to fetch outreach items.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const savedItem = await saveOutreachItem(body);
    return NextResponse.json({ item: savedItem });
  } catch (error) {
    console.error('Outreach POST API error:', error);
    return NextResponse.json({ error: 'Unable to save outreach item.' }, { status: 500 });
  }
}