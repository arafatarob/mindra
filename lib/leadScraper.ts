import * as cheerio from 'cheerio';

export interface ScrapedLead {
  id: string;
  title: string;
  location: string;
  site: string;
  email?: string;
  phone?: string;
  details: string[];
  platform: 'web';
  source: string;
  score: 'high' | 'medium' | 'low';
  verified: boolean;
}

const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/g;
const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

export async function scrapeWebsiteLeads(targetUrl: string): Promise<ScrapedLead[]> {
  const normalizedUrl = targetUrl.trim();
  const url = new URL(normalizedUrl);

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    },
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  $('script, style, nav, footer, noscript').remove();
  const pageText = $('body').text().replace(/\s+/g, ' ');

  const emails = Array.from(new Set(pageText.match(emailRegex) || []));
  const phones = Array.from(new Set(pageText.match(phoneRegex) || []));

  const metaTitle = $('title').text().trim();
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content');
  const h1 = $('h1').first().text().trim();
  const businessName = h1 || ogTitle || metaTitle || url.hostname.replace('www.', '');

  const socialLinks: Record<string, string | null> = {
    linkedin: null,
    facebook: null,
    instagram: null,
  };

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.includes('linkedin.com/')) socialLinks.linkedin = href;
    if (href.includes('facebook.com/')) socialLinks.facebook = href;
    if (href.includes('instagram.com/')) socialLinks.instagram = href;
  });

  const lead: ScrapedLead = {
    id: `scrape-${Date.now()}`,
    title: businessName,
    location: 'Identified via Scraper',
    site: url.hostname.replace('www.', ''),
    email: emails[0] || undefined,
    phone: phones[0] || undefined,
    details: [
      metaDesc ? `${metaDesc.substring(0, 120)}...` : 'Web prospect identified via direct scrape.',
      emails.length > 0 ? `Found ${emails.length} contact email(s)` : 'No email found on page.',
      phones.length > 0 ? `Detected ${phones.length} phone number(s)` : 'No phone number found on page.',
    ],
    platform: 'web',
    source: 'Website Scraper',
    score: emails.length > 0 ? 'high' : 'medium',
    verified: emails.length > 0,
  };

  return [lead];
}
