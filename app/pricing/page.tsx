'use client';
import Link from 'next/link';
import { useState } from 'react';

const PRICING_PLANS = [
  {
    name: "Free",
    price: "0",
    period: "month",
    badge: "TEST THE ENGINE",
    features: [
      { text: "25 verified leads", included: true },
      { text: "CSV export", included: true },
      { text: "Email discovery", included: true },
      { text: "Basic filters", included: true },
      { text: "No outreach tools", included: false },
      { text: "No pipeline access", included: false },
    ],
    cta: "Start Free",
    link: "/authentication?tab=signup",
    highlight: false,
  },
  {
    name: 'Starter',
    price: '29.99',
    period: 'month',
    badge: 'STARTER PIPELINE',
    description: 'Up to 500 leads per month',
    features: [
      { text: '500 leads / month', included: true },
      { text: 'CSV export', included: true },
      { text: 'Email templates', included: true },
      { text: 'Basic outreach tools', included: true },
      { text: 'Lead history', included: true },
      { text: 'Simple upgrade path to ALPHA', included: true },
    ],
    cta: 'Start Building',
    link: '/pricing/payment_process',
    highlight: true,
  },
  {
    name: 'Outbound',
    price: '49.99',
    period: 'month',
    badge: 'OUTBOUND ENGINE',
    description: 'For teams ready to reach more of the right prospects with more flexibility',
    features: [
      { text: '1,000+ verified leads', included: true },
      { text: 'Unlimited templates', included: true },
      { text: 'Multi-channel outreach', included: true },
      { text: 'Pipeline tracking', included: true },
      { text: 'Follow-up tools', included: true },
    ],
    cta: 'Start Building',
    link: '/pricing/payment_process',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '99.99',
    period: 'month',
    badge: 'AUTONOMOUS GROWTH',
    description: 'For teams ready to scale faster with intelligent outreach and automation',
    features: [
      { text: 'AI-first lead discovery', included: true },
      { text: 'Automation lead discovery', included: true },
      { text: 'AI-assisted outreach', included: true },
      { text: 'Smarter targeting logic', included: true },
      { text: 'Built for scalable prospecting', included: true },
    ],
    cta: 'Start Building',
    link: '/pricing/payment_process',
    highlight: false,
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

        * { margin:0; padding:0; box-sizing:border-box; }
        :root {
          --bg: #0A0F1E;
          --surface: #111827;
          --surface-light: #1F2937;
          --border: rgba(255,255,255,0.06);
          --border-hover: rgba(108,99,255,0.3);
          --tx: #F9FAFB;
          --tx2: #9CA3AF;
          --tx3: #6B7280;
          --accent: #6C63FF;
          --accent-glow: rgba(108,99,255,0.15);
          --green: #10B981;
          --green-bg: rgba(16,185,129,0.1);
          --amber: #F59E0B;
          --amber-bg: rgba(245,158,11,0.1);
          --red: #EF4444;
          --red-bg: rgba(239,68,68,0.1);
          --blue: #3B82F6;
        }
        body { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--tx); font-size:14px; -webkit-font-smoothing: antialiased; }
        .font-instrument { font-family: 'Instrument Serif', serif; }
        .font-syne { font-family: 'Syne', sans-serif; }

        .btn { padding:10px 20px; border-radius:10px; font-weight:600; cursor:pointer; transition:all .2s; border:none; font-size:13px; }
        .btn-primary {background: var(--accent);color: #fff;box-shadow: 0 4px 15px rgba(108,99,255,0.3);padding: 6px 20px;border-radius: 6px;cursor: pointer}
        .btn-primary:hover { transform: translateY(-1px); background: #5a54e0; }
        .btn-outline {cursor: pointer;background: transparent;border: 1px solid var(--border);color: var(--tx);transition: all .2s;padding: 6px 20px;border-radius: 6px;}
        .btn-outline:hover { background:var(--surface-light); border-color:var(--tx3); }

        .pricing-wrap{max-width:1200px;margin:0 auto;padding:0;}
        .pricing-head{text-align:center;margin-bottom:40px;}
        .pricing-eyebrow{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--tx3);margin-bottom:12px;}
        .pricing-headline{font-size:48px;font-weight:800;line-height:1.1;margin-bottom:16px;color:var(--tx);letter-spacing:-0.02em;}
        .pricing-headline em{font-style:italic;color:var(--tx2);}
        .pricing-head > p{font-size:14px;color:var(--tx3);}

        .pricing-toggle-wrap{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:40px;}
        .pill-toggle{width:50px;height:28px;background:var(--surface-light);border:1px solid var(--border);border-radius:20px;position:relative;cursor:pointer;transition:all .3s;display:flex;align-items:center;padding:0 3px;}
        .pill-toggle.an{background:var(--accent-glow);border-color:var(--accent);}
        .pill-toggle-thumb{width:22px;height:22px;background:var(--tx);border-radius:50%;position:absolute;left:3px;transition:left .3s;}
        .pill-toggle.an .pill-toggle-thumb{left:25px;background:var(--accent);}
        .save-badge{font-size:12px;font-weight:600;color:var(--green);}

        .pricing-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:40px;}
        .pricing-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:32px 24px;position:relative;transition:all .3s;display:flex;flex-direction:column;}
        .pricing-card:hover{border-color:var(--accent);transform:translateY(-4px);}
        .pricing-card.featured{border-color:var(--accent);background:linear-gradient(135deg,rgba(108,99,255,0.1),rgba(108,99,255,0.05));box-shadow:0 0 20px rgba(108,99,255,0.2);}
        .pricing-card.featured:hover{transform:translateY(-8px);}
        .featured-badge{position:absolute;top:16px;right:16px;background:var(--accent-glow);border:1px solid var(--accent);color:var(--accent);font-size:11px;font-weight:700;padding:6px 12px;border-radius:100px;}

        .price-num{font-family:'Instrument Serif',serif;font-size:42px;font-weight:400;color:var(--tx);}
        .pricing-card .text-xs{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--tx3);}
        .pricing-card.featured .text-xs{color:var(--accent);}
        .pricing-card .text-sm{font-size:14px;color:var(--tx2);}
        .pricing-card ul{list-style:none;}
        .pricing-card li{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--tx2);margin-bottom:10px;}
        .pricing-card li svg{width:16px;height:16px;flex-shrink:0;}
        .pricing-card li.off{color:var(--tx3);opacity:0.6;}
        .pricing-card li.off svg{stroke:var(--tx3);}

        svg.icon { width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
      ` }} />

      <nav className="sticky top-0 z-50 bg-[#0A0F1E] border-b border-white/10 px-6 py-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold font-syne tracking-tighter">AR<span className="text-[#6C63FF]">FA</span></div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-500 hidden sm:block">Lead generation studio</div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors font-bold">Dashboard</Link>
          <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors font-bold">Pricing</Link>
          <Link href="/authentication?tab=login" className="text-gray-400 hover:text-white transition-colors font-bold">Login</Link>
          <Link href="/authentication?tab=signup" className="px-5 py-2 bg-[#6C63FF] hover:bg-[#5a54e0] rounded-xl font-semibold transition-all text-white">Get Started</Link>
        </div>
      </nav>

      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-16">
        <section className="w-full max-w-6xl">
          <div className="pricing-wrap">
            <div className="pricing-head">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#A78BFA] mb-6">Pricing Plans</p>
              <h1 className="pricing-headline font-syne">Choose the right plan <br/> and keep building.</h1>
              <p style={{fontSize:'14px', color:'var(--tx3)', marginTop:'16px'}}>No hidden fees. Cancel anytime. Start free today.</p>
              <div className="pricing-toggle-wrap">
                <span style={{fontSize:'14px', fontWeight:!isAnnual ? 700 : 400, color:!isAnnual ? 'var(--tx)' : 'var(--tx3)'}}>Monthly</span>
                <div className={`pill-toggle ${isAnnual ? 'an' : ''}`} onClick={() => setIsAnnual(!isAnnual)}>
                  <div className="pill-toggle-thumb"></div>
                </div>
                <span style={{fontSize:'14px', fontWeight:isAnnual ? 700 : 400, color:isAnnual ? 'var(--tx)' : 'var(--tx3)'}}>Annual</span>
                {isAnnual && <span className="save-badge">Save 25%</span>}
              </div>

              <div className="pricing-cards">
                {PRICING_PLANS.map((plan, index) => {
                  const planAmount = plan.price === '0' ? '0' : isAnnual ? (parseFloat(plan.price) * 9).toFixed(2) : plan.price;
                  return (
                    <div key={index} className={`pricing-card ${plan.highlight ? 'featured' : ''}`}>
                      {plan.highlight && <div className="featured-badge">Most Popular</div>}
                      <div className="text-xs">{plan.badge}</div>
                      <div style={{marginTop: '12px', marginBottom: '4px'}}>
                        <span className="price-num">${planAmount}</span>
                        <span style={{fontSize: '14px', color: 'var(--tx2)', marginLeft: '4px'}}>/ {isAnnual ? 'year' : plan.period}</span>
                      </div>
                      {plan.description && <p style={{fontSize: '13px', color: 'var(--tx2)', marginBottom: '20px'}}>{plan.description}</p>}
                      <ul style={{marginBottom: '24px', flex: 1}}>
                        {plan.features.map((feature, fIndex) => (
                          <li key={fIndex} className={feature.included ? '' : 'off'}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              {feature.included ? (
                                <polyline points="13.5 2 6 9.5 2.5 6" />
                              ) : (
                                <line x1="2" y1="8" x2="14" y2="8" />
                              )}
                            </svg>
                            {feature.text}
                          </li>
                        ))}
                      </ul>
                      {plan.link ? (
                        <Link href={`${plan.link}${plan.name === 'Free' ? '' : `?plan=${encodeURIComponent(plan.name)}&period=${isAnnual ? 'year' : 'month'}`}`} className="btn btn-primary" style={{width: '100%', textAlign: 'center'}}>
                          {plan.name === 'Free' ? 'Start Free' : 'Start Building'}
                        </Link>
                      ) : (
                        <button className="btn btn-outline" style={{width: '100%'}} disabled>
                          {plan.cta}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/10 px-8 text-center text-sm text-gray-600">
        © 2024 ARFA Inc. All rights reserved.
      </footer>
    </div>
  );
}