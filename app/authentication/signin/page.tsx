"use client";
import Link from 'next/link';
import React, { useState } from 'react';

export default function SignIn() {
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign In Attempt:", { email, password });
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white font-sans selection:bg-[#6C63FF] selection:text-white overflow-hidden">
      {/* Custom Global Styles for Syne Font */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
      ` }} />

      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left Panel - Branding */}
        <div className="hidden md:flex w-5/12 bg-gradient-to-br from-[#111827] to-[#0A0F1E] p-12 lg:p-16 flex-col justify-between border-r border-white/10 relative overflow-hidden">
          <div className="absolute bottom-[-80px] right-[-80px] w-80 h-80 bg-[#6C63FF]/20 blur-[100px] rounded-full"></div>
          <Link href="/" className="text-2xl font-extrabold font-syne z-10 tracking-tighter text-white">
            Lead<span className="text-[#6C63FF]">Pulse</span>
          </Link>
          
          <div className="z-10">
            <h2 className="text-4xl font-bold font-syne mb-4 leading-tight tracking-tight text-white">
              Welcome back. <br /> Your pipeline awaits.
            </h2>
            <p className="text-gray-400">Your leads are waiting — sign in to pick up where you left off.</p>
          </div>

          <div className="space-y-4 z-10">
            {["1,240 leads captured today", "99.9% uptime guaranteed", "SOC 2 Type II certified"].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full"></span> {text}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          <div className="w-full max-w-sm text-white">
            <h3 className="text-3xl font-bold font-syne mb-2 tracking-tight">Sign in</h3>
            <p className="text-sm text-gray-500 mb-8 font-sans">
              Don't have one? <Link href="/authentication/signup" className="text-[#A78BFA] hover:underline">Create a free account</Link>
            </p>

            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-3 text-sm font-medium hover:bg-white/10 transition-all mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/5"></div>
              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">or email</span>
              <div className="flex-1 h-px bg-white/5"></div>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#6C63FF]/50 transition-all text-sm text-white" 
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                  <Link href="#" className="text-[10px] text-[#A78BFA] uppercase font-bold hover:underline">Forgot?</Link>
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#6C63FF]/50 transition-all text-sm text-white" 
                />
              </div>
              
              <button type="submit" className="w-full py-4 bg-[#6C63FF] hover:bg-opacity-90 text-white font-bold rounded-xl shadow-lg shadow-[#6C63FF]/20 transition-all flex items-center justify-center">
                Sign In →
              </button>
            </form>

            <footer className="mt-12 text-center text-[10px] text-gray-600 leading-relaxed px-4">
              By signing in, you agree to LeadPulse's <Link href="#" className="underline">Terms</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
