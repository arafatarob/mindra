'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthenticationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [strength, setScore] = useState(0);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetUsername, setResetUsername] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const tab = searchParams?.get('tab');
    const token = searchParams?.get('resetToken');
    const username = searchParams?.get('username');
    if (tab === 'signup' || tab === 'login') {
      setActiveTab(tab);
    }
    if (token) {
      setResetToken(token);
      setResetUsername(username || '');
      setActiveTab('login');
      setForgotPasswordMode(false);
    }
  }, [searchParams]);

  // --- Canvas Animation Logic ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W: number, H: number, particles: Particle[] = [];
    let animationFrameId: number;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    class Particle {
      x!: number; y!: number; r!: number; vx!: number; vy!: number; alpha!: number; color!: string;
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.r = Math.random() * 1.4 + 0.3;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.alpha = Math.random() * 0.4 + 0.1;
        this.color = Math.random() > 0.5 ? '108,99,255' : '139,92,246';
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
        ctx.fill();
      }
    }

    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 100; i++) particles.push(new Particle());

    let t = 0;
    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.008;

      // Draw Orbs
      const orbs = [
        { x: W * 0.12, y: H * 0.18, r: 200, c: '108,99,255', a: 0.06 },
        { x: W * 0.85, y: H * 0.75, r: 260, c: '139,92,246', a: 0.05 },
      ];
      orbs.forEach((o, i) => {
        const ox = o.x + Math.sin(t * 0.4 + i * 2) * 25;
        const oy = o.y + Math.cos(t * 0.3 + i * 1.5) * 20;
        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        grad.addColorStop(0, `rgba(${o.c},${o.a})`);
        grad.addColorStop(1, `rgba(${o.c},0)`);
        ctx.beginPath();
        ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      particles.forEach(p => { p.update(); p.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- Form Logic ---
  const checkStrength = (val: string) => {
    setPassword(val);
    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    setScore(score);
  };

  const parseApiResponse = async (response: Response) => {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { error: text || response.statusText };
    }
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setProfileImage(null);
      setProfileImagePreview('');
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || response.statusText || 'Login failed.');
      }

      if (!data.user) {
        throw new Error('User data missing from response.');
      }

      window.localStorage.setItem('authUser', JSON.stringify(data.user));
      setForgotPasswordMode(false);
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotError('');
    setForgotMessage('');
    setResetLink('');
    const usernameToUse = forgotUsername.trim();

    if (!usernameToUse) {
      setForgotError('Please enter your username to reset your password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameToUse }),
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || response.statusText || 'Unable to send password reset link.');
      }

      setForgotMessage(data.resetLink
        ? 'A password reset link was generated for ' + usernameToUse + '. Copy it below.'
        : 'If an account exists for ' + usernameToUse + ', a reset link will be sent.');
      setResetLink(data.resetLink || '');
      setForgotUsername(usernameToUse);
    } catch (err) {
      setForgotError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResetError('');
    setResetSuccess('');
    if (resetPassword.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }
    if (resetPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: resetPassword }),
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || response.statusText || 'Unable to reset password.');
      }

      setResetSuccess('Password updated successfully. Please sign in with your new password.');
      setResetPassword('');
      setResetConfirmPassword('');
      setResetToken('');
      router.replace('/authentication?tab=login');
    } catch (err) {
      setResetError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          username: registerUsername,
          password,
          profileImage: profileImagePreview,
        }),
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || response.statusText || 'Registration failed.');
      }

      setSuccess('Account created successfully. Please sign in.');
      setActiveTab('login');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body min-h-screen relative overflow-hidden bg-[#080A12] text-[#F0F2FF] font-sora selection:bg-[#6C63FF] selection:text-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Sora:wght@300;400;500;600&family=Syne:wght@700&display=swap');
        
        .font-instrument { font-family: 'Instrument Serif', serif; }
        .font-syne { font-family: 'Syne', sans-serif; }
        
        .grid-overlay {
          position: fixed; inset: 0; z-index: 1;
          background-image: linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
          pointer-events: none;
        }

        .orb-blur { filter: blur(80px); animation: drift 12s ease-in-out infinite; }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(20px, -30px); }
          66% { transform: translate(-15px, 20px); }
        }

        .sb { flex:1; height:3px; border-radius:2px; background: rgba(255,255,255,0.08); transition: all .3s; }
        .sb.weak { background: #EF4444; }
        .sb.fair { background: #F59E0B; }
        .sb.good { background: #22C55E; }
      `}} />

      <canvas ref={canvasRef} className="fixed inset-0 z-0" />
      <div className="grid-overlay" />

      <div className="relative z-10 flex flex-col md:flex-row h-screen">
        
        {/* --- LEFT PANEL --- */}
        <div className="hidden md:flex flex-col w-1/2 p-12 border-r border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#4F8EF7]/10 orb-blur rounded-full -translate-x-1/2 -translate-y-1/2" />
          
          <div className="text-2xl font-instrument mb-auto">
            AR<span className="text-[#6C63FF]">FA</span>
            <span className="block text-xs font-sora text-gray-500 mt-1">by MINDRA Solutions</span>
          </div>

          <div className="mb-auto">
            <h1 className="text-5xl font-instrument leading-tight mb-6">
              Find leads.<br />
              Close clients.<br />
              <em className="text-[#7AB3FF]">Grow faster.</em>
            </h1>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-10">
              The only lead generation platform built for agencies and freelancers who want verified contacts — not noise.
            </p>

            <div className="space-y-4">
              {[
                { title: 'AI-powered lead discovery', desc: 'Find verified business contacts in seconds', color: '#4F8EF7', bg: 'rgba(79,142,247,.12)', icon: 'M11 11L14.5 14.5M12.5 7C12.5 10.0376 10.0376 12.5 7 12.5C3.96243 12.5 1.5 10.0376 1.5 7C1.5 3.96243 3.96243 1.5 7 1.5C10.0376 1.5 12.5 3.96243 12.5 7Z' },
                { title: 'Outreach & pipeline tools', desc: 'Templates and deal tracking built in', color: '#8B5CF6', bg: 'rgba(139,92,246,.12)', icon: 'M2 4h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z M5 4V2h6v2' },
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-blue-500/20 transition-all cursor-default">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: feat.bg }}>
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke={feat.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={feat.icon} />
                    </svg>
                  </div>
                  <div className="text-xs">
                    <strong className="block text-[#F0F2FF] font-medium mb-0.5">{feat.title}</strong>
                    <span className="text-gray-500">{feat.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-10">
              <div className="flex-1 p-4 bg-white/[0.04] border border-white/5 rounded-2xl">
                <div className="text-2xl font-instrument text-[#7AB3FF]">25k+</div>
                <div className="text-[10px] uppercase tracking-widest text-gray-600 mt-1">Businesses found</div>
              </div>
              <div className="flex-1 p-4 bg-white/[0.04] border border-white/5 rounded-2xl">
                <div className="text-2xl font-instrument text-[#7AB3FF]">94%</div>
                <div className="text-[10px] uppercase tracking-widest text-gray-600 mt-1">Email accuracy</div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-[#8B5CF6]/5 border border-[#8B5CF6]/10 rounded-2xl">
            <p className="text-xs text-gray-400 italic leading-relaxed mb-3">"ARFA cut my prospecting time from 4 hours to 20 minutes. I closed 3 new clients in the first month."</p>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4F8EF7] to-[#8B5CF6] flex items-center justify-center text-[10px] font-bold">JR</div>
              <div>
                <div className="text-[11px] font-medium">James Rivera</div>
                <div className="text-[9px] text-gray-600">Growth consultant · London</div>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL --- */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          <div className="w-full max-w-[400px]">
            
            {/* Tabs */}
            {!resetToken ? (
              <div className="relative p-1 bg-white/[0.04] border border-white/5 rounded-2xl flex mb-10">
                <div 
                  className={`absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-white/10 border border-white/10 rounded-xl transition-transform duration-300 ease-out ${activeTab === 'signup' ? 'translate-x-full' : ''}`}
                />
                <button 
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2.5 text-xs font-semibold relative z-10 transition-colors ${activeTab === 'login' ? 'text-white' : 'text-gray-500'}`}
                >
                  Sign in
                </button>
                <button 
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2.5 text-xs font-semibold relative z-10 transition-colors ${activeTab === 'signup' ? 'text-white' : 'text-gray-500'}`}
                >
                  Create account
                </button>
              </div>
            ) : null}

            {/* Sign In Pane */}
            {activeTab === 'login' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-instrument mb-1">{resetToken ? 'Reset password' : 'Welcome back'}</h2>
                {resetToken ? (
                  <div className="text-xs text-gray-500 mb-8">Enter your email and new password below.</div>
                ) : (
                  <p className="text-xs text-gray-500 mb-8">New to ARFA? <button onClick={() => setActiveTab('signup')} className="text-[#7AB3FF] hover:underline">Create a free account →</button></p>
                )}

                {!resetToken ? (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] text-gray-600 uppercase font-semibold">or email</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                ) : null}

                {resetToken ? (
                  <form className="space-y-4" onSubmit={handleResetSubmit}>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1.5 ml-1">Username</label>
                      <input
                        type="text"
                        value={resetUsername}
                        readOnly
                        placeholder="Username not available"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6C63FF]/50 focus:bg-[#6C63FF]/5 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1.5 ml-1">New password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        placeholder="Enter your new password"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6C63FF]/50 focus:bg-[#6C63FF]/5 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1.5 ml-1">Confirm password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6C63FF]/50 focus:bg-[#6C63FF]/5 transition-all"
                      />
                    </div>
                    {resetError ? <p className="text-red-400 text-xs">{resetError}</p> : null}
                    {resetSuccess ? <p className="text-green-400 text-xs">{resetSuccess}</p> : null}
                    <div className="grid gap-3">
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] rounded-xl font-bold text-white text-sm mt-4 hover:opacity-90 transform active:scale-[0.98] transition-all shadow-lg shadow-purple-500/20"
                        disabled={loading}
                      >
                        {loading ? 'Resetting password...' : 'Reset password'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setResetToken('');
                            setResetUsername('');
                          setResetPassword('');
                          setResetConfirmPassword('');
                          setResetError('');
                          setResetSuccess('');
                          setForgotPasswordMode(false);
                          setActiveTab('login');
                          router.replace('/authentication?tab=login');
                        }}
                        className="w-full py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white hover:bg-white/10 transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </form>
                ) : (
                  <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1.5 ml-1">Username</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          placeholder="Enter your username"
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6C63FF]/50 focus:bg-[#6C63FF]/5 transition-all"
                          required
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600">
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 4h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z"/><polyline points="2 4 8 9 14 4"/></svg>
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1.5 ml-1">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6C63FF]/50 focus:bg-[#6C63FF]/5 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                        >
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 pt-2">
                      {forgotPasswordMode && (
                        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-xs uppercase tracking-[0.24em] text-gray-400">Reset password</div>
                            <button
                              type="button"
                              onClick={() => setForgotPasswordMode(false)}
                              className="text-gray-400 text-[11px] hover:text-white"
                            >
                              Close
                            </button>
                          </div>
                          <p className="text-[11px] text-gray-500 mb-3">
                            Enter your username and we’ll send a reset link if the username is registered.
                          </p>
                          <input
                            type="text"
                            value={forgotUsername}
                            onChange={(e) => setForgotUsername(e.target.value)}
                            placeholder="your username"
                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6C63FF]/50 transition-all"
                          required
                          />
                          {forgotError ? <p className="text-red-400 text-xs mt-2">{forgotError}</p> : null}
                          {forgotMessage ? <p className="text-green-400 text-xs mt-2">{forgotMessage}</p> : null}
                          <button
                            type="button"
                            onClick={handleForgotPassword}
                            disabled={loading}
                            className="w-full mt-3 py-3 rounded-xl bg-[#6C63FF] text-white text-sm font-semibold hover:opacity-90 transition-all"
                          >
                            {loading ? 'Sending...' : 'Send reset link'}
                          </button>
                          {resetLink ? (
                            <div className="mt-4 rounded-2xl bg-white/[0.04] border border-white/10 p-4">
                              <div className="text-xs uppercase tracking-[0.24em] text-gray-400 mb-2">Reset link preview</div>
                              <div className="text-[13px] break-all text-gray-100 bg-[#111827] rounded-xl p-3 font-mono">{resetLink}</div>
                              <button
                                type="button"
                                onClick={() => navigator.clipboard.writeText(resetLink)}
                                className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 py-2 text-sm text-white hover:bg-white/10 transition-all"
                              >
                                Copy link
                              </button>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                    {error ? <p className="text-red-400 text-xs">{error}</p> : null}
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] rounded-xl font-bold text-white text-sm mt-4 hover:opacity-90 transform active:scale-[0.98] transition-all shadow-lg shadow-purple-500/20"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign in to ARFA →'}
                    </button>
                  </form>
                )}

                <p className="text-[10px] text-center text-gray-600 mt-8 leading-relaxed">
                  By signing in you agree to our <a className="text-gray-400 hover:underline">Terms of Service</a> and <a className="text-gray-400 hover:underline">Privacy Policy</a>
                </p>
              </div>
            )}

            {/* Sign Up Pane */}
            {activeTab === 'signup' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-instrument mb-1">Start for free</h2>
                <p className="text-xs text-gray-500 mb-8">Already have an account? <button onClick={() => setActiveTab('login')} className="text-[#7AB3FF] hover:underline">Sign in →</button></p>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-[11px] font-medium text-gray-400 mb-1.5 ml-1">First name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Alex"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6C63FF]/50 transition-all"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-medium text-gray-400 mb-1.5 ml-1">Last name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Rivera"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6C63FF]/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1.5 ml-1">Profile photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="w-full text-[12px] text-gray-200 file:mr-4 file:py-2 file:px-4 file:border file:border-white/10 file:rounded-full file:text-sm file:bg-white/5 file:text-white file:cursor-pointer"
                    />
                    {profileImagePreview ? (
                      <div className="mt-3">
                        <div className="text-[11px] text-gray-400 mb-2">Preview</div>
                        <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10">
                          <img src={profileImagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1.5 ml-1">Username</label>
                    <input
                      type="text"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6C63FF]/50 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1.5 ml-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => checkStrength(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6C63FF]/50 transition-all"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
                      >
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg>
                      </button>
                    </div>
                    
                    {/* Strength Meter */}
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] text-gray-600 uppercase font-semibold tracking-wider">Security strength</span>
                        <span className="text-[10px] text-gray-400">
                          {strength === 0 ? '' : strength === 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong'}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <div className={`sb ${strength >= 1 ? (strength <= 1 ? 'weak' : strength <= 2 ? 'fair' : 'good') : ''}`} />
                        <div className={`sb ${strength >= 2 ? (strength <= 2 ? 'fair' : 'good') : ''}`} />
                        <div className={`sb ${strength >= 3 ? 'good' : ''}`} />
                        <div className={`sb ${strength >= 4 ? 'good' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {error ? <p className="text-red-400 text-xs">{error}</p> : null}
                  {success ? <p className="text-green-400 text-xs">{success}</p> : null}

                  <p className="text-[10px] text-gray-600 leading-relaxed pt-2">
                    By creating an account you agree to our <a className="text-gray-400">Terms</a> and <a className="text-gray-400">Privacy Policy</a>. We'll occasionally send you product updates.
                  </p>

                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] rounded-xl font-bold text-white text-sm mt-4 hover:opacity-90 transform active:scale-[0.98] transition-all"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create free account →'}
                  </button>
                </form>

                <div className="text-center mt-6">
                  <span className="text-[11px] text-gray-600">🔒 No credit card required · 25 free leads</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}