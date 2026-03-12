'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, ArrowRight, CheckCircle2, Users, MessageSquare, Calendar, AlertTriangle } from 'lucide-react';
import { PLAN_CONFIGS } from '@/lib/billing/pricing-config';

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade(planId: string) {
    setLoading(planId);
    setError(null);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, interval: 'monthly' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      const errMsg = (data.error as string) || (data.message as string) || '';
      if (res.status === 403) {
        setError('Only the account owner can manage billing.');
      } else if (res.status === 401) {
        setError('Your session has expired. Please refresh and try again.');
      } else if (errMsg.includes('STRIPE_SECRET_KEY')) {
        setError('Billing is not configured yet. Please contact support.');
      } else {
        setError(errMsg || 'Failed to start checkout. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'var(--warning-soft)' }}>
            <AlertTriangle size={28} style={{ color: 'var(--warning)' }} />
          </div>
          <h1 className="text-[24px] sm:text-[32px] font-bold tracking-tight mb-3" style={{ fontFamily: 'Satoshi', color: 'var(--text-dark)' }}>
            Your 7-day trial has ended
          </h1>
          <p className="text-[15px] sm:text-[16px] max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-dark-secondary)' }}>
            Choose a plan to keep your leads, conversations, and pipeline.
            Your data is safe for 30 days.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {PLAN_CONFIGS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 bg-white relative ${plan.popular ? 'border-2 border-amber-300 shadow-lg ring-1 ring-amber-200' : 'border border-gray-200'}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide" style={{ background: 'var(--accent)', color: '#0b0e14' }}>
                  Recommended
                </div>
              )}
              <h3 className="text-[18px] font-bold mb-1" style={{ fontFamily: 'Satoshi', color: 'var(--text-dark)' }}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-[36px] font-bold tracking-tight" style={{ fontFamily: 'Satoshi', color: 'var(--text-dark)' }}>${plan.monthlyPrice}</span>
                <span className="text-[14px]" style={{ color: 'var(--text-dark-secondary)' }}>/mo</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>
                    <CheckCircle2 size={15} style={{ color: 'var(--accent)' }} className="shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-xl text-[14px] font-bold transition-all ${plan.popular ? 'hover:opacity-90' : 'bg-gray-100 hover:bg-gray-200'}`}
                style={plan.popular ? { background: 'var(--accent)', color: '#0b0e14' } : { color: 'var(--text-dark)' }}
              >
                {loading === plan.id ? 'Redirecting...' : `Choose ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 px-5 py-4 rounded-xl" style={{ background: 'var(--danger-soft, #fef2f2)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertTriangle size={16} style={{ color: 'var(--danger, #ef4444)' }} className="shrink-0" />
            <p className="text-[13px] font-medium" style={{ color: 'var(--danger, #ef4444)' }}>{error}</p>
          </div>
        )}

        <p className="text-center text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>
          Questions? Contact us at{' '}
          <a href="mailto:hello@leadsandsaas.com" className="font-medium" style={{ color: 'var(--accent)' }}>hello@leadsandsaas.com</a>
        </p>
      </div>
    </div>
  );
}
