import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { scrapeWebsiteLeads } from '@/lib/leadScraper';
import { saveStoredLead } from '@/lib/leadStorage';

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

      let leadsFromPython: any[] = [];
      try {
        leadsFromPython = JSON.parse(stdout || '[]');
        if (!Array.isArray(leadsFromPython)) leadsFromPython = [];
      } catch (e) {
        console.error(`Invalid JSON from python scraper (${python})`, e, stdout, stderr);
        leadsFromPython = [];
      }

      if (leadsFromPython.length > 0) {
        return leadsFromPython;
      }
    } catch (error) {
      console.warn(`Python command '${python}' failed:`, error);
    }
  }

  return [];
}

export async function POST(req: Request) {
  try {
    const { targetUrl, keyword, username } = await req.json();

    if (keyword && typeof keyword === 'string') {
      // Spawn the local Python scraper script (scripts/lead_scraper.py)
      const scriptPath = path.resolve(process.cwd(), 'scripts', 'lead_scraper.py');

      const leadsFromPython = await runPythonScraper(scriptPath, keyword);

      const saved: any[] = [];
      for (const l of leadsFromPython) {
        try {
          const item = {
            username: (username || 'scraper').toLowerCase(),
            title: l.name || l.title || 'Unknown',
            location: l.company || 'Unknown',
            site: l.website || (l.source_url ? new URL(l.source_url).hostname.replace('www.', '') : 'unknown'),
            email: l.email,
            phone: l.phone,
            details: [l.source_url || `scraped:${keyword}`],
            platform: 'web' as any,
            source: 'python-scraper',
            score: l.email ? 'high' : 'medium',
            verified: Boolean(l.email && l.phone),
          };

          const stored = await saveStoredLead(item as any);
          saved.push(stored);
        } catch (err) {
          console.error('Failed to save lead', err, l);
        }
      }

      return NextResponse.json({ leads: saved, origin: 'python-scraper' });
    }

    if (!targetUrl) {
      return NextResponse.json({ error: 'Target URL or keyword is required' }, { status: 400 });
    }

    // Fallback: TypeScript scraper for a single target URL
    const leads = await scrapeWebsiteLeads(String(targetUrl));

    // persist the single lead (if any)
    const persisted: any[] = [];
    for (const l of leads) {
      try {
        const item = {
          username: 'scraper',
          title: l.title,
          location: l.location,
          site: l.site,
          email: l.email,
          phone: l.phone,
          details: l.details || [],
          platform: 'web' as any,
          source: 'ts-scraper',
          score: l.verified ? 'high' : 'medium',
          verified: l.verified,
        };
        const stored = await saveStoredLead(item as any);
        persisted.push(stored);
      } catch (err) {
        console.error('Failed to persist TS-scraped lead', err, l);
      }
    }

    return NextResponse.json({ leads: persisted, origin: 'ts-scraper' });
  } catch (error) {
    console.error('Scraping failed:', error);
    return NextResponse.json({ error: 'Scraping failed' }, { status: 500 });
  }
}
