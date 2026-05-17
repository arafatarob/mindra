import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { searchLeads } from '@/lib/leadSearch';
import { scrapeWebsiteLeads } from '@/lib/leadScraper';

async function runPythonScraper(scriptPath: string, keyword: string) {
  const candidates = ['python', 'python3'];
  for (const python of candidates) {
    try {
      const script = spawn(python, [scriptPath, keyword], { stdio: ['ignore', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';

      for await (const chunk of script.stdout) {
        stdout += chunk.toString();
      }
      for await (const chunk of script.stderr) {
        stderr += chunk.toString();
      }

      if (stderr) console.warn(`Python scraper stderr (${python}):`, stderr);
      if (script.exitCode !== null && script.exitCode !== 0) {
        console.warn(`Python scraper exited with code ${script.exitCode} using ${python}`);
        continue;
      }

      let pythonLeads: any[] = [];
      try {
        pythonLeads = JSON.parse(stdout || '[]');
        if (!Array.isArray(pythonLeads)) pythonLeads = [];
      } catch (e) {
        console.error(`Invalid JSON from python scraper (${python})`, e, stdout, stderr);
        pythonLeads = [];
      }

      if (pythonLeads.length > 0) {
        return pythonLeads;
      }
    } catch (error) {
      console.warn(`Python command '${python}' failed:`, error);
    }
  }

  return [];
}

// NOTE: This endpoint is a prototype for verified lead search.
// If you configure a real lead provider, it will request that provider first.
// Otherwise it falls back to stored leads or a local scraper.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, location, volume, platforms, targetUrl } = body as {
      query?: string;
      location?: string;
      volume?: number;
      platforms?: string[];
      targetUrl?: string;
    };

    if (typeof targetUrl === 'string' && targetUrl.trim()) {
      const leads = await scrapeWebsiteLeads(targetUrl.trim());
      if (leads.length > 0) {
        return NextResponse.json({ leads, origin: 'scraper' });
      }
    }

    const leadsResult = await searchLeads({
      query: typeof query === 'string' ? query.trim() : '',
      location: typeof location === 'string' ? location.trim() : undefined,
      volume: typeof volume === 'number' ? volume : 25,
      platforms: Array.isArray(platforms) ? platforms.map((item) => item.toLowerCase() as any) : ['all'],
    });

    if (leadsResult.leads.length > 0) {
      return NextResponse.json({ leads: leadsResult.leads, origin: leadsResult.origin });
    }

    const searchInput = [
      typeof query === 'string' ? query.trim() : '',
      typeof location === 'string' ? location.trim() : '',
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (searchInput) {
      const scriptPath = path.resolve(process.cwd(), 'scripts', 'lead_scraper.py');
      const pythonLeads = await runPythonScraper(scriptPath, searchInput);
      const resolvedLocation = typeof location === 'string' && location.trim() ? location.trim() : undefined;

      const mappedLeads = pythonLeads
        .map((lead) => {
          const email = lead.email ? String(lead.email) : undefined;
          const phone = lead.phone ? String(lead.phone) : undefined;
          const hasContact = Boolean(email || phone);
          const score = email && phone ? 'high' : hasContact ? 'medium' : 'low';

          return {
            id: `python-${lead.source_url ?? lead.website ?? lead.name}-${Math.random().toString(36).slice(2, 8)}`,
            title: String(lead.name || lead.title || 'Unknown Lead'),
            name: String(lead.name || lead.title || 'Unknown Lead'),
            company: String(lead.company || lead.location || 'Unknown Location'),
            location: resolvedLocation || String(lead.location || lead.company || 'Unknown Location'),
            site: String(lead.website || ((lead.source_url && new URL(lead.source_url).hostname.replace('www.', '')) || 'unknown')),
            email,
            phone,
            details: lead.source_url ? [`Scraped from ${lead.source_url}`] : ['Lead discovered from scraper'],
            platform: 'web',
            source: 'python-scraper',
            score,
            verified: hasContact,
          };
        })
        .filter((lead) => lead.verified);

      if (mappedLeads.length > 0) {
        return NextResponse.json({ leads: mappedLeads, origin: 'scraper' });
      }
    }

    return NextResponse.json({ leads: [], origin: leadsResult.origin });
  } catch (error) {
    console.error('Lead search API error:', error);
    return NextResponse.json({ error: 'Unable to search leads right now.' }, { status: 500 });
  }
}
