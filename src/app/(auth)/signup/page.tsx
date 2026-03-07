'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Eye, EyeOff, AlertCircle, Loader2, Check } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/db/supabase-browser';

const VERTICALS = [
  { value: 'hvac', label: 'HVAC' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'med_spa', label: 'Med Spa' },
  { value: 'dental', label: 'Dental' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'legal', label: 'Legal' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'auto_repair', label: 'Auto Repair' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'general', label: 'Other' },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [vertical, setVertical] = useState('general');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseBrowser();

      // 1. Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            company_name: companyName.trim(),
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('An account with this email already exists. Try signing in.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      // If email confirmation is required, show confirmation screen
      if (authData.user && !authData.session) {
        setStep('confirm');
        setLoading(false);
        return;
      }

      // If auto-confirmed (dev mode), set up the org
      if (authData.user && authData.session) {
        await setupOrganization(supabase, authData.user.id);
        router.push('/overview');
        router.refresh();
        return;
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  async function setupOrganization(supabase: ReturnType<typeof getSupabaseBrowser>, userId: string) {
    const slug = companyName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      || `org-${Date.now()}`;

    // Create org
    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .insert({
        name: companyName.trim() || 'My Company',
        slug,
        vertical: vertical as any,
        plan: 'trial',
      })
      .select('id')
      .single();

    if (orgErr || !org) {
      console.error('Org creation error:', orgErr);
      return;
    }

    // Create membership
    await supabase.from('organization_members').insert({
      org_id: org.id,
      user_id: userId,
      role: 'owner',
    });

    // Create user profile
    await supabase.from('user_profiles').insert({
      id: userId,
      full_name: fullName.trim(),
    });

    // Set org_id in user JWT claims
    // Note: This requires a Supabase Auth hook or admin API.
    // For now, we'll use the admin RPC approach
    await supabase.rpc('set_user_org_claim' as any, {
      p_user_id: userId,
      p_org_id: org.id,
    }).catch(() => {
      // Fallback: the claim will be set on next login via auth hook
      console.log('JWT claim will be set on next login');
    });

    // Create default pipeline
    await supabase.rpc('create_default_pipeline', {
      p_org_id: org.id,
    });
  }

  // Confirmation screen
  if (step === 'confirm') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(145deg, #0b0e14 0%, #141928 50%, #1a1f2e 100%)' }}>
        <div className="w-full max-w-[420px]">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-glow)' }}>
              <Zap size={22} color="#0b0e14" strokeWidth={2.5} />
            </div>
            <span className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi' }}>LeadSaaS</span>
          </div>

          <div className="rounded-2xl p-6 md:p-8 text-center animate-fade-in" style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'var(--success-soft)' }}>
              <Check size={28} style={{ color: 'var(--success)' }} />
            </div>
            <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>Check your email</h2>
            <p className="text-[14px] mb-6 leading-relaxed" style={{ color: 'var(--text-dark-secondary)' }}>
              We sent a confirmation link to <strong style={{ color: 'var(--text-dark)' }}>{email}</strong>. Click the link to activate your account.
            </p>
            <p className="text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>
              Already confirmed?{' '}
              <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Signup form
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
          <h2 className="text-[20px] md:text-[22px] font-bold mb-1" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>Start your free trial</h2>
          <p className="text-[13px] md:text-[14px] mb-6" style={{ color: 'var(--text-dark-secondary)' }}>14 days free. No credit card required.</p>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5 animate-fade-in text-[13px]" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: 'var(--text-dark)' }}>Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Smith" required disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-[14px] transition-all" style={{ background: '#f8f9fb', border: '1.5px solid #e5e7eb', outline: 'none' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: 'var(--text-dark)' }}>Company Name</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme HVAC" required disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-[14px] transition-all" style={{ background: '#f8f9fb', border: '1.5px solid #e5e7eb', outline: 'none' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: 'var(--text-dark)' }}>Industry</label>
              <select value={vertical} onChange={(e) => setVertical(e.target.value)} disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-[14px] transition-all appearance-none cursor-pointer"
                style={{ background: '#f8f9fb', border: '1.5px solid #e5e7eb', outline: 'none' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}>
                {VERTICALS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: 'var(--text-dark)' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required autoComplete="email" disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-[14px] transition-all" style={{ background: '#f8f9fb', border: '1.5px solid #e5e7eb', outline: 'none' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: 'var(--text-dark)' }}>Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required autoComplete="new-password" disabled={loading}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-[14px] transition-all" style={{ background: '#f8f9fb', border: '1.5px solid #e5e7eb', outline: 'none' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md" style={{ color: 'var(--text-dark-secondary)' }} tabIndex={-1}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && password.length < 8 && (
                <p className="text-[11.5px] mt-1.5" style={{ color: 'var(--danger)' }}>Password must be at least 8 characters</p>
              )}
            </div>

            <button type="submit" disabled={loading || !email || !password || !fullName || !companyName}
              className="w-full py-3 rounded-xl text-[14px] font-bold transition-all flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)', color: '#0b0e14', opacity: loading ? 0.6 : 1, cursor: loading ? 'wait' : 'pointer' }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-[13px] mt-5" style={{ color: 'var(--text-dark-secondary)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>Sign in</Link>
          </p>
        </div>

        <p className="text-center text-[11px] mt-6" style={{ color: 'var(--text-muted)' }}>
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
