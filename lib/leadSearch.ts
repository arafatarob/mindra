export type LeadPlatform = 'linkedin' | 'google' | 'instagram' | 'facebook' | 'web' | 'all';

export interface LeadSearchResponse {
  leads: LeadResult[];
  origin: 'provider' | 'stored' | 'sample' | 'none';
}

export interface LeadSearchRequest {
  query: string;
  location?: string;
  volume?: number;
  platforms?: LeadPlatform[];
}

export interface LeadResult {
  id: string;
  title: string;
  location: string;
  site: string;
  email?: string;
  phone?: string;
  details: string[];
  platform: LeadPlatform;
  source: string;
  score: 'high' | 'medium' | 'low';
  verified: boolean;
}

const SAMPLE_LEADS: LeadResult[] = [
  {
    id: 'lead-01',
    title: 'Dubai Digital Agency',
    location: 'Dubai, UAE',
    site: 'dubaidigital.ae',
    email: 'hello@dubaidigital.ae',
    phone: '+971501234111',
    details: [
      'Contact found for Dubai Digital Agency',
      'Verified contact — Marketing Director',
    ],
    platform: 'linkedin',
    source: 'LinkedIn',
    score: 'high',
    verified: true,
  },
  {
    id: 'lead-02',
    title: 'Oceanview Restaurant',
    location: 'Abu Dhabi, UAE',
    site: 'oceanviewrestaurant.ae',
    email: 'omar@oceanviewrestaurant.ae',
    phone: '+971502345222',
    details: [
      'Contact found for Oceanview Restaurant',
      'Verified contact — Owner',
    ],
    platform: 'facebook',
    source: 'Facebook',
    score: 'high',
    verified: true,
  },
  {
    id: 'lead-03',
    title: 'Wellness Hub',
    location: 'Sharjah, UAE',
    site: 'wellnesshub.ae',
    email: 'info@wellnesshub.ae',
    phone: '+971503456333',
    details: [
      'Contact found for Wellness Hub',
      'Verified contact — Founder',
    ],
    platform: 'instagram',
    source: 'Instagram',
    score: 'medium',
    verified: true,
  },
  {
    id: 'lead-04',
    title: 'Farsi Legal',
    location: 'Dubai, UAE',
    site: 'farsilegal.ae',
    email: 'hassan@farsilegal.ae',
    phone: '+971504567444',
    details: [
      'Contact found for Farsi Legal',
      'Verified contact — CEO',
    ],
    platform: 'google',
    source: 'Google Business',
    score: 'high',
    verified: true,
  },
  {
    id: 'lead-05',
    title: 'Glow Spa',
    location: 'Dubai, UAE',
    site: 'glowspadubai.ae',
    email: 'mona@glowspadubai.ae',
    phone: '+971505678555',
    details: [
      'Contact found for Glow Spa',
      'Verified contact — COO',
    ],
    platform: 'instagram',
    source: 'Instagram',
    score: 'medium',
    verified: true,
  },
  {
    id: 'lead-06',
    title: 'TechVista',
    location: 'Abu Dhabi, UAE',
    site: 'techvista.ae',
    email: 'ayesha.hassan@techvista.ae',
    phone: '+971506789666',
    details: [
      'Contact found for TechVista',
      'Verified contact — Senior Sales Lead',
    ],
    platform: 'linkedin',
    source: 'LinkedIn',
    score: 'high',
    verified: true,
  },
];

function normalizePlatform(value: string | undefined): LeadPlatform {
  const normalized = (value || 'all').toLowerCase();
  return ['linkedin', 'google', 'instagram', 'facebook', 'web'].includes(normalized)
    ? (normalized as LeadPlatform)
    : 'all';
}

async function fetchLeadsFromProvider(
  request: LeadSearchRequest,
  providerUrl: string,
  apiKey: string,
): Promise<LeadResult[]> {
  try {
    const response = await fetch(providerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: request.query,
        location: request.location,
        volume: request.volume ?? 25,
        platforms: request.platforms || ['all'],
      }),
    });

    if (!response.ok) {
      throw new Error(`Lead provider returned ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data.leads)) {
      throw new Error('Lead provider returned invalid response.');
    }

    return data.leads.map((lead: any, index: number) => ({
      id: String(lead.id ?? `provider-${index}`),
      title: String(lead.title ?? lead.company ?? 'Unknown Company'),
      location: String(lead.location ?? 'Unknown Location'),
      site: String(lead.site ?? lead.website ?? ''),
      email: lead.email ? String(lead.email) : undefined,
      phone: lead.phone ? String(lead.phone) : undefined,
      details: Array.isArray(lead.details)
        ? lead.details.map(String)
        : [String(lead.details ?? 'Lead data from provider.')],
      platform: normalizePlatform(String(lead.platform)),
      source: String(lead.source ?? 'API Provider'),
      score: lead.score === 'high' || lead.score === 'medium' ? lead.score : 'low',
      verified: lead.verified !== false,
    }));
  } catch (error) {
    console.warn('Lead provider lookup failed:', error);
    return [];
  }
}

export function searchVerifiedLeads(request: LeadSearchRequest): LeadResult[] {
  const query = (request.query || '').trim().toLowerCase();
  const location = (request.location || '').trim().toLowerCase();
  const platforms = (request.platforms || ['all']).map((item) => item.toLowerCase() as LeadPlatform);
  const volume = Math.max(1, Math.min(request.volume ?? 25, 50));

  return SAMPLE_LEADS.filter((lead) => {
    if (!lead.verified) {
      return false;
    }

    const matchesQuery = !query ||
      [lead.title, lead.location, lead.site, lead.source, ...lead.details]
        .some((field) => field.toLowerCase().includes(query));

    const matchesLocation = !location || lead.location.toLowerCase().includes(location);
    const matchesPlatform = platforms.includes('all') || platforms.includes(lead.platform);

    return matchesQuery && matchesLocation && matchesPlatform;
  }).slice(0, volume);
}

export async function searchLeads(request: LeadSearchRequest): Promise<LeadSearchResponse> {
  const providerUrl = process.env.LEAD_PROVIDER_URL;
  const apiKey = process.env.LEAD_PROVIDER_API_KEY;

  if (providerUrl && apiKey) {
    const providerResults = await fetchLeadsFromProvider(request, providerUrl, apiKey);
    if (providerResults.length > 0) {
      return { leads: providerResults, origin: 'provider' };
    }
  }

  // Always check database first for stored leads that match criteria
  const { findStoredLeads } = await import('./leadStorage');
  const storedLeads = await findStoredLeads({
    query: request.query,
    volume: request.volume ?? 25,
  });
  if (storedLeads.length > 0) {
    return { leads: storedLeads, origin: 'stored' };
  }

  // No provider results and no stored leads available.
  return { leads: [], origin: 'none' };
}
