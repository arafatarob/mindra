"use client";
import React, { useState } from 'react';

type PageId = 'dashboard' | 'find-leads' | 'my-leads' | 'pipeline' | 'compose' | 'templates' | 'exports' | 'support' | 'plan' | 'settings';

export default function Dashboard() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [settingsTab, setSettingsTab] = useState('profile');
  const [searchKw, setSearchKw] = useState('');
  const [searchLoc, setSearchLoc] = useState('');
  const [resultLabel, setResultLabel] = useState('Showing sample leads');
  const [countrySearch, setCountrySearch] = useState('');
  const [filters, setFilters] = useState({
    verified: true,
    website: true,
    highScore: false
  });
  const [isAnnual, setIsAnnual] = useState(false);
  const [myLeadsFilter, setMyLeadsFilter] = useState('all');

  const TEMPLATES_DATA = [
    { title: 'The Direct Ask', category: 'Cold Outreach', description: 'Short, punchy, one clear question. High open rate for cold prospects.', stats: '44% open rate · 12% reply rate · Used 18+' },
    { title: 'The Gentle Nudge', category: 'Follow-up', description: 'Friendly follow-up for non-responders. Sent 3-5 days after initial email.', stats: '38% open rate · 8% reply rate · Used 22+' },
    { title: 'The Case Study Drop', category: 'Value Lead', description: 'Share a relevant result before asking for anything. Builds credibility fast.', stats: '29% open rate · 7% reply rate · Used 14+' },
    { title: 'The Last Touch', category: 'Breakup', description: 'Final email in a sequence. Creates urgency without being pushy.', stats: '21% open rate · 5% reply rate · Used 80+' },
    { title: 'The Warm Intro Ask', category: 'Referral', description: 'Ask for a referral after a positive conversation or closed deal.', stats: '62% open rate · 34% reply rate · Used 8+' },
  ];

  const EXPORT_HISTORY = [
    { name: 'All Leads Export', details: '47 leads', date: 'Apr 17, 2026 - 9:42 AM' },
    { name: 'High Score Leads', details: '28 leads', date: 'Apr 14, 2026 - 3:15 PM' },
    { name: 'Dubai & UAE Leads', details: '9 leads', date: 'Apr 10, 2026 - 9:00 AM' },
  ];


  // New Find Leads Wizard State
  const [findStep, setFindStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLoc, setSelectedLoc] = useState('');
  const [selectedVol, setSelectedVol] = useState(100);
  const [isSearching, setIsSearching] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [searchProgress, setSearchProgress] = useState({ a: 0, b: 0, c: 0 });
  const [searchLogs, setSearchLogs] = useState<{msg: string, time: string}[]>([]);
  const [timer, setTimer] = useState(0);

  const LEADS_DATA = [
    {name:'Brickell Smile Studio',cat:'Dental clinic',email:'hello@brickellsmile.com',phone:'+1-305-577-1133',site:'brickellsmile.com',loc:'Miami, FL',score:'high'},
    {name:'Southbank Strength',cat:'Gym',email:'team@southbankstrength.co.uk',phone:null,site:'southbankstrength.co.uk',loc:'London, UK',score:'med'},
    {name:'Palm Atlas Media',cat:'Marketing agency',email:'growth@palmatlasmedia.ae',phone:'+971-4-123-4567',site:'palmatlasmedia.ae',loc:'Dubai, UAE',score:'high'},
    {name:'Harbour Flame Dining',cat:'Restaurant',email:'bookings@harbourflame.com.au',phone:null,site:'harbourflame.com.au',loc:'Sydney, AU',score:'med'},
    {name:'Lakefront Keys Group',cat:'Real estate',email:'sales@lakefrontkeys.ca',phone:'+1-416-555-0123',site:'lakefrontkeys.ca',loc:'Toronto, CA',score:'high'},
    {name:'Nordic Brow Studio',cat:'Beauty salon',email:'hello@nordicbrow.se',phone:null,site:'nordicbrow.se',loc:'Stockholm, SE',score:'med'},
    {name:'Clearview Tax Partners',cat:'Finance / Accounting',email:'info@clearviewtax.com',phone:'+1-312-555-0199',site:'clearviewtax.com',loc:'Chicago, IL',score:'high'},
    {name:'Sunrise Legal Group',cat:'Law firm',email:'contact@sunriselegal.com',phone:null,site:'sunriselegal.com',loc:'Phoenix, AZ',score:'high'},
  ];

  const ALL_COUNTRIES = [
    { n: 'United States', f: '🇺🇸', s: 'All states' },
    { n: 'United Kingdom', f: '🇬🇧', s: 'All regions' },
    { n: 'Canada', f: '🇨🇦', s: 'All provinces' },
    { n: 'Australia', f: '🇦🇺', s: 'All states' },
    { n: 'UAE / Dubai', f: '🇦🇪', s: 'All emirates' },
    { n: 'Bangladesh', f: '🇧🇩', s: 'All divisions' },
    { n: 'Germany', f: '🇩🇪', s: 'All states' },
    { n: 'France', f: '🇫🇷', s: 'All regions' },
    { n: 'India', f: '🇮🇳', s: 'All states' },
    { n: 'Netherlands', f: '🇳🇱', s: 'All provinces' },
    { n: 'Singapore', f: '🇸🇬', s: 'City state' },
    { n: 'Switzerland', f: '🇨🇭', s: 'All cantons' },
    { n: 'Sweden', f: '🇸🇪', s: 'All counties' },
    { n: 'Norway', f: '🇳🇴', s: 'All counties' },
    { n: 'Denmark', f: '🇩🇰', s: 'All regions' },
    { n: 'New Zealand', f: '🇳🇿', s: 'All regions' },
    { n: 'Spain', f: '🇪🇸', s: 'All regions' },
    { n: 'Italy', f: '🇮🇹', s: 'All regions' },
  ];

  const addLog = (msg: string) => {
    const now = new Date();
    const t = now.getHours() + ':' + String(now.getMinutes()).padStart(2,'0') + ':' + String(now.getSeconds()).padStart(2,'0');
    setSearchLogs(prev => [...prev, { msg, time: t }]);
  };

  const startSearchFlow = () => {
    setIsSearching(true);
    setFindStep(0);
    setTimer(0);
    setSearchProgress({ a: 0, b: 0, c: 0 });
    setSearchLogs([]);
    
    const industry = searchKw || selectedIndustry || 'businesses';
    addLog(`Starting search for ${industry} in ${selectedLoc || 'all regions'}`);

    // Simulation Logic
    setTimeout(() => {
      addLog('Scanning social profiles and business directories for decision makers…');
      let pA = 0;
      const intA = setInterval(() => {
        pA += 5;
        setSearchProgress(s => ({ ...s, a: pA }));
        if (pA >= 100) {
          clearInterval(intA);
          addLog('Found 847 potential owners & managers');
          // Start Step B
          setTimeout(() => {
            addLog('Extracting direct contact info & LinkedIn profiles…');
            let pB = 0;
            const intB = setInterval(() => {
              pB += 5;
              setSearchProgress(s => ({ ...s, b: pB }));
              if (pB >= 100) {
                clearInterval(intB);
                addLog('Enriched 312 decision makers with verified emails');
                // Start Step C
                setTimeout(() => {
                  addLog('Verifying personal emails and scoring leads…');
                  let pC = 0;
                  const intC = setInterval(() => {
                    pC += 5;
                    setSearchProgress(s => ({ ...s, c: pC }));
                    if (pC >= 100) {
                      clearInterval(intC);
                      addLog(`Done — ${selectedVol} verified leads ready for outreach`);
                      setIsSearching(false);
                      setShowFinalResults(true);
                    }
                  }, 100);
                }, 400);
              }
            }, 100);
          }, 400);
        }
      }, 100);
    }, 800);
  };

  React.useEffect(() => {
    let interval: any;
    if (isSearching) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const filteredLeads = LEADS_DATA.filter(lead => {
    if (myLeadsFilter === 'all') return true;
    if (myLeadsFilter === 'enriched') return lead.score === 'high';
    if (myLeadsFilter === 'email') return !!lead.email;
    if (myLeadsFilter === 'phone') return !!lead.phone;
    return true;
  });

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

        .db-checkpoint-card {
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .db-checkpoint-card .title {
          font-size: 18px;
          font-weight: 600;
          color: var(--tx);
        }
        .db-checkpoint-card .free-plan-leads-limit {
          font-size: 14px;
          color: var(--tx2);
        }
        .db-checkpoint-card .leads-count {
          font-size: 32px;
          font-weight: 700;
          color: var(--tx);
        }
        .db-checkpoint-card .usage-details {
          font-size: 14px;
          color: var(--tx2);
        }
        .db-checkpoint-card .actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        .db-usage-bar {
          margin-top: 24px;
        }
        .db-usage-bar .title {
          font-size: 16px;
          font-weight: 600;
          color: var(--tx);
          margin-bottom: 12px;
        }
        .db-usage-bar .bar {
          width: 100%;
          height: 8px;
          background-color: var(--surface-light);
          border-radius: 4px;
          overflow: hidden;
        }
        .db-usage-bar .bar .progress {
          width: 20%;
          height: 100%;
          background-color: var(--accent);
          border-radius: 4px;
        }
        .db-usage-bar .limit-text {
          margin-top: 8px;
          font-size: 12px;
          color: var(--tx2);
        }
        .db-date-range {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
        }
        .db-date-range select {
          background-color: var(--surface-light);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 12px;
          color: var(--tx);
          font-size: 14px;
        }
        .db-stats-grid {
          margin-top: 24px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .db-stat-card {
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
        }
        .db-stat-card .title {
          font-size: 16px;
          font-weight: 600;
          color: var(--tx);
        }
        .db-stat-card .value {
          font-size: 32px;
          font-weight: 700;
          color: var(--tx);
          margin-top: 8px;
        }
        .db-footer {
          margin-top: 40px;
          text-align: center;
          font-size: 14px;
          color: var(--tx2);
        }
        .db-footer a {
          color: var(--accent);
          text-decoration: none;
        }

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
        .nav-item:hover { background:var(--surface-light); color:var(--tx); text-decoration: none; }
        .nav-item.active { background:var(--accent-glow); color:var(--accent); }
        .nav-badge { margin-left:auto; font-size:10px; font-weight:700; padding:2px 8px; border-radius:100px; background:var(--surface-light); }

        .topbar { padding:20px 32px; border-bottom:1px solid var(--border); background:rgba(10,15,30,0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display:flex; align-items:center; justify-content:space-between; position: sticky; top:0; z-index:10; }
        .page-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:700; }
        .btn { padding:10px 20px; border-radius:10px; font-weight:600; cursor:pointer; transition:all .2s; border:none; font-size:13px; }
        .btn-primary {background: var(--accent);color: #fff;box-shadow: 0 4px 15px rgba(108,99,255,0.3);padding: 6px 20px;border-radius: 6px;cursor: pointer}
        .btn-primary:hover { transform: translateY(-1px); background: #5a54e0; }
        .btn-outline {cursor: pointer;background: transparent;border: 1px solid var(--border);color: var(--tx);transition: all .2s;padding: 6px 20px;border-radius: 6px;cursor:pointer;}
        .btn-outline:hover { background:var(--surface-light); border-color:var(--tx3); }
        .body { padding:32px; flex:1; }

        .stat-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:18px 20px; }
        
        .lead-card { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:20px; margin-bottom:12px; display:flex; align-items:center; gap:16px; transition:all .2s; }
        .lead-card:hover { border-color:var(--border-hover); background:var(--surface-light); }

        /* New Wizard Styles */
        .wizard{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px 28px 24px;margin-bottom:16px;}
        .step-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;}
        .step-tag{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--tx3);}
        .step-dots{display:flex;gap:6px;}
        .step-dot{width:6px;height:6px;border-radius:50%;background:var(--border);transition:all .3s;}
        .step-dot.done{background:var(--accent);}
        .step-dot.active{background:var(--accent);width:18px;border-radius:3px;}
        .step-q{font-size:20px;font-weight:500;letter-spacing:-.3px;margin-bottom:20px;}
        
        .field-label{font-size:12px;color:var(--tx2);margin-bottom:7px;font-weight:500;letter-spacing:.03em;}
        .field-input{width:100%;padding:11px 14px;background:var(--surface-light);border:1px solid var(--border);border-radius:10px;color:var(--tx);font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color .2s;}
        .field-input:focus{border-color:var(--accent);}

        .chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;}
        .chip{padding:7px 14px;background:var(--surface-light);border:1px solid var(--border);border-radius:100px;font-size:12px;font-weight:500;color:var(--tx2);cursor:pointer;transition:all .18s;user-select:none;}
        .chip:hover{border-color:var(--accent);color:var(--tx);}
        .chip.selected{background:var(--accent-glow);border-color:var(--accent);color:var(--accent);}

        .loc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
        .loc-card{padding:12px 14px;background:var(--surface-light);border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:10px;}
        .loc-card:hover{border-color:var(--accent);}
        .loc-card.selected{background:var(--accent-glow);border-color:var(--accent);}
        .loc-flag{font-size:18px;width:24px;text-align:center;}
        .loc-check{margin-left:auto;width:16px;height:16px;border-radius:50%;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;transition:all .18s;}
        .loc-card.selected .loc-check{background:var(--accent);border-color:var(--accent);}

        .vol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;}
        .vol-card{padding:14px;background:var(--surface-light);border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:all .18s;text-align:center;}
        .vol-card.selected{background:var(--accent-glow);border-color:var(--accent);}
        .vol-num{font-family:'Instrument Serif',serif;font-size:24px;font-weight:400;margin-bottom:2px;}
        .vol-lbl{font-size:11px;color:var(--tx2);}
        .vol-card.selected .vol-num { color: var(--accent); }
        .vol-card.selected .vol-lbl { color: var(--accent); }

        /* Button Layout Fixes */
        .btn-row{display:flex; justify-content:space-between; gap:16px; margin-top:32px;}
        .btn-next{flex: 1; padding:10px 20px; background:var(--accent); border:none; border-radius:10px; color:#fff; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all .2s; box-shadow: 0 4px 15px rgba(108,99,255,0.3);}
        .btn-next:hover{ transform: translateY(-1px); background: #5a54e0; }
        .btn-next:disabled{ background: var(--accent); opacity:.5; cursor:not-allowed; transform: none; box-shadow:none; }
        .btn-next:disabled:hover{ background: var(--accent); transform: none; }
        .btn-back-step{flex: 1; padding:13px 20px; background:transparent; border:1px solid var(--border); border-radius:10px; color:var(--tx2); font-family:'DM Sans',sans-serif; font-size:14px; cursor:pointer; transition:all .15s;}
        .btn-back-step:hover{border-color:var(--tx3); color:var(--tx); background:var(--surface-light);}

        /* Processing */
        .processing{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px 28px;margin-bottom:16px;}
        .proc-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}
        .proc-label{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--tx3);}
        .proc-timer{font-size:13px;font-weight:600;color:var(--tx2);}
        .proc-title{font-size:18px;font-weight:500;margin-bottom:20px;color:var(--tx);}
        .proc-item{margin-bottom:18px;}
        .proc-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
        .proc-name{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--tx2);}
        .proc-dot{width:8px;height:8px;border-radius:50%;background:var(--tx3);animation:pulse 2s infinite;}
        .proc-dot.running{background:var(--accent);animation:pulse 1s infinite;}
        .proc-dot.done{background:var(--green);}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .proc-pct{font-size:13px;font-weight:600;color:var(--tx2);}
        .proc-pct.done{color:var(--green);}
        .proc-bar-track{height:4px;background:var(--surface-light);border-radius:2px;overflow:hidden;}
        .proc-bar-fill{height:100%;background:linear-gradient(90deg,var(--accent),#8B7FFF);border-radius:2px;transition:width 0.3s ease;}
        .proc-bar-fill.done{background:var(--green);}
        .activity{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px 28px;}
        .act-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}
        .act-label{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--tx3);}
        .act-status{font-size:12px;font-weight:600;color:var(--tx2);}
        .act-log{display:flex;flex-direction:column;gap:10px;}
        .act-line{display:flex;gap:8px;font-size:13px;color:var(--tx2);align-items:center;}
        .act-arrow{color:var(--accent);}
        .act-time{margin-left:auto;color:var(--tx3);font-size:12px;}
        .act-empty{display:flex;align-items:center;justify-content:center;gap:10px;color:var(--tx3);padding:20px;text-align:center;font-size:13px;}
        
        .filter-tabs { display:flex; gap:8px; border-bottom:1px solid var(--border); margin-bottom:24px; }
        .tab { padding:10px 16px; font-size:13px; font-weight:500; color:var(--tx2); cursor:pointer; border-bottom:2px solid transparent; }
        .tab:hover { color:var(--tx); }
        .tab.active { color:var(--accent); border-bottom-color:var(--accent); }
        
        /* Compose Page */
        .compose-layout { display: flex; flex: 1; }
        .compose-main { flex: 1; padding: 32px; display: flex; flex-direction: column; }
        .compose-sidebar { width: 320px; border-left: 1px solid var(--border); padding: 24px; background-color: var(--surface); }
        .email-editor { background-color: var(--surface); border: 1px solid var(--border); border-radius: 16px; flex: 1; display: flex; flex-direction: column; }
        .editor-field { padding: 12px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 16px; }
        .editor-label { color: var(--tx2); font-size: 13px; width: 100px; }
        .editor-input { background: transparent; border: none; outline: none; color: var(--tx); font-size: 13px; flex: 1; }
        .editor-body { flex: 1; padding: 20px; }
        .editor-textarea { width: 100%; height: 100%; background: transparent; border: none; outline: none; color: var(--tx); font-size: 14px; resize: none; line-height: 1.6; }
        .editor-actions { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .sidebar-card { background-color: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 20px; }
        .sidebar-title { font-weight: 600; margin-bottom: 12px; font-size: 14px; }
        .sidebar-select { width: 100%; background: var(--surface-light); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; color: var(--tx); }
        
        /* Templates Page */
        .templates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 24px; }
        .template-card { background-color: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; }
        .template-card .category { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--tx3); margin-bottom: 8px; }
        .template-card .title { font-size: 18px; font-weight: 600; color: var(--tx); margin-bottom: 8px; }
        .template-card .description { color: var(--tx2); font-size: 13px; line-height: 1.6; flex: 1; margin-bottom: 16px; }
        .template-card .stats { font-size: 12px; color: var(--tx3); margin-bottom: 16px; }
        .template-card .actions { display: flex; gap: 12px; }
        .new-template-card { border: 2px dashed var(--border); background-color: transparent; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px; }

        /* Export Page */
        .export-section { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .export-section .title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
        .export-section .subtitle { font-size: 13px; color: var(--tx2); margin-bottom: 20px; }
        .export-options { display: flex; gap: 40px; }
        .export-column { display: flex; flex-direction: column; gap: 12px; }
        .export-history-item { display: flex; align-items: center; justify-content: space-between; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 12px; }

        /* Settings Page */
        .settings-layout { display: flex; flex: 1; }
        .settings-nav { width: 200px; padding: 24px; border-right: 1px solid var(--border); }
        .settings-nav .nav-item { padding: 10px 12px; }
        .settings-content { flex: 1; padding: 32px; }
        .settings-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
        .form-group { margin-bottom: 20px; }
        .form-label { font-size: 13px; font-weight: 500; color: var(--tx2); margin-bottom: 8px; display: block; }
        .form-input { width: 100%; padding: 10px 14px; background: var(--surface-light); border: 1px solid var(--border); border-radius: 8px; color: var(--tx); }
        .profile-photo { display: flex; align-items: center; gap: 16px; }
        .avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--surface-light); color: var(--tx); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 600; }
        .danger-zone { border-left: 3px solid var(--red); }
        .danger-zone.active { border-color: var(--red); color: var(--red) !important; }

        .search-bar { display:flex; gap:12px; margin-bottom:24px; background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:16px 20px; align-items:center; }
        .search-input { flex:1; border:none; outline:none; font-size:14px; background:transparent; color:var(--tx); }

        /* Results Section Styling */
        .results-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
        .results-title{font-size:16px;font-weight:600;}
        .results-sub{font-size:12px;color:var(--tx2);}
        .summary-bar{background:var(--green-bg);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:16px;margin-bottom:24px; animation: fadeIn 0.4s ease;}
        .result-lead-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 18px;margin-bottom:10px;display:flex;align-items:center;gap:14px;transition:all 0.2s; animation: fadeIn 0.3s ease;}
        .result-lead-card:hover { border-color: var(--border-hover); background: var(--surface-light); }
        .score-pill{flex-shrink:0;padding:3px 10px;border-radius:100px;font-size:10px;font-weight:700; letter-spacing:0.05em;}
        .verified-tag{display:flex;align-items:center;gap:4px;font-size:11px;color:var(--green);flex-shrink:0;}

        /* Pricing Styles */
        .pricing-wrap{max-width:1200px;margin:0 auto;padding:0;}
        .pricing-head{text-align:center;margin-bottom:40px;}
        .pricing-eyebrow{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--tx3);margin-bottom:12px;}
        .pricing-headline{font-size:36px;font-weight:600;line-height:1.2;margin-bottom:16px;color:var(--tx);}
        .pricing-headline em{font-style:italic;color:var(--tx2);}
        .pricing-head > p{font-size:14px;color:var(--tx3);}
        
        .pricing-toggle-wrap{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:40px;}
        .pill-toggle{width:50px;height:28px;background:var(--surface-light);border:1px solid var(--border);border-radius:20px;position:relative;cursor:pointer;transition:all .3s;display:flex;align-items:center;padding:0 3px;}
        .pill-toggle.an{background:var(--accent-glow);border-color:var(--accent);}
        .pill-toggle-thumb{width:22px;height:22px;background:var(--tx);border-radius:50%;position:absolute;left:3px;transition:left .3s;}
        .pill-toggle.an .pill-toggle-thumb{left:25px;background:var(--accent);}
        .save-badge{font-size:12px;font-weight:600;color:var(--green);}
        
        .pricing-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:40px;}
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
        .pricing-card li{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--tx2);}
        .pricing-card li svg{width:16px;height:16px;flex-shrink:0;}
        .pricing-card li.off{color:var(--tx3);opacity:0.6;}
        .pricing-card li.off svg{stroke:var(--tx3);}
        
        .btn-outline{background:transparent;border:1px solid var(--border);color:var(--tx);transition:all .2s;}
        .btn-outline:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-glow);}
        .pricing-wrap .text-center{text-align:center;}

        /* My Leads Styles */
        .leads-header{margin-bottom:32px;}
        .leads-title{font-size:28px;font-weight:700;line-height:1.2;margin-bottom:8px;color:var(--tx);}
        .leads-subtitle{font-size:14px;color:var(--tx2);}
        
        .leads-info-bar{background:rgba(108,99,255,0.08);border:1px solid rgba(108,99,255,0.2);border-radius:12px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;}
        .leads-info-text{font-size:13px;color:var(--tx);}
        .leads-info-sub{font-size:12px;color:var(--tx2);margin-top:4px;}
        .leads-info-actions{display:flex;gap:12px;}
        
        .leads-filter{display:flex;gap:8px;margin-bottom:24px;}
        .filter-tab{padding:8px 16px;background:transparent;border:1px solid var(--border);border-radius:100px;font-size:13px;color:var(--tx2);cursor:pointer;transition:all .2s;font-weight:500;}
        .filter-tab:hover{border-color:var(--accent);color:var(--tx);}
        .filter-tab.active{background:var(--accent-glow);border-color:var(--accent);color:var(--accent);}
        
        .leads-search-wrap{display:flex;gap:12px;margin-bottom:24px;align-items:center;}
        .leads-search-input{flex:1;padding:12px 16px;background:var(--surface-light);border:1px solid var(--border);border-radius:10px;color:var(--tx);font-size:14px;outline:none;transition:border-color .2s;}
        .leads-search-input:focus{border-color:var(--accent);}
        .leads-count{font-size:13px;color:var(--tx2);white-space:nowrap;}
        
        .leads-hint{font-size:13px;color:var(--tx2);font-style:italic;margin-bottom:24px;padding:12px;background:rgba(255,255,255,0.02);border-radius:8px;border-left:2px solid var(--accent);}
        
        .lead-item{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:12px;transition:all .2s;}
        .lead-item:hover{border-color:var(--accent);background:var(--surface-light);}
        .lead-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;}
        .lead-name{font-size:16px;font-weight:700;color:var(--tx);}
        .lead-badge{background:var(--accent-glow);border:1px solid var(--accent);color:var(--accent);font-size:10px;font-weight:700;padding:4px 10px;border-radius:4px;}
        .lead-location{font-size:13px;color:var(--tx2);margin-bottom:12px;}
        .lead-actions{display:flex;gap:8px;}
        .lead-action-btn{width:36px;height:36px;background:var(--surface-light);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;color:var(--tx2);}
        .lead-action-btn:hover{background:var(--accent-glow);border-color:var(--accent);color:var(--accent);}

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
            <NavItem id="dashboard" label="Dashboard" icon={<DashboardIcon />} activePage={activePage} onClick={setActivePage} />
            <NavItem id="find-leads" label="Find Leads" icon={<SearchIcon />} activePage={activePage} onClick={setActivePage} />
            <NavItem id="my-leads" label="My Leads" icon={<UsersIcon />} activePage={activePage} onClick={setActivePage} badge="47" />
            <NavItem id="pipeline" label="Pipeline" icon={<PipelineIcon />} activePage={activePage} onClick={setActivePage} badge="12" />
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
        {/* --- 0. DASHBOARD --- */}
        <div className={`page ${activePage === 'dashboard' ? 'active' : ''}`}>
          <div className="topbar"><div className="page-title">Dashboard</div></div>
          <div className="body">
            <div className="db-checkpoint-card">
              <div className="title">Progress Checkpoint</div>
              <div className="free-plan-leads-limit">You are on the free plan. You can find up to 300 leads per month.</div>
              <div className="leads-count">275</div>
              <div className="usage-details">lead credits remaining</div>
              <div className="actions">
                <button className="btn btn-primary" onClick={() => setActivePage('plan')}>Upgrade Plan</button>
                <button className="btn btn-outline" onClick={() => setActivePage('find-leads')}>Find Leads</button>
              </div>
            </div>

            <div className="db-usage-bar">
              <div className="title">Monthly Lead Credits</div>
              <div className="bar"><div className="progress" style={{width: `${(25/300)*100}%`}}></div></div>
              <div className="limit-text">25 of 300 leads used</div>
            </div>

            <div className="db-date-range">
              <select>
                <option>All Time</option>
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
              </select>
            </div>

            <div className="db-stats-grid">
              <div className="db-stat-card">
                <div className="title">Leads Found</div>
                <div className="value">47</div>
              </div>
              <div className="db-stat-card">
                <div className="title">In Pipeline</div>
                <div className="value">12</div>
              </div>
              <div className="db-stat-card">
                <div className="title">Follow-ups Due</div>
                <div className="value">3</div>
              </div>
            </div>

            <div className="db-footer">
              Need help? <a href="#" onClick={() => setActivePage('support')}>Contact our support team</a>
            </div>
          </div>
        </div>

        {/* --- 1. FIND LEADS --- */}
        <div className={`page ${activePage === 'find-leads' ? 'active' : ''}`}>
          <div className="topbar">
            <div className="page-title">Find Leads</div>
            <div className="topbar-right">
              <span style={{fontSize:'12px', color:'var(--tx3)', marginRight: '28px'}}>275 of 300 lead credits remaining</span>
              <button className="btn btn-primary ml-4" onClick={() => setActivePage('plan')}>Upgrade Plan</button>
            </div>
          </div>
          
          <div className="body">
            {!isSearching && !showFinalResults && (
              <div className="wizard">
                <div className="step-header">
                  <span className="step-tag">Step {findStep} of 3</span>
                  <div className="step-dots">
                    <div className={`step-dot ${findStep === 1 ? 'active' : 'done'}`}></div>
                    <div className={`step-dot ${findStep === 2 ? 'active' : findStep > 2 ? 'done' : ''}`}></div>
                    <div className={`step-dot ${findStep === 3 ? 'active' : ''}`}></div>
                  </div>
                </div>

                {findStep === 1 && (
                  <div className="step-pane active">
                    <div className="step-q">Who are you looking for? (e.g. Restaurant Owners)</div>
                    <div className="field-label">Popular industries</div>
                    <div className="chips">
                      {['Restaurants', 'Dental clinics', 'Marketing agencies', 'Real estate', 'Gyms & fitness', 'Law firms', 'E-commerce', 'Medical clinics', 'Construction', 'Beauty salons'].map(cat => (
                        <div key={cat} className={`chip ${selectedIndustry === cat ? 'selected' : ''}`} onClick={() => setSelectedIndustry(cat)}>{cat}</div>
                      ))}
                    </div>
                    <div className="field">
                      <div className="field-label">Or type your own</div>
                      <input className="field-input" placeholder="e.g. coffee shop owners, dental managers…" value={searchKw} onChange={(e) => setSearchKw(e.target.value)} />
                    </div>
                    <div className="btn-row">
                      <div style={{flex: 1}}></div>
                      <button className="btn-next" onClick={() => setFindStep(2)} disabled={!selectedIndustry && !searchKw}>Next →</button>
                    </div>
                  </div>
                )}

                {findStep === 2 && (
                  <div className="step-pane active">
                    <div className="step-q">Where should we look?</div>
                    <div className="field" style={{ marginBottom: '16px' }}>
                      <input 
                        className="field-input" 
                        placeholder="Search for a country..." 
                        value={countrySearch} 
                        onChange={(e) => setCountrySearch(e.target.value)} 
                      />
                    </div>
                    <div className="loc-grid" style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '8px' }}>
                      {ALL_COUNTRIES.filter(c => c.n.toLowerCase().includes(countrySearch.toLowerCase())).map(loc => (
                        <div key={loc.n} className={`loc-card ${selectedLoc === loc.n ? 'selected' : ''}`} onClick={() => setSelectedLoc(loc.n)}>
                          <div className="loc-flag">{loc.f}</div>
                          <div><div className="loc-name">{loc.n}</div><div className="loc-sub">{loc.s}</div></div>
                          <div className="loc-check"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5 5 4 7.5 8.5 2.5"/></svg></div>
                        </div>
                      ))}
                    </div>
                    {ALL_COUNTRIES.filter(c => c.n.toLowerCase().includes(countrySearch.toLowerCase())).length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: 'var(--tx3)' }}>No countries found</div>}
                    
                    <div className="btn-row">
                      <button className="btn-back-step" onClick={() => setFindStep(1)}>← Back</button>
                      <button className="btn-next" onClick={() => setFindStep(3)} disabled={!selectedLoc}>Next →</button>
                    </div>
                  </div>
                )}

                {findStep === 3 && (
                  <div className="step-pane active">
                    <div className="step-q">How many leads do you need?</div>
                    <div className="vol-grid">
                      {[25, 100, 300].map(v => (
                        <div key={v} className={`vol-card ${selectedVol === v ? 'selected' : ''}`} onClick={() => setSelectedVol(v)}>
                          <div className="vol-num">{v}</div>
                          <div className="vol-lbl">
                            {v === 25 && 'Free · try it out'}
                            {v === 100 && 'Starter · most popular'}
                            {v === 300 && 'Pro · power users'}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="field" style={{ marginTop: '16px' }}>
                      <div className="field-label">Contact quality filter</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        <div 
                          className={`chip ${filters.verified ? 'selected' : ''}`} 
                          style={{ borderRadius: '8px', padding: '8px 14px' }} 
                          onClick={() => setFilters(f => ({ ...f, verified: !f.verified }))}
                        >
                          {filters.verified && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                              <polyline points="1 6 4.5 9.5 11 3" />
                            </svg>
                          )}
                          Verified email only
                        </div>
                        <div 
                          className={`chip ${filters.website ? 'selected' : ''}`} 
                          style={{ borderRadius: '8px', padding: '8px 14px' }} 
                          onClick={() => setFilters(f => ({ ...f, website: !f.website }))}
                        >
                          {filters.website && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                              <polyline points="1 6 4.5 9.5 11 3" />
                            </svg>
                          )}
                          Website required
                        </div>
                        <div 
                          className={`chip ${filters.highScore ? 'selected' : ''}`} 
                          style={{ borderRadius: '8px', padding: '8px 14px' }} 
                          onClick={() => setFilters(f => ({ ...f, highScore: !f.highScore }))}
                        >
                          High score only
                        </div>
                      </div>
                    </div>
                    <div className="btn-row">
                      <button className="btn-back-step" onClick={() => setFindStep(2)}>← Back</button>
                      <button className="btn-next" onClick={startSearchFlow}>Find leads now →</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isSearching && (
              <>
                <div className="processing">
                  <div className="proc-header">      case 'find-leads':
        return (
          <div className="content-wrapper">
            <div className="page-header">
              <h1>Find your first leads</h1>
              <p>Start with 25 free leads. No setup needed.</p>
            </div>

            <div className="wizard">
              {/* --- STEP 1: KEYWORD --- */}
              {findStep === 1 && (
                <>
                  <div className="step-indicator">Step 1 of 3</div>
                  <h2>What are you looking for?</h2>
                  <div className="form-field">
                    <label htmlFor="business-type">Type of business</label>
                    <input 
                      type="text" 
                      id="business-type" 
                      className="field-input" 
                      placeholder="e.g. restaurants, gyms" 
                      value={searchKw}
                      onChange={(e) => setSearchKw(e.target.value)}
                      disabled={isSearching}
                    />
                  </div>
                  <button className="btn-primary full-width" onClick={() => setFindStep(2)} disabled={!searchKw || isSearching}>Next</button>
                </>
              )}

              {/* --- STEP 2: LOCATION --- */}
              {findStep === 2 && (
                <>
                  <div className="step-indicator">Step 2 of 3</div>
                  <h2>Where are you looking?</h2>
                  <div className="form-field">
                    <label htmlFor="location">Location</label>
                    <input 
                      type="text" 
                      id="location" 
                      className="field-input" 
                      placeholder="e.g. Miami, FL or London"
                      value={selectedLoc}
                      onChange={(e) => setSelectedLoc(e.target.value)}
                      disabled={isSearching}
                    />
                  </div>
                  <div className="button-group">
                    <button className="btn-secondary" onClick={() => setFindStep(1)} disabled={isSearching}>Back</button>
                    <button className="btn-primary" onClick={() => setFindStep(3)} disabled={!selectedLoc || isSearching}>Next</button>
                  </div>
                </>
              )}

              {/* --- STEP 3: VOLUME & LAUNCH --- */}
              {findStep === 3 && (
                <>
                  <div className="step-indicator">Step 3 of 3</div>
                  <h2>How many leads?</h2>
                  <div className="form-field">
                    <label htmlFor="volume">Volume: {selectedVol} leads</label>
                    <input 
                      type="range" 
                      id="volume" 
                      className="volume-slider" 
                      min="50" 
                      max="1000" 
                      step="50"
                      value={selectedVol}
                      onChange={(e) => setSelectedVol(parseInt(e.target.value))}
                      disabled={isSearching}
                    />
                  </div>
                  <div className="button-group">
                    <button className="btn-secondary" onClick={() => setFindStep(2)} disabled={isSearching}>Back</button>
                    <button className="btn-primary" onClick={startSearchFlow} disabled={isSearching}>
                      {isSearching ? 'Searching...' : 'Start Search'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {isSearching && (
              <div className="real-time-search">
                <div className="proc-header">
                  <div className="proc-title">REAL-TIME SEARCH</div>
                  <div className="proc-timer">{String(Math.floor(timer/60)).padStart(2,'0')}:{String(timer%60).padStart(2,'0')}</div>
                </div>
                <h3>Processing Your Leads</h3>
                <div className="proc-body">
                  <div className={`proc-item ${searchProgress.a === 100 ? 'complete' : 'active'}`}>
                    <div className="proc-item-label">
                      {searchProgress.a === 100 ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg> : <svg className="spinner" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.75V6.25m0 11.5v1.5m-6.364-2.136l1.06-1.06m10.607-10.607l1.06-1.06M4.75 12H6.25m11.5 0h1.5m-2.136 6.364l1.06 1.06m-10.607-10.607l1.06 1.06" /></svg>}
                      Scanning sources
                    </div>
                    <div className="proc-item-value">{searchProgress.a}%</div>
                  </div>
                  <div className={`proc-item ${searchProgress.b === 100 ? 'complete' : (searchProgress.a === 100 ? 'active' : '')}`}>
                    <div className="proc-item-label">
                      {searchProgress.b === 100 ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg> : (searchProgress.a === 100 ? <svg className="spinner" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.75V6.25m0 11.5v1.5m-6.364-2.136l1.06-1.06m10.607-10.607l1.06-1.06M4.75 12H6.25m11.5 0h1.5m-2.136 6.364l1.06 1.06m-10.607-10.607l1.06 1.06" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="placeholder-icon"><circle cx="10" cy="10" r="3" /></svg>)}
                      Enriching contacts
                    </div>
                    <div className="proc-item-value">{searchProgress.b}%</div>
                  </div>
                  <div className={`proc-item ${searchProgress.c === 100 ? 'complete' : (searchProgress.b === 100 ? 'active' : '')}`}>
                    <div className="proc-item-label">
                      {searchProgress.c === 100 ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg> : (searchProgress.b === 100 ? <svg className="spinner" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.75V6.25m0 11.5v1.5m-6.364-2.136l1.06-1.06m10.607-10.607l1.06-1.06M4.75 12H6.25m11.5 0h1.5m-2.136 6.364l1.06 1.06m-10.607-10.607l1.06 1.06" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="placeholder-icon"><circle cx="10" cy="10" r="3" /></svg>)}
                      Verifying & scoring
                    </div>
                    <div className="proc-item-value">{searchProgress.c}%</div>
                  </div>
                </div>
                <hr className="divider" />
                <div className="activity-feed">
                  <div className="proc-header">
                    <div className="proc-title">ACTIVITY FEED</div>
                    <div className="proc-status-live">LIVE</div>
                  </div>
                  <div className="feed-body">
                    {searchLogs.length === 0 && <div className="feed-item"><span>▶ Waiting for activity...</span><span></span></div>}
                    {searchLogs.map((log, i) => (
                      <div className="feed-item" key={i}><span>▶ {log.msg}</span><span>{log.time}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <style jsx>{`
              .content-wrapper { padding: 40px; color: #fff; max-width: 900px; margin: 0 auto; }
              .page-header { text-align: center; margin-bottom: 32px; }
              .page-header h1 { font-size: 36px; font-weight: bold; margin-bottom: 8px; }
              .page-header p { color: var(--tx3); font-size: 16px; }
              .wizard { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px; margin-bottom: 20px; }
              .step-indicator { font-size: 14px; color: var(--tx3); margin-bottom: 8px; }
              .wizard h2 { font-size: 24px; font-weight: bold; margin-bottom: 16px; }
              .form-field { margin-bottom: 16px; }
              .form-field label { display: block; font-size: 14px; color: var(--tx2); margin-bottom: 4px; }
              .field-input { width: 100%; background: #00000033; border: 1px solid var(--border); border-radius: 8px; padding: 12px; color: #fff; }
              .field-input::placeholder { color: var(--tx3); }
              .field-input:disabled { opacity: 0.6; cursor: not-allowed; }
              .btn-primary.full-width { width: 100%; margin-top: 24px; padding: 12px; font-size: 16px; font-weight: bold; }
              .btn-primary:disabled, .btn-secondary:disabled { background: var(--surface-light); color: var(--tx3); cursor: not-allowed; border-color: var(--border); }
              .button-group { display: flex; gap: 12px; margin-top: 24px; }
              .button-group .btn-primary, .button-group .btn-secondary { flex-grow: 1; padding: 12px; font-size: 16px; font-weight: bold; }
              .volume-slider { width: 100%; -webkit-appearance: none; appearance: none; height: 8px; background: var(--surface-light); border-radius: 4px; outline: none; }
              .volume-slider:disabled { opacity: 0.6; }
              .volume-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; background: var(--accent); border-radius: 50%; cursor: pointer; }
              .volume-slider::-moz-range-thumb { width: 20px; height: 20px; background: var(--accent); border-radius: 50%; cursor: pointer; }
              .real-time-search { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-top: 20px; }
              .proc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
              .proc-title { font-size: 12px; font-weight: 600; color: var(--tx3); letter-spacing: 0.08em; text-transform: uppercase; }
              .proc-timer, .proc-status-live { font-family: monospace; font-size: 14px; color: var(--tx2); }
              .proc-status-live { color: #22c55e; font-weight: bold; }
              .real-time-search h3 { font-size: 18px; font-weight: bold; margin-bottom: 24px; }
              .proc-body { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
              .proc-item { display: flex; justify-content: space-between; align-items: center; color: var(--tx3); }
              .proc-item-label { display: flex; align-items: center; gap: 12px; }
              .proc-item-value { font-weight: 500; color: var(--tx2); }
              .proc-item.complete { color: #22c55e; }
              .proc-item.complete .proc-item-value { color: #22c55e; }
              .proc-item.active { color: #3b82f6; }
              .proc-item.active .proc-item-value { color: #3b82f6; }
              .proc-item svg { width: 20px; height: 20px; }
              .placeholder-icon { color: var(--tx3); }
              .spinner { animation: spin 1s linear infinite; }
              @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              .divider { border-color: var(--border); margin: 0; }
              .activity-feed { margin-top: 24px; }
              .feed-body { font-family: monospace; font-size: 13px; color: var(--tx3); display: flex; flex-direction: column; gap: 8px; }
              .feed-item { display: flex; justify-content: space-between; }
            `}</style>
          </div>
        );

                    <span className="proc-label">Real-time Search</span>
                    <span className="proc-timer">{String(Math.floor(timer/60)).padStart(2,'0')}:{String(timer%60).padStart(2,'0')}</span>
                  </div>
                  <div className="proc-title">
                    Processing Your Leads
                  </div>
                  <div className="proc-item">
                    <div className="proc-row">
                      <div className="proc-name">
                        <div className={`proc-dot ${searchProgress.a > 0 ? 'running' : ''} ${searchProgress.a === 100 ? 'done' : ''}`}></div>
                        Scanning sources
                      </div>
                      <div className="proc-perc">{searchProgress.a}%</div>
                    </div>
                  </div>
                  <div className="proc-item">
                    <div className="proc-row">
                      <div className="proc-name">
                        <div className={`proc-dot ${searchProgress.b > 0 ? 'running' : ''} ${searchProgress.b === 100 ? 'done' : ''}`}></div>
                        Enriching contacts
                      </div>
                      <div className="proc-perc">{searchProgress.b}%</div>
                    </div>
                  </div>
                  <div className="proc-item" style={{marginBottom:0}}>
                    <div className="proc-row">
                      <div className="proc-name">
                        <div className={`proc-dot ${searchProgress.c > 0 ? 'running' : ''} ${searchProgress.c === 100 ? 'done' : ''}`}></div>
                        Verifying & scoring
                      </div>
                      <div className="proc-perc">{searchProgress.c}%</div>
                    </div>
                  </div>
                </div>

                {/* ── ACTIVITY FEED ── */}
                <div className="activity">
                  <div className="act-header">
                    <span className="act-label">Activity feed</span>
                    <span className="act-status" style={{color:'var(--green)'}}>Live</span>
                  </div>
                  <div className="act-log" id="act-log">
                    {searchLogs.length > 0 ? (
                      searchLogs.map((log, i) => (
                        <div key={i} className="act-line">
                          <span className="act-arrow">›</span><span>{log.msg}</span><span className="act-time">{log.time}</span>
                        </div>
                      ))
                    ) : (
                      <div className="act-empty" id="act-empty">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color:'#4A4E62'}}>
                          <circle cx="7" cy="7" r="6"/>
                          <line x1="7" y1="4" x2="7" y2="7"/>
                          <circle cx="7" cy="9.5" r=".5" fill="currentColor" stroke="none"/>
                        </svg>
                        No activity yet
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {showFinalResults && (
              <div className="results-section">
                <div className="summary-bar">
                  <div className="sum-icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 9 7 13 15 5"/></svg></div>
                  <div className="sum-text">
                    <div className="sum-title">{selectedVol} verified contacts ready</div>
                    <div className="sum-sub">Filtered for {searchKw || selectedIndustry} in {selectedLoc}</div>
                  </div>
                  <button className="btn btn-primary btn-sm" style={{flexShrink: 0}} onClick={() => { setShowFinalResults(false); setFindStep(1); }}>New search</button>
                </div>

                <div className="results-header" style={{ marginTop: '24px' }}>
                  <div>
                    <div className="results-title">Decision Makers for "{searchKw || selectedIndustry}"</div>
                    <div className="results-sub">{selectedLoc} · {selectedVol} leads · all verified</div>
                  </div>
                  <button className="btn btn-outline btn-sm">Export CSV →</button>
                </div>

                {LEADS_DATA.slice(0, 5).map((l, i) => (
                  <div key={i} className="result-lead-card">
                    <span className={`score-pill ${l.score === 'high' ? 's-high' : 's-med'}`}>{l.score.toUpperCase()}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize: '14px', fontWeight: 600}}>{l.name} Owner</div>
                      <div style={{fontSize: '12px', color: 'var(--tx2)'}}>{l.cat} Decision Maker</div>
                      <div className="text-xs text-gray-400 mt-1">{l.email} · <a href="#" className="text-indigo-400">{l.site}</a></div>
                    </div>
                    <div className="verified-tag">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5 6 4.5 9 10.5 3"/></svg>
                      Verified
                    </div>
                    <div className="text-[11px] text-gray-500">{l.loc}</div>
                    <div className="flex gap-2 ml-4">
                      <button className="btn btn-outline btn-sm">Save</button>
                      <button className="btn btn-primary btn-sm">Outreach</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- 2. MY LEADS --- */}
        <div className={`page ${activePage === 'my-leads' ? 'active' : ''}`}>
          <div className="topbar">
            <div className="page-title">My Leads</div>
            <div className="actions">
              <button className="btn btn-outline">Export Leads</button>
            </div>
          </div>
          <div className="body">
            <div className="filter-tabs">
              <div className={`tab ${myLeadsFilter === 'all' ? 'active' : ''}`} onClick={() => setMyLeadsFilter('all')}>All</div>
              <div className={`tab ${myLeadsFilter === 'enriched' ? 'active' : ''}`} onClick={() => setMyLeadsFilter('enriched')}>Fully Enriched</div>
              <div className={`tab ${myLeadsFilter === 'email' ? 'active' : ''}`} onClick={() => setMyLeadsFilter('email')}>Email</div>
              <div className={`tab ${myLeadsFilter === 'phone' ? 'active' : ''}`} onClick={() => setMyLeadsFilter('phone')}>Phone</div>
            </div>
            <div className="lead-list">
              {filteredLeads.map((lead, index) => (
                <div key={index} className="lead-card">
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600, color:'var(--tx)', marginBottom: '4px'}}>{lead.name}</div>
                    <div style={{color:'var(--tx2)', fontSize:'12px'}}>{lead.cat} &middot; {lead.loc}</div>
                  </div>
                  <div style={{flex:1, fontSize:'13px', color:'var(--tx2)'}}>
                    {lead.email && <div>{lead.email}</div>}
                    {lead.phone && <div>{lead.phone}</div>}
                  </div>
                  <div style={{flex:'0 0 100px', textAlign:'right'}}>
                    <a href={`http://${lead.site}`} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{padding:'6px 12px', fontSize:'12px'}}>
                      Website
                    </a>
                  </div>
                </div>
              ))}
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



        {/* --- 5. COMPOSE --- */}
        <div className={`page ${activePage === 'compose' ? 'active' : ''}`}>
          <div className="topbar">
            <div className="page-title">Compose Email</div>
            <div className="actions" style={{display:'flex', gap:'12px'}}>
              <button className="btn-outline">Save Draft</button>
              <button className="btn-primary">Send Email</button>
            </div>
          </div>
          <div className="compose-layout">
            <div className="compose-main">
              <div className="email-editor">
                <div className="editor-field">
                  <div className="editor-label">To</div>
                  <input type="text" className="editor-input" defaultValue="growth@palmatlasmedia.ae" />
                </div>
                <div className="editor-field">
                  <div className="editor-label">Business Name</div>
                  <input type="text" className="editor-input" defaultValue="Palm Atlas Media" />
                </div>
                <div className="editor-field">
                  <div className="editor-label">Subject</div>
                  <input type="text" className="editor-input" defaultValue="Quick question about your lead generation — Palm Atlas" />
                </div>
                <div className="editor-body">
                  <textarea className="editor-textarea" defaultValue={"Hi there,\n\nI came across Palm Atlas Media while researching top marketing agencies in Dubai — impressive work on the Vanta campaign.\n\nI help agencies like yours add 20-30 qualified leads per month using a verified prospecting system. Takes about 10 minutes to set up and no extra tools required.\n\nWould it make sense to jump on a quick 15-minute call this week?\n\nBest"}></textarea>
                </div>
                <div className="editor-actions">
                  <div>
                    <button className="btn-outline" style={{marginRight:'12px'}}>Use Template</button>
                    <button className="btn-outline">Add Follow-up</button>
                  </div>
                  <button className="btn-primary">Send Email →</button>
                </div>
              </div>
            </div>
            <div className="compose-sidebar">
              <div className="sidebar-card">
                <div className="sidebar-title">Lead Details</div>
                <div style={{fontWeight:600, color:'var(--tx)'}}>Palm Atlas Media</div>
                <div style={{fontSize:'12px', color:'var(--tx2)', margin:'4px 0'}}>Marketing agency · Dubai, UAE</div>
                <div style={{fontSize:'12px', color:'var(--tx2)'}}>growth@palmatlasmedia.ae</div>
                <a href="#" style={{fontSize:'12px', color:'var(--accent)', textDecoration:'none', marginTop:'4px', display:'inline-block'}}>palmatlasmedia.ae</a>
              </div>
              <div className="sidebar-card">
                <div className="sidebar-title">Personalization Tips</div>
                <ul style={{fontSize:'13px', color:'var(--tx2)', paddingLeft:'20px', display:'flex', flexDirection:'column', gap:'8px'}}>
                  <li>Mention their industry or niche specifically</li>
                  <li>Keep subject line under 9 words</li>
                  <li>End with one clear question</li>
                  <li>Follow up in 3-5 days if no reply</li>
                </ul>
              </div>
              <div className="sidebar-card">
                <div className="sidebar-title">Schedule Send</div>
                <select className="sidebar-select">
                  <option>Send Immediately</option>
                  <option>Schedule for later</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* --- 6. TEMPLATES --- */}
        <div className={`page ${activePage === 'templates' ? 'active' : ''}`}>
          <div className="topbar">
            <div className="page-title">Email Templates</div>
            <div className="actions">
              <button className="btn-primary">+ New Template</button>
            </div>
          </div>
          <div className="body">
            <div className="templates-grid">
              {TEMPLATES_DATA.map((template, index) => (
                <div key={index} className="template-card">
                  <div className="category">{template.category}</div>
                  <div className="title">{template.title}</div>
                  <div className="description">{template.description}</div>
                  <div className="stats">{template.stats}</div>
                  <div className="actions">
                    <button className="btn-outline">Edit</button>
                    <button className="btn-primary">Use Template</button>
                  </div>
                </div>
              ))}
              <div className="new-template-card">
                <div style={{fontSize:'24px', marginBottom:'12px'}}>+</div>
                <div className="title" style={{marginBottom:'4px'}}>Create Custom Template</div>
                <div className="description" style={{flex:'none'}}>Write your own and track its performance</div>
                <button className="btn-outline" style={{marginTop:'16px'}}>New Template</button>
              </div>
            </div>
          </div>
        </div>

        {/* --- 7. EXPORTS --- */}
        <div className={`page ${activePage === 'exports' ? 'active' : ''}`}>
          <div className="topbar">
            <div className="page-title">Export / CSV</div>
            <div style={{fontSize:'13px', color:'var(--tx2)'}}>47 leads available to export</div>
          </div>
          <div className="body">
            <div className="export-section">
              <div className="title">Export Your Leads</div>
              <div className="subtitle">Choose which leads to export and what fields to include. Downloads as a .CSV file.</div>
              <div className="export-options">
                <div className="export-column">
                  <label style={{fontSize:'13px', fontWeight:500}}>WHICH LEADS</label>
                  <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    <label><input type="radio" name="which_leads" defaultChecked /> All 47 saved leads</label>
                    <label><input type="radio" name="which_leads" /> HIGH score only (28 leads)</label>
                    <label><input type="radio" name="which_leads" /> Not yet contacted (31 leads)</label>
                    <label><input type="radio" name="which_leads" /> Custom selection</label>
                  </div>
                </div>
                <div className="export-column">
                  <label style={{fontSize:'13px', fontWeight:500}}>INCLUDE FIELDS</label>
                  <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    <label><input type="checkbox" defaultChecked /> Business name</label>
                    <label><input type="checkbox" defaultChecked /> Email address</label>
                    <label><input type="checkbox" defaultChecked /> Website</label>
                    <label><input type="checkbox" /> Location</label>
                    <label><input type="checkbox" /> Industry / category</label>
                    <label><input type="checkbox" /> Lead score</label>
                  </div>
                </div>
              </div>
              <button className="btn-primary" style={{marginTop:'24px'}}>Download CSV →</button>
            </div>
            <div className="export-section" style={{background:'transparent', border:'none', padding:0}}>
              <div className="title">Export History</div>
              <div>
                {EXPORT_HISTORY.map((item, index) => (
                  <div key={index} className="export-history-item">
                    <div>
                      <div style={{fontWeight:600}}>{item.name}</div>
                      <div style={{fontSize:'12px', color:'var(--tx2)'}}>{item.details} · {item.date}</div>
                    </div>
                    <button className="btn-outline">Re-download</button>
                  </div>
                ))}
              </div>
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
                <h1 className="pricing-headline">Find leads. Close clients.<br /><em>Pay only for what you use.</em></h1>
                <p style={{fontSize:'14px', color:'var(--tx3)', marginTop:'16px'}}>No hidden fees. Cancel anytime. Start free today.</p>
              </div>

              <div className="pricing-toggle-wrap">
                <span style={{fontSize:'14px', fontWeight:!isAnnual ? 700 : 400, color:!isAnnual ? 'var(--tx)' : 'var(--tx3)'}}>Monthly</span>
                <div className={`pill-toggle ${isAnnual ? 'an' : ''}`} onClick={() => setIsAnnual(!isAnnual)}>
                  <div className="pill-toggle-thumb"></div>
                </div>
                <span style={{fontSize:'14px', fontWeight:isAnnual ? 700 : 400, color:isAnnual ? 'var(--tx)' : 'var(--tx3)'}}>Annual</span>
                <span className="save-badge" style={{opacity: isAnnual ? 1 : 0.4}}>Save 25%</span>
              </div>

              <div className="pricing-cards">
                {/* FREE */}
                <div className="pricing-card">
                  <div className="text-xs" style={{marginBottom:'16px'}}>Free</div>
                  <p className="text-sm" style={{marginBottom:'24px'}}>See how quickly LeadPulse surfaces leads before you commit.</p>
                  <div style={{display:'flex', alignItems:'baseline', gap:'4px', marginBottom:'32px'}}>
                    <span style={{fontSize:'18px', color:'var(--tx3)', fontFamily:"'Instrument Serif',serif"}}>$</span>
                    <span className="price-num">0</span>
                    <span className="text-sm" style={{color:'var(--tx3)'}}>/ one-time</span>
                  </div>
                  <div style={{height:'1px', background:'rgba(255,255,255,0.06)', marginBottom:'24px'}}></div>
                  <ul style={{flex:1, display:'flex', flexDirection:'column', gap:'12px', marginBottom:'24px'}}>
                    <PricingFeat text="25 verified leads" />
                    <PricingFeat text="CSV export" />
                    <PricingFeat text="Fast business discovery" />
                    <PricingFeat text="Outreach tools" off />
                    <PricingFeat text="Pipeline & follow-ups" off />
                    <PricingFeat text="Email templates" off />
                  </ul>
                  <button className="btn btn-outline" style={{width:'100%', padding:'10px'}}>Start for free</button>
                </div>

                {/* STARTER */}
                <div className="pricing-card featured">
                  <span className="featured-badge">Most popular</span>
                  <div className="text-xs" style={{marginBottom:'16px', color:'var(--accent)'}}>Starter</div>
                  <p className="text-sm" style={{marginBottom:'24px'}}>Move from finding people to starting real conversations.</p>
                  <div style={{display:'flex', alignItems:'baseline', gap:'4px', marginBottom:'8px'}}>
                    <span style={{fontSize:'18px', color:'var(--tx3)', fontFamily:"'Instrument Serif',serif"}}>$</span>
                    <span className="price-num">{isAnnual ? pricing.starter.an : pricing.starter.mo}</span>
                    <span className="text-sm" style={{color:'var(--tx3)', marginLeft:'4px'}}>/ month</span>
                  </div>
                  <div style={{fontSize:'10px', color:'var(--tx3)', marginBottom:'24px', minHeight:'15px'}}>
                    {isAnnual && `$${pricing.starter.an * 12} billed annually — save $${(pricing.starter.mo - pricing.starter.an) * 12}`}
                  </div>
                  <div style={{height:'1px', background:'rgba(255,255,255,0.06)', marginBottom:'24px'}}></div>
                  <ul style={{flex:1, display:'flex', flexDirection:'column', gap:'12px', marginBottom:'24px'}}>
                    <PricingFeat text="300 verified leads / month" active />
                    <PricingFeat text="CSV export" active />
                    <PricingFeat text="Email outreach tools" active />
                    <PricingFeat text="1 email template" active />
                    <PricingFeat text="Pipeline & follow-ups" active />
                    <PricingFeat text="Multi-campaign outreach" off />
                  </ul>
                  <button className="btn btn-primary" style={{width:'100%', padding:'10px', background:'var(--accent)'}}>Get started →</button>
                </div>

                {/* ENGINE */}
                <div className="pricing-card">
                  <div className="text-xs" style={{marginBottom:'16px'}}>Outbound Engine</div>
                  <p className="text-sm" style={{marginBottom:'24px'}}>For teams ready to reach more people with higher volume and automation.</p>
                  <div style={{display:'flex', alignItems:'baseline', gap:'4px', marginBottom:'8px'}}>
                    <span style={{fontSize:'18px', color:'var(--tx3)', fontFamily:"'Instrument Serif',serif"}}>$</span>
                    <span className="price-num">{isAnnual ? pricing.outbound.an : pricing.outbound.mo}</span>
                    <span className="text-sm" style={{color:'var(--tx3)', marginLeft:'4px'}}>/ month</span>
                  </div>
                  <div style={{fontSize:'10px', color:'var(--tx3)', marginBottom:'24px', minHeight:'15px'}}>
                    {isAnnual && `$${pricing.outbound.an * 12} billed annually — save $${(pricing.outbound.mo - pricing.outbound.an) * 12}`}
                  </div>
                  <div style={{height:'1px', background:'rgba(255,255,255,0.06)', marginBottom:'24px'}}></div>
                  <ul style={{flex:1, display:'flex', flexDirection:'column', gap:'12px', marginBottom:'24px'}}>
                    <PricingFeat text="1,000+ verified leads / month" />
                    <PricingFeat text="Unlimited email templates" />
                    <PricingFeat text="Multi-campaign outreach" />
                    <PricingFeat text="Pipeline & follow-up tools" />
                    <PricingFeat text="Full analytics & reporting" />
                    <PricingFeat text="Priority support" />
                  </ul>
                  <button className="btn btn-outline" style={{width:'100%', padding:'10px'}}>Join waitlist</button>
                </div>
              </div>

              <div className="text-center" style={{fontSize:'12px', color:'var(--tx3)', marginTop:'40px', lineHeight:'1.6'}}>
                All plans include verified contact data and fast business discovery.<br />
                No setup fees. Upgrade, downgrade, or cancel any time.
              </div>
            </div>
          </div>
        </div>

        {/* --- 10. SETTINGS --- */}
        <div className={`page ${activePage === 'settings' ? 'active' : ''}`}>
          <div className="topbar">
            <div className="page-title">Settings</div>
            <div className="actions">
              <button className="btn-primary">Save Changes</button>
            </div>
          </div>
          <div className="settings-layout">
            <div className="settings-nav">
              <div className={`nav-item ${settingsTab === 'profile' ? 'active' : ''}`} onClick={() => setSettingsTab('profile')}>Profile</div>
              <div className={`nav-item ${settingsTab === 'account' ? 'active' : ''}`} onClick={() => setSettingsTab('account')}>Account</div>
              <div className={`nav-item ${settingsTab === 'notifications' ? 'active' : ''}`} onClick={() => setSettingsTab('notifications')}>Notifications</div>
              <div className={`nav-item ${settingsTab === 'billing' ? 'active' : ''}`} onClick={() => setSettingsTab('billing')}>Billing</div>
              <div className={`nav-item danger-zone ${settingsTab === 'danger' ? 'active' : ''}`} onClick={() => setSettingsTab('danger')}>Danger Zone</div>
            </div>
            <div className="settings-content">
              {settingsTab === 'profile' && (
                <div className="settings-card">
                  <div className="title" style={{fontSize:'18px', fontWeight:600, marginBottom:'24px'}}>Profile Information</div>
                  <div className="form-group profile-photo">
                    <div className="avatar">AR</div>
                    <div>
                      <button className="btn-outline">Change Photo</button>
                      <div style={{fontSize:'12px', color:'var(--tx2)', marginTop:'8px'}}>JPG or PNG, up to 5MB</div>
                    </div>
                  </div>
                  <div style={{display:'flex', gap:'20px'}}>
                    <div className="form-group" style={{flex:1}}>
                      <label className="form-label">First name</label>
                      <input type="text" className="form-input" defaultValue="Alex" />
                    </div>
                    <div className="form-group" style={{flex:1}}>
                      <label className="form-label">Last name</label>
                      <input type="text" className="form-input" defaultValue="Rivera" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email address</label>
                    <input type="email" className="form-input" defaultValue="alex@example.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Business / Agency name</label>
                    <input type="text" className="form-input" defaultValue="Rivera Growth Studio" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select className="form-input">
                      <option>America/New_York (UTC-5)</option>
                      <option>Europe/London (UTC+0)</option>
                    </select>
                  </div>
                </div>
              )}
              {settingsTab !== 'profile' && (
                <div className="settings-card" style={{textAlign:'center', padding:'60px'}}>
                  Feature coming soon for '{settingsTab}' tab.
                </div>
              )}
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
    <li className={`${off ? 'off' : ''}`}>
      {off ? (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
    <polyline points="1 6 4.5 9.5 11 3" />
  </svg>
);

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

const DashboardIcon = (props: any) => (
  <svg className="icon" viewBox="0 0 24 24" {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
);
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