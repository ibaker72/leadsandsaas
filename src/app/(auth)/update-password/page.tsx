'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Eye, EyeOff, AlertCircle, Loader2, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
      setDone(true);
      setTimeout(() => { router.push('/overview'); router.refresh(); }, 2000);
    } catch {
      setError('Something went wrong.');
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
          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'var(--success-soft)' }}>
                <Check size={28} style={{ color: 'var(--success)' }} />
              </div>
              <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>Password updated</h2>
              <p className="text-[14px]" style={{ color: 'var(--text-dark-secondary)' }}>Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              <h2 className="text-[20px] md:text-[22px] font-bold mb-1" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>Set new password</h2>
              <p className="text-[13px] md:text-[14px] mb-6" style={{ color: 'var(--text-dark-secondary)' }}>Enter your new password below.</p>
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5 animate-fade-in text-[13px]" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
                  <AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{error}</span>
                </div>
              )}
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: 'var(--text-dark)' }}>New Password</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required autoComplete="new-password" disabled={loading}
                      className="w-full px-4 py-3 pr-11 rounded-xl text-[14px]" style={{ background: '#f8f9fb', border: '1.5px solid #e5e7eb', outline: 'none' }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: 'var(--text-dark-secondary)' }} tabIndex={-1}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: 'var(--text-dark)' }}>Confirm Password</label>
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" required autoComplete="new-password" disabled={loading}
                    className="w-full px-4 py-3 rounded-xl text-[14px]" style={{ background: '#f8f9fb', border: '1.5px solid #e5e7eb', outline: 'none' }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                </div>
                <button type="submit" disabled={loading || !password || !confirm}
                  className="w-full py-3 rounded-xl text-[14px] font-bold transition-all flex items-center justify-center gap-2"
                  style={{ background: 'var(--accent)', color: '#0b0e14', opacity: loading ? 0.6 : 1 }}>
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
