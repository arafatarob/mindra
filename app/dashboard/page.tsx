"use client";
import React, { useState } from 'react';

type PageId = 'find-leads' | 'my-leads' | 'pipeline' | 'follow-ups' | 'compose' | 'templates' | 'exports' | 'support' | 'plan' | 'settings';

export default function Dashboard() {
  const [activePage, setActivePage] = useState<PageId>('find-leads');
  const [settingsTab, setSettingsTab] = useState('profile');
  const [searchKw, setSearchKw] = useState('');
  const [searchLoc, setSearchLoc] = useState('');
  const [resultLabel, setResultLabel] = useState('Showing sample leads');
  const [isAnnual, setIsAnnual] = useState(false);

  const pricing = {
    starter: { mo: 29, an: 22 },
    outbound: { mo: 89, an: 67 }
  };

  const handleSearch = () => {
    const label = [searchKw, searchLoc].filter(Boolean).join(' in ') || 'All leads';
    setResultLabel(`Results for "${label}"`);
  };

  return (
    <div className="app min-h-screen">
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
          --sidebar:220px;
          
          /* Plan Variables */
          --color-text-primary: #ffffff;
          --color-text-secondary: #94a3b8;
          --color-text-tertiary: #64748b;
          --color-text-success: #10b981;
          --color-text-info: #6366f1;
          --color-background-primary: #111827;
          --color-background-secondary: #1f2937;
          --color-background-success: rgba(16, 185, 129, 0.1);
          --color-background-info: rgba(99, 102, 241, 0.1);
          --color-border-secondary: #334155;
          --color-border-tertiary: rgba(255,255,255,0.08);
          --color-border-info: #6366f1;
          --border-radius-xl: 24px;
          --border-radius-md: 12px;
        }
        body { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--tx); font-size:14px; -webkit-font-smoothing: antialiased; }
        .font-instrument { font-family: 'Instrument Serif', serif; }
        .font-syne { font-family: 'Syne', sans-serif; }

        .app { display:flex; height:100vh; overflow:hidden; }
        .sidebar { width:var(--sidebar); background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; flex-shrink:0; }
        .content { flex:1; overflow-y:auto; display:flex; flex-direction:column; }
        .page { display:none; flex-direction:column; flex:1; animation: fadeIn 0.3s ease-out; }
        .page.active { display:flex; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        .sb-brand { padding:24px 20px; }
        .sb-logo { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; letter-spacing:-1px; color:var(--tx); }
        .sb-logo span { color:var(--accent); }
        .sb-nav { padding:10px; flex:1; }
        .nav-group-label { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--tx3); padding:10px 12px; }
        .nav-item { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:10px; color:var(--tx2); cursor:pointer; transition:all .2s; font-size:13px; font-weight:500; }
        .nav-item:hover { background:var(--surface-light); color:var(--tx); }
        .nav-item.active { background:var(--accent-glow); color:var(--accent); }
        .nav-badge { margin-left:auto; font-size:10px; font-weight:700; padding:2px 8px; border-radius:100px; background:var(--surface-light); }

        .topbar { padding:20px 32px; border-bottom:1px solid var(--border); background:rgba(10,15,30,0.8); backdrop-blur:md; display:flex; align-items:center; justify-content:space-between; sticky top:0; z-index:10; }
        .page-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:700; }
        .btn { padding:10px 20px; border-radius:10px; font-weight:600; cursor:pointer; transition:all .2s; border:none; font-size:13px; }
        .btn-primary { background:var(--accent); color:#fff; box-shadow: 0 4px 15px rgba(108,99,255,0.3); }
        .btn-primary:hover { transform: translateY(-1px); background: #5a54e0; }
        .btn-outline { background:transparent; border:1px solid var(--border); color:var(--tx); }
        .btn-outline:hover { background:var(--surface-light); border-color:var(--tx3); }
        .body { padding:32px; flex:1; }

        .stat-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:18px 20px; }
        
        .lead-card { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:20px; margin-bottom:12px; display:flex; align-items:center; gap:16px; transition:all .2s; }
        .lead-card:hover { border-color:var(--border-hover); background:var(--surface-light); }

        .search-bar { display:flex; gap:12px; margin-bottom:24px; background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:16px 20px; align-items:center; }
        .search-input { flex:1; border:none; outline:none; font-size:14px; background:transparent; color:var(--tx); }

        /* --- My Plan Custom Styles --- */
        .pricing-wrap{padding:1rem 0;}
        .pricing-head{text-align:center;margin-bottom:2rem;}
        .pricing-eyebrow{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-bottom:10px;}
        .pricing-headline{font-family:'Instrument Serif',serif;font-size:48px;font-weight:400;letter-spacing:-1px;line-height:1.1;margin-bottom:8px;}
        .pricing-toggle-wrap{display:flex;align-items:center;justify-content:center;gap:12px;margin:2rem 0 3rem;}
        .pill-toggle{width:48px;height:26px;border-radius:100px;background:var(--accent);cursor:pointer;position:relative;}
        .pill-toggle-thumb{width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:left .2s;}
        .pill-toggle.an .pill-toggle-thumb{left:25px;}
        .pricing-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
        .pricing-card{background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:32px;display:flex;flex-direction:column;position:relative;}
        .pricing-card.featured{border:2px solid var(--accent);box-shadow: 0 10px 40px rgba(108,99,255,0.15);}
        .featured-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;font-size:11px;font-weight:700;padding:4px 14px;border-radius:100px;}
        .price-num{font-family:'Instrument Serif',serif;font-size:52px;line-height:1;}
        .save-badge{font-size:11px;font-weight:700;background:var(--green-bg);color:var(--green);padding:2px 8px;border-radius:100px;}

        svg.icon { width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
      ` }} />

      {/* --- SIDEBAR --- */}
      <div className="sidebar">
        <div className="sb-brand">
          <div className="sb-logo">Lead<span>Pulse</span></div>
        </div>
        <div className="sb-nav">
          <div className="nav-group">
            <div className="nav-group-label">Prospecting</div>
            <NavItem id="find-leads" label="Find Leads" icon={<SearchIcon />} activePage={activePage} onClick={setActivePage} />
            <NavItem id="my-leads" label="My Leads" icon={<UsersIcon />} activePage={activePage} onClick={setActivePage} badge="47" />
            <NavItem id="pipeline" label="Pipeline" icon={<PipelineIcon />} activePage={activePage} onClick={setActivePage} badge="12" />
            <NavItem id="follow-ups" label="Follow-Ups" icon={<BellIcon />} activePage={activePage} onClick={setActivePage} badge="3" badgeColor="#DC2626" badgeBg="#FEE2E2" />
          </div>

          <div className="nav-group">
            <div className="nav-group-label">Outreach</div>
            <NavItem id="compose" label="Compose Email" icon={<MailIcon />} activePage={activePage} onClick={setActivePage} />
            <NavItem id="templates" label="Templates" icon={<FileIcon />} activePage={activePage} onClick={setActivePage} />
          </div>

          <div className="nav-group">
            <div className="nav-group-label">Data & Support</div>
            <NavItem id="exports" label="Export / CSV" icon={<ExportIcon />} activePage={activePage} onClick={setActivePage} />
            <NavItem id="support" label="Customer Support" icon={<HelpIcon />} activePage={activePage} onClick={setActivePage} />
          </div>

          <div className="nav-group">
            <div className="nav-group-label">Billing</div>
            <NavItem id="plan" label="My Plan" icon={<StarIcon />} activePage={activePage} onClick={setActivePage} />
            <NavItem id="settings" label="Settings" icon={<SettingsIcon />} activePage={activePage} onClick={setActivePage} />
          </div>
        </div>
        <div className="sb-footer">
          <div className="sb-user">
            <div className="u-ava">AR</div>
            <div>
              <div className="u-name">Alex Rivera</div>
              <div style={{fontSize:'11px', color:'var(--accent)', fontWeight:700}}>Pro User</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        {/* --- 1. FIND LEADS --- */}
        <div className={`page ${activePage === 'find-leads' ? 'active' : ''}`}>
          <div className="topbar">
            <div className="page-title">Find Leads</div>
            <div className="topbar-right">
              <span style={{fontSize:'12px', color:'var(--tx3)'}}>275 of 300 leads remaining</span>
              <button className="btn btn-primary ml-4" onClick={() => setActivePage('plan')}>Upgrade Plan</button>
            </div>
          </div>
          <div className="body">
            <div className="search-bar">
              <SearchIcon style={{color:'var(--tx3)'}} />
              <input className="search-input" placeholder="Search by industry or business type..." value={searchKw} onChange={(e)=>setSearchKw(e.target.value)} />
              <div style={{width:'1px', height:'20px', background:'var(--border)'}}></div>
              <select className="search-select" value={searchLoc} onChange={(e)=>setSearchLoc(e.target.value)}>
                <option value="">All Locations</option>
                <option>United States</option><option>United Kingdom</option><option>Dubai</option><option>Dhaka, BD</option>
              </select>
              <button className="btn btn-primary btn-sm" onClick={handleSearch}>Search</button>
            </div>
            <div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'14px'}}>
                <div style={{fontWeight:600}}>{resultLabel}</div>
                <a style={{fontSize:'12px', color:'var(--tx3)', cursor:'pointer'}} onClick={()=>setActivePage('exports')}>Export all as CSV →</a>
              </div>
              <LeadCard name="Brickell Smile Studio" cat="Dental Clinic" score="HIGH" loc="Miami, FL" />
              <LeadCard name="Palm Atlas Media" cat="Marketing Agency" score="HIGH" loc="Dubai, UAE" />
              <LeadCard name="Southbank Strength" cat="Gym" score="MEDIUM" loc="London, UK" />
            </div>
          </div>
        </div>

        {/* --- 2. MY LEADS --- */}
        <div className={`page ${activePage === 'my-leads' ? 'active' : ''}`}>
          <div className="topbar"><div className="page-title">My Leads</div></div>
          <div className="body">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Business</th><th>Email</th><th>Location</th><th>Score</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  <TableRow name="Brickell Smile Studio" email="hello@brickell.com" loc="Miami" score="HIGH" status="Not Contacted" />
                  <TableRow name="Palm Atlas Media" email="growth@palmatlas.ae" loc="Dubai" score="HIGH" status="Contacted" />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- 3. PIPELINE --- */}
        <div className={`page ${activePage === 'pipeline' ? 'active' : ''}`}>
          <div className="topbar"><div className="page-title">Pipeline</div></div>
          <div className="body">
            <div className="pipeline-grid">
              <PipelineCol title="Discovered" count="4" />
              <PipelineCol title="Contacted" count="3" />
              <PipelineCol title="Negotiating" count="3" />
              <PipelineCol title="Won" count="2" color="var(--green)" />
            </div>
          </div>
        </div>

        {/* --- 4. FOLLOW-UPS --- */}
        <div className={`page ${activePage === 'follow-ups' ? 'active' : ''}`}>
          <div className="topbar"><div className="page-title">Follow-Ups</div></div>
          <div className="body">
             <div className="empty-state">
                <div className="empty-icon">⏰</div>
                <div className="empty-title">All caught up!</div>
                <div className="empty-desc">You have no follow-ups due today. Great job managing your pipeline.</div>
             </div>
          </div>
        </div>

        {/* --- 5. COMPOSE --- */}
        <div className={`page ${activePage === 'compose' ? 'active' : ''}`}>
          <div className="topbar"><div className="page-title">Compose Email</div></div>
          <div className="body">
            <div className="compose-box">
              <input className="compose-input" placeholder="To:" />
              <input className="compose-input" placeholder="Subject:" />
              <textarea className="compose-input" style={{minHeight:'200px', padding:'12px'}} placeholder="Write your message..."></textarea>
              <button className="btn btn-primary">Send Email →</button>
            </div>
          </div>
        </div>

        {/* --- 6. TEMPLATES --- */}
        <div className={`page ${activePage === 'templates' ? 'active' : ''}`}>
          <div className="topbar"><div className="page-title">Templates</div></div>
          <div className="body">
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px'}}>
              <TemplateCard title="The Direct Ask" desc="Short, punchy, high open rate for cold prospects." />
              <TemplateCard title="The Gentle Nudge" desc="Friendly follow-up for non-responders." />
            </div>
          </div>
        </div>

        {/* --- 7. EXPORTS --- */}
        <div className={`page ${activePage === 'exports' ? 'active' : ''}`}>
          <div className="topbar"><div className="page-title">Export / CSV</div></div>
          <div className="body">
             <div className="stat-card">
                <div style={{fontWeight:600, marginBottom:'8px'}}>Recent Exports</div>
                <div style={{fontSize:'13px', color:'var(--tx2)'}}>All Leads Export - Apr 17, 2024</div>
                <button className="btn btn-outline btn-sm mt-4">Download Again</button>
             </div>
          </div>
        </div>

        {/* --- 8. SUPPORT (NEW) --- */}
        <div className={`page ${activePage === 'support' ? 'active' : ''}`}>
          <div className="topbar"><div className="page-title">Support</div></div>
          <div className="body">
            <div className="empty-state">
              <div className="empty-icon">✉️</div>
              <div className="empty-title">Need help?</div>
              <div className="empty-desc">Our team is here to help you get the most out of ALPA. Send us a message and we'll get back to you within 24 hours.</div>
              <button className="btn btn-primary">Contact Support Team</button>
              <div style={{marginTop:'20px', fontSize:'12px', color:'var(--tx3)'}}>Or email us directly at support@mindra.com</div>
            </div>
          </div>
        </div>

        {/* --- 9. PLAN --- */}
        <div className={`page ${activePage === 'plan' ? 'active' : ''}`}>
          <div className="topbar"><div className="page-title">My Plan</div></div>
          <div className="body">
            {/* --- Modern Pricing Content --- */}
            <div className="pricing-wrap">
              <div className="pricing-head">
                <div className="pricing-eyebrow">Simple pricing</div>
                <h1 className="pricing-headline">Find leads. Close clients.<br /><em className="italic">Pay only for what you use.</em></h1>
                <p className="text-gray-400 mt-4">No hidden fees. Cancel anytime. Start free today.</p>
              </div>

              <div className="pricing-toggle-wrap">
                <span className={`text-sm ${!isAnnual ? 'text-white font-bold' : 'text-gray-500'}`}>Monthly</span>
                <div className={`pill-toggle ${isAnnual ? 'an' : ''}`} onClick={() => setIsAnnual(!isAnnual)}>
                  <div className="pill-toggle-thumb"></div>
                </div>
                <span className={`text-sm ${isAnnual ? 'text-white font-bold' : 'text-gray-500'}`}>Annual</span>
                <span className="save-badge ml-2" style={{opacity: isAnnual ? 1 : 0.4}}>Save 25%</span>
              </div>

              <div className="pricing-cards">
                {/* FREE */}
                <div className="pricing-card">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Free</div>
                  <p className="text-sm text-gray-400 mb-6">See how quickly LeadPulse surfaces leads before you commit.</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-2xl text-gray-500 font-instrument">$</span>
                    <span className="price-num">0</span>
                    <span className="text-sm text-gray-500">/ one-time</span>
                  </div>
                  <div className="h-px bg-white/5 mb-6"></div>
                  <ul className="flex-1 space-y-4 mb-8">
                    <PricingFeat text="25 verified leads" />
                    <PricingFeat text="CSV export" />
                    <PricingFeat text="Fast business discovery" />
                    <PricingFeat text="Outreach tools" off />
                    <PricingFeat text="Pipeline & follow-ups" off />
                  </ul>
                  <button className="btn btn-outline w-full">Start for free</button>
                </div>

                {/* STARTER */}
                <div className="pricing-card featured">
                  <span className="featured-badge">Most popular</span>
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">Starter</div>
                  <p className="text-sm text-gray-400 mb-6">Move from finding people to starting real conversations.</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl text-gray-500 font-instrument">$</span>
                    <span className="price-num">{isAnnual ? pricing.starter.an : pricing.starter.mo}</span>
                    <span className="text-sm text-gray-500 ml-1">/ month</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mb-8 min-h-[15px]">
                    {isAnnual && `$${pricing.starter.an * 12} billed annually — save $${(pricing.starter.mo - pricing.starter.an) * 12}`}
                  </div>
                  <div className="h-px bg-white/5 mb-6"></div>
                  <ul className="flex-1 space-y-4 mb-8">
                    <PricingFeat text="300 verified leads / month" active />
                    <PricingFeat text="Email outreach tools" active />
                    <PricingFeat text="1 email template" active />
                    <PricingFeat text="Pipeline & follow-ups" active />
                    <PricingFeat text="Multi-campaign outreach" off />
                  </ul>
                  <button className="btn btn-primary w-full" style={{background: 'var(--accent)'}}>Get started →</button>
                </div>

                {/* ENGINE */}
                <div className="pricing-card">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Outbound Engine</div>
                  <p className="text-sm text-gray-400 mb-6">For teams ready to reach more people with high volume.</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl text-gray-500 font-instrument">$</span>
                    <span className="price-num">{isAnnual ? pricing.outbound.an : pricing.outbound.mo}</span>
                    <span className="text-sm text-gray-500 ml-1">/ month</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mb-8 min-h-[15px]">
                    {isAnnual && `$${pricing.outbound.an * 12} billed annually — save $${(pricing.outbound.mo - pricing.outbound.an) * 12}`}
                  </div>
                  <div className="h-px bg-white/5 mb-6"></div>
                  <ul className="flex-1 space-y-4 mb-8">
                    <PricingFeat text="1,000+ verified leads / month" />
                    <PricingFeat text="Unlimited email templates" />
                    <PricingFeat text="Multi-campaign outreach" />
                    <PricingFeat text="Pipeline tools" />
                    <PricingFeat text="Priority support" />
                  </ul>
                  <button className="btn btn-outline w-full">Join waitlist</button>
                </div>
              </div>

              <div className="text-center text-xs text-gray-600 mt-12 leading-relaxed">
                All plans include verified contact data and fast business discovery.<br />
                No setup fees. Upgrade, downgrade, or cancel any time.
              </div>
            </div>
          </div>
        </div>

        {/* --- 10. SETTINGS --- */}
        <div className={`page ${activePage === 'settings' ? 'active' : ''}`}>
          <div className="topbar"><div className="page-title">Settings</div></div>
          <div className="body">
            <div className="settings-grid">
              <div className="sidebar" style={{background:'transparent', border:'none'}}>
                <div className={`s-nav-item ${settingsTab === 'profile' ? 'active' : ''}`} onClick={()=>setSettingsTab('profile')}>Profile</div>
                <div className={`s-nav-item ${settingsTab === 'account' ? 'active' : ''}`} onClick={()=>setSettingsTab('account')}>Account</div>
              </div>
              <div className="settings-panel">
                {settingsTab === 'profile' && (
                  <div>
                    <div style={{fontWeight:600, marginBottom:'14px'}}>Profile Information</div>
                    <input className="s-input" placeholder="First Name" defaultValue="Alex" />
                    <input className="s-input" placeholder="Last Name" defaultValue="Rivera" />
                    <button className="btn btn-primary btn-sm">Save Changes</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* --- REUSABLE UI COMPONENTS --- */

function PricingFeat({ text, off, active }: { text: string; off?: boolean; active?: boolean }) {
  return (
    <li className={`flex items-start gap-3 text-[13px] ${off ? 'text-gray-600' : 'text-gray-300'}`}>
      {off ? (
        <svg className="w-4 h-4 mt-0.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className={`w-4 h-4 mt-0.5 ${active ? 'text-indigo-400' : 'text-emerald-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {text}
    </li>
  );
}

function NavItem({ id, label, icon, activePage, onClick, badge, badgeBg, badgeColor }: any) {
  return (
    <a className={`nav-item ${activePage === id ? 'active' : ''}`} onClick={() => onClick(id)}>
      {icon}
      {label}
      {badge && <span className="nav-badge" style={{background: badgeBg, color: badgeColor}}>{badge}</span>}
    </a>
  );
}

function LeadCard({ name, cat, score, loc }: any) {
  return (
    <div className="lead-card">
      <span className={`lead-score-badge ${score === 'HIGH' ? 'score-high' : 'score-medium'}`}>{score}</span>
      <div style={{flex:1}}>
        <div style={{fontWeight:600}}>{name}</div>
        <div style={{fontSize:'12px', color:'var(--tx3)'}}>{cat}</div>
      </div>
      <div style={{fontSize:'11px', color:'var(--tx3)'}}>{loc}</div>
      <button className="btn btn-primary btn-sm ml-4">Outreach</button>
    </div>
  );
}

function TableRow({ name, email, loc, score, status }: any) {
  return (
    <tr>
      <td style={{fontWeight:500}}>{name}</td>
      <td>{email}</td>
      <td>{loc}</td>
      <td><span className={`status-pill ${score === 'HIGH' ? 'pill-green' : 'pill-amber'}`}>{score}</span></td>
      <td><span className="status-pill pill-gray">{status}</span></td>
      <td><button className="btn btn-outline btn-sm">View</button></td>
    </tr>
  );
}

function PipelineCol({ title, count, color }: any) {
  return (
    <div className="pipe-col">
      <div style={{padding:'12px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between'}}>
        <div style={{fontSize:'12px', fontWeight:600, color}}>{title}</div>
        <span style={{fontSize:'11px', color:'var(--tx3)'}}>{count}</span>
      </div>
      <div style={{padding:'10px'}}>
        <div className="pipe-card"><div style={{fontSize:'13px'}}>Sample Deal</div></div>
      </div>
    </div>
  );
}

function TemplateCard({ title, desc }: any) {
  return (
    <div className="template-card">
      <div style={{fontSize:'14px', fontWeight:600}}>{title}</div>
      <div style={{fontSize:'12px', color:'var(--tx2)', marginTop:'6px'}}>{desc}</div>
      <button className="btn btn-outline btn-sm mt-4">Edit Template</button>
    </div>
  );
}

/* --- ICONS --- */

const SearchIcon = (props: any) => (
  <svg className="icon" viewBox="0 0 24 24" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
);
const UsersIcon = () => (
  <svg className="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const PipelineIcon = () => (
  <svg className="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
);
const BellIcon = () => (
  <svg className="icon" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
);
const MailIcon = () => (
  <svg className="icon" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
);
const FileIcon = () => (
  <svg className="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
);
const ExportIcon = () => (
  <svg className="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);
const HelpIcon = () => (
  <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);
const StarIcon = () => (
  <svg className="icon" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
);
const SettingsIcon = () => (
  <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);