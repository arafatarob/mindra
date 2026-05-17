import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findStoredLeads, saveStoredLead, deleteStoredLead } from '@/lib/leadStorage';

const VALID_PLATFORMS = ['linkedin', 'google', 'instagram', 'facebook', 'web', 'all'] as const;

type LeadPlatform = (typeof VALID_PLATFORMS)[number];

function normalizePlatform(value: unknown): LeadPlatform {
  if (typeof value !== 'string') return 'web';
  const normalized = value.toLowerCase();
  return VALID_PLATFORMS.includes(normalized as LeadPlatform) ? (normalized as LeadPlatform) : 'web';
}

export async function GET(request: Request) {
  const cookiesStore = await cookies();
  const usernameCookie = cookiesStore.get('authToken');
  const username = usernameCookie?.value;
  if (!username) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const leads = await findStoredLeads({ query: '', volume: 500, username }); // Fetch up to 500 leads for this user
    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Lead collect GET API error:', error);
    return NextResponse.json({ error: 'Unable to fetch leads right now.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const location = typeof body.location === 'string' ? body.location.trim() : '';
    const site = typeof body.site === 'string' ? body.site.trim() : '';
    const details = Array.isArray(body.details) ? body.details.map(String) : [];

    if (!title || !location || !site || details.length === 0) {
      return NextResponse.json({ error: 'title, location, site and details are required.' }, { status: 400 });
    }

    const cookiesStore = await cookies();
    const usernameCookie = cookiesStore.get('authToken');
    const username = usernameCookie?.value;
    if (!username) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const lead = await saveStoredLead({
      username,
      title,
      location,
      site,
      email: typeof body.email === 'string' ? body.email.trim() : undefined,
      phone: typeof body.phone === 'string' ? body.phone.trim() : undefined,
      details,
      platform: normalizePlatform(body.platform),
      source: typeof body.source === 'string' ? body.source.trim() : 'Manual Collect',
      score: body.score === 'high' || body.score === 'medium' ? body.score : 'low',
      verified: body.verified !== false,
    });

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Lead collect API error:', error);
    return NextResponse.json({ error: 'Unable to store lead right now.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookiesStore = await cookies();
    const usernameCookie = cookiesStore.get('authToken');
    const username = usernameCookie?.value;
    if (!username) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const title = searchParams.get('title');

    if (!id && !title) {
      return NextResponse.json({ error: 'Lead id or title is required for deletion.' }, { status: 400 });
    }

    await deleteStoredLead({ id: id || undefined, title: title || undefined, username });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead deletion API error:', error);
    return NextResponse.json({ error: 'Unable to delete lead right now.' }, { status: 500 });
  }
}