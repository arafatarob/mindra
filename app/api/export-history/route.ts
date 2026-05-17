import { NextResponse } from 'next/server';
import { getExportHistory, saveExportHistoryItem } from '@/lib/exportHistoryStorage';

export async function GET() {
  try {
    const exportHistory = await getExportHistory();
    return NextResponse.json({ exportHistory });
  } catch (error) {
    console.error('Export History GET API error:', error);
    return NextResponse.json({ error: 'Unable to fetch export history.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const savedItem = await saveExportHistoryItem(body);
    return NextResponse.json({ item: savedItem });
  } catch (error) {
    console.error('Export History POST API error:', error);
    return NextResponse.json({ error: 'Unable to save export history.' }, { status: 500 });
  }
}
