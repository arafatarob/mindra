"use client";
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-[#0A0F1E] min-h-screen text-white font-sans selection:bg-[#6C63FF] selection:text-white overflow-x-hidden">
      {/* Header: Logo left, Menu right */}
      <nav className="sticky top-0 z-50 bg-[#0A0F1E] border-b border-white/10 px-6 py-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold font-syne tracking-tighter">AR<span className="text-[#6C63FF]">FA</span></div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-500 hidden sm:block">Lead generation studio</div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors font-bold">
            Dashboard
          </Link>
          <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors font-bold">
            Pricing
          </Link>
          <Link href="/authentication?tab=login" className="text-gray-400 hover:text-white transition-colors font-bold">
            Login
          </Link>
          <Link href="/authentication?tab=signup" className="px-5 py-2 bg-[#6C63FF] hover:bg-[#5a54e0] rounded-xl font-semibold transition-all text-white">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="badge inline-flex items-center gap-2 bg-[#6C63FF]/15 border border-[#6C63FF]/30 rounded-full px-4 py-1.5 text-xs text-[#A78BFA] mb-8">
            <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse"></span>
            Now with AI-powered lead scoring
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold font-syne tracking-tight leading-[1.1] mb-6 text-white">
            Turn Visitors Into <br /> High-Value Leads
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            ARFA captures, qualifies, and nurtures your pipeline automatically — so your team closes more deals, faster.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/authentication?tab=signup" className="px-8 py-4 bg-[#6C63FF] hover:bg-[#5a54e0] rounded-xl font-bold transition-all text-white no-underline">
              Start Free Trial →
            </Link>
            <Link href="/pricing" className="px-8 py-4 bg-transparent border border-white/20 hover:border-white/40 rounded-xl font-bold transition-all text-white no-underline">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 border-y border-white/10 bg-white/[0.02]">
        <div className="p-12 text-center border-r border-white/10">
          <div className="text-4xl font-bold font-syne text-white">12<span className="text-[#A78BFA]">k+</span></div>
          <div className="text-sm text-gray-500 mt-2 uppercase tracking-widest font-semibold">Companies using ARFA</div>
        </div>
        <div className="p-12 text-center border-r border-white/10">
          <div className="text-4xl font-bold font-syne text-white">4.8<span className="text-[#A78BFA]">×</span></div>
          <div className="text-sm text-gray-500 mt-2 uppercase tracking-widest font-semibold">Average pipeline growth</div>
        </div>
        <div className="p-12 text-center">
          <div className="text-4xl font-bold font-syne text-white">98<span className="text-[#A78BFA]">%</span></div>
          <div className="text-sm text-gray-500 mt-2 uppercase tracking-widest font-semibold">Customer satisfaction</div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-8 max-w-6xl mx-auto">
        <div className="text-xs font-bold uppercase tracking-widest text-[#A78BFA] mb-4 text-center">Why ARFA</div>
        <h2 className="text-4xl font-bold font-syne mb-16 text-center">Everything you need to dominate your pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🎯", title: "AI Lead Scoring", desc: "Automatically rank leads by conversion probability so your team focuses on the best opportunities." },
            { icon: "⚡", title: "Smart Capture Forms", desc: "Embed high-converting forms anywhere. Dynamic fields adapt to each visitor in real time." },
            { icon: "📊", title: "Pipeline Analytics", desc: "Visual funnel reports and real-time dashboards show exactly where leads drop off." }
          ].map((feat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-2xl group hover:border-[#6C63FF]/50 transition-colors">
              <div className="text-2xl mb-4 group-hover:scale-110 transition-transform">{feat.icon}</div>
              <h3 className="text-lg font-bold font-syne mb-2 text-white">{feat.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-12 border-t border-white/10 px-8 text-center text-sm text-gray-600">
        © 2024 ARFA Inc. All rights reserved.
      </footer>
    </div>
  );
}