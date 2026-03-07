'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = getSupabaseBrowser();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account first.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      router.push('/overview');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(145deg, #0b0e14 0%, #141928 50%, #1a1f2e 100%)' }}>
      <div className="w-full max-w-[420px]">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-glow)' }}>
            <Zap size={22} color="#0b0e14" strokeWidth={2.5} />
          </div>
          <span className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi' }}>LeadSaaS</span>
        </div>

        <div className="rounded-2xl p-6 md:p-8 animate-fade-in" style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h2 className="text-[20px] md:text-[22px] font-bold mb-1" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>Welcome back</h2>
          <p className="text-[13px] md:text-[14px] mb-6" style={{ color: 'var(--text-dark-secondary)' }}>Sign in to your account</p>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5 animate-fade-in text-[13px]" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: 'var(--text-dark)' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required autoComplete="email" disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-[14px] transition-all" style={{ background: '#f8f9fb', border: '1.5px solid #e5e7eb', outline: 'none', opacity: loading ? 0.6 : 1 }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: 'var(--text-dark)' }}>Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" disabled={loading}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-[14px] transition-all" style={{ background: '#f8f9fb', border: '1.5px solid #e5e7eb', outline: 'none', opacity: loading ? 0.6 : 1 }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md" style={{ color: 'var(--text-dark-secondary)' }} tabIndex={-1}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-amber-500" />
                <span className="text-[12.5px]" style={{ color: 'var(--text-dark-secondary)' }}>Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-[12.5px] font-medium hover:underline" style={{ color: 'var(--accent)' }}>Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl text-[14px] font-bold transition-all flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)', color: '#0b0e14', opacity: loading || !email || !password ? 0.6 : 1, cursor: loading ? 'wait' : 'pointer' }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-[13px] mt-5" style={{ color: 'var(--text-dark-secondary)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>Start free trial</Link>
          </p>
        </div>

        <p className="text-center text-[11px] mt-6" style={{ color: 'var(--text-muted)' }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
