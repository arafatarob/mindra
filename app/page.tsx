"use client";
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-[#0A0F1E] min-h-screen text-white font-sans selection:bg-[#6C63FF] selection:text-white overflow-x-hidden">
      {/* Header: Logo left, Menu right */}
      <nav className="sticky top-0 z-50 bg-[#0A0F1E]/95 border-b border-white/10 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <div className="text-xl font-bold font-syne tracking-tighter">
          Lead<span className="text-[#6C63FF]">Pulse</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors font-bold">
            Dashboard
          </Link>
          <Link href="/authentication/signin" className="text-gray-400 hover:text-white transition-colors font-bold">
            Login
          </Link>
          <Link href="/authentication/signup" className="px-5 py-2 bg-[#6C63FF] hover:bg-opacity-90 rounded-xl font-semibold transition-all shadow-lg shadow-[#6C63FF]/20">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-8 text-center">
        <div className="absolute top-[-200px] right-[-200px] w-96 h-96 bg-[#6C63FF]/20 blur-[120px] rounded-full"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="badge inline-flex items-center gap-2 bg-[#6C63FF]/15 border border-[#6C63FF]/30 rounded-full px-4 py-1.5 text-xs text-[#A78BFA] mb-8">
            <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse"></span>
            Now with AI-powered lead scoring
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold font-syne tracking-tight leading-[1.1] mb-6 bg-gradient-to-br from-white via-white to-[#A78BFA] bg-clip-text text-transparent">
            Turn Visitors Into <br /> High-Value Leads
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            LeadPulse captures, qualifies, and nurtures your pipeline automatically — so your team closes more deals, faster.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/authentication/signup" className="px-8 py-4 bg-[#6C63FF] hover:bg-[#5a54e0] rounded-xl font-bold transition-all shadow-lg shadow-[#6C63FF]/20 text-white no-underline">
              Start Free Trial →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 border-y border-white/10 bg-white/[0.02]">
        <div className="p-12 text-center border-r border-white/10">
          <div className="text-4xl font-bold font-syne text-white">12<span className="text-[#A78BFA]">k+</span></div>
          <div className="text-sm text-gray-500 mt-2 uppercase tracking-widest font-semibold">Companies using LeadPulse</div>
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
        <div className="text-xs font-bold uppercase tracking-widest text-[#A78BFA] mb-4 text-center">Why LeadPulse</div>
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
        © 2024 LeadPulse Inc. All rights reserved.
      </footer>
    </div>
  );
}