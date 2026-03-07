'use client';
import { useState } from 'react';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0b0e14 0%, #1a1f2e 100%)' }}>
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-glow)' }}>
            <Zap size={22} color="#0b0e14" strokeWidth={2.5} />
          </div>
          <span className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi' }}>
            LeadSaaS
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 md:p-8" style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h2 className="text-[20px] md:text-[22px] font-bold mb-1" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>Welcome back</h2>
          <p className="text-[13px] md:text-[14px] mb-6" style={{ color: 'var(--text-dark-secondary)' }}>Sign in to your account</p>

          <form onSubmit={(e) => { e.preventDefault(); setLoading(true); }} className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: 'var(--text-dark)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required
                className="w-full px-4 py-3 rounded-xl text-[14px]" style={{ background: '#f8f9fb', border: '1.5px solid #e5e7eb', outline: 'none', transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: 'var(--text-dark)' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full px-4 py-3 rounded-xl text-[14px]" style={{ background: '#f8f9fb', border: '1.5px solid #e5e7eb', outline: 'none', transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-amber-500" />
                <span className="text-[12.5px]" style={{ color: 'var(--text-dark-secondary)' }}>Remember me</span>
              </label>
              <a href="#" className="text-[12.5px] font-medium" style={{ color: 'var(--accent)' }}>Forgot password?</a>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-[14px] font-bold transition-all"
              style={{ background: 'var(--accent)', color: '#0b0e14', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-[13px] mt-5" style={{ color: 'var(--text-dark-secondary)' }}>
            Don&apos;t have an account? <a href="#" className="font-semibold" style={{ color: 'var(--accent)' }}>Start free trial</a>
          </p>
        </div>

        <p className="text-center text-[11px] mt-6" style={{ color: 'var(--text-muted)' }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
