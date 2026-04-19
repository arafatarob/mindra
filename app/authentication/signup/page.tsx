"use client";
import Link from 'next/link';

export default function Signup() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col md:flex-row font-sans selection:bg-[#6C63FF] selection:text-white overflow-hidden">
      {/* Left Panel */}
      <div className="hidden md:flex w-5/12 bg-gradient-to-br from-[#111827] to-[#0A0F1E] p-12 lg:p-16 flex-col justify-between border-r border-white/10 relative overflow-hidden">
        <Link href="/" className="text-2xl font-extrabold font-syne z-10 text-white">
          Lead<span className="text-[#6C63FF]">Pulse</span>
        </Link>
        
        <div className="z-10">
          <h2 className="text-4xl font-bold font-syne mb-4 leading-tight tracking-tight text-white">Start capturing better leads today.</h2>
          <p className="text-gray-400 mb-8">Free 14-day trial. No credit card required. Cancel any time.</p>
          
          <div className="space-y-4">
            {["Unlimited leads for 14 days", "AI scoring included", "Set up in under 5 minutes"].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full"></span> {text}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#6C63FF]/10 border border-[#6C63FF]/20 p-6 rounded-2xl z-10">
          <p className="text-sm italic text-gray-400 leading-relaxed mb-4 text-white">"LeadPulse tripled our qualified pipeline in the first month."</p>
          <div className="text-xs font-bold text-[#A78BFA]">— Sarah K., VP Sales @ Orbit</div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 bg-[#0A0F1E] flex items-center justify-center p-8 overflow-y-auto relative">
        <div className="w-full max-w-sm py-12 text-white">
          <h3 className="text-3xl font-bold font-syne mb-2 tracking-tight">Create account</h3>
          <p className="text-sm text-gray-500 mb-8">Already have one? <Link href="/authentication/signin" className="text-[#A78BFA] hover:underline">Sign in here</Link></p>

          <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-3 text-sm font-medium hover:bg-white/10 transition-all mb-4">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">First Name</label>
                <input type="text" placeholder="Alex" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[#6C63FF] transition-all text-sm text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Last Name</label>
                <input type="text" placeholder="Rivera" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[#6C63FF] transition-all text-sm text-white" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Work email</label>
              <input type="email" placeholder="alex@company.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[#6C63FF] transition-all text-sm text-white" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Company name</label>
              <input type="text" placeholder="Acme Inc." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[#6C63FF] transition-all text-sm text-white" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
              <input type="password" placeholder="Min. 8 characters" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[#6C63FF] transition-all text-sm text-white" />
            </div>
            
            <div className="pt-4">
              <button type="button" className="w-full py-4 bg-[#6C63FF] hover:bg-opacity-90 text-white font-bold rounded-xl shadow-lg shadow-[#6C63FF]/20 transition-all flex items-center justify-center">
                Create Account →
              </button>
            </div>
          </form>

          <footer className="mt-6 text-center text-[10px] text-gray-600 leading-relaxed">
            By signing up, you agree to our <Link href="#" className="underline">Terms</Link> and <Link href="#" className="underline text-gray-500">Privacy Policy</Link>.
          </footer>
        </div>
      </div>
    </div>
  );
}