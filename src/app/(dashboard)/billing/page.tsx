'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TopBar } from '@/components/dashboard/sidebar';
import { Button, Badge, Modal } from '@/components/ui/primitives';
import { Check, Zap, MessageSquare, Bot, Users, ArrowRight, CreditCard, AlertTriangle, Loader2, Crown, Shield, CheckCircle2, Sparkles } from 'lucide-react';
import { PLAN_CONFIGS } from '@/lib/billing/pricing-config';

/* ---------- Default limits per plan ---------- */
const PLAN_LIMITS: Record<string, { agents: number; convos: number; users: number }> = {
  trial: { agents: 1, convos: 500, users: 1 },
  starter: { agents: 1, convos: 500, users: 1 },
  growth: { agents: 3, convos: 2000, users: 5 },
  scale: { agents: 10, convos: 10000, users: 999 },
  enterprise: { agents: 999, convos: 999999, users: 999 },
};

function Meter({ label, used, limit, icon }: { label: string; used: number; limit: number; icon: React.ReactNode }) {
  const pct = Math.min((used / limit) * 100, 100);
  const color = pct >= 95 ? 'var(--danger)' : pct >= 80 ? 'var(--warning)' : 'var(--accent)';
  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}14`, color }}>
            {icon}
          </div>
          <span className="text-[13px] font-semibold" style={{ color: 'var(--text-dark)' }}>{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold tabular-nums" style={{ color }}>{used.toLocaleString()}</span>
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-dark-secondary)' }}>/ {limit.toLocaleString()}</span>
        </div>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#f0f2f5' }}>
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <div>{pct >= 95 && <div className="flex items-center gap-1.5"><AlertTriangle size={11} style={{ color: 'var(--danger)' }} /><span className="text-[11px] font-medium" style={{ color: 'var(--danger)' }}>Approaching limit</span></div>}</div>
        <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--text-dark-secondary)' }}>{Math.round(pct)}% used</span>
      </div>
    </div>
  );
}

function BillingContent() {
  const searchParams = useSearchParams();
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('trial');
  const [usage, setUsage] = useState({ convos: { used: 0, limit: 500 }, agents: { used: 0, limit: 1 }, users: { used: 0, limit: 1 } });

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setSuccessBanner(true);
      window.history.replaceState({}, '', '/billing');
      const t = setTimeout(() => setSuccessBanner(false), 8000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/billing/status')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          if (data.plan) setCurrentPlan(data.plan);
          const limits = PLAN_LIMITS[data.plan] || PLAN_LIMITS.trial;
          setUsage({
            convos: { used: data.conversations_used || 0, limit: data.limits?.max_conversations_monthly || limits.convos },
            agents: { used: data.agents_count || 0, limit: data.limits?.max_agents || limits.agents },
            users: { used: data.members_count || 0, limit: data.limits?.max_users || limits.users },
          });
        }
      })
      .catch(() => {});
  }, []);

  function extractError(data: Record<string, unknown>): string {
    return (data.error as string) || (data.message as string) || '';
  }

  async function handleUpgrade(planId: string) {
    setLoading(planId);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, interval: annual ? 'annual' : 'monthly' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      const errMsg = extractError(data);
      if (res.status === 403) {
        setErrorModal('Only the account owner can manage billing. Ask your admin to upgrade.');
      } else if (res.status === 401) {
        setErrorModal('Your session has expired. Please refresh and try again.');
      } else if (errMsg.includes('STRIPE_SECRET_KEY')) {
        setErrorModal('Billing is not configured yet. Please contact support.');
      } else {
        setErrorModal(errMsg || 'Failed to start checkout. Please try again.');
      }
    } catch {
      setErrorModal('Network error. Please check your connection and try again.');
    } finally {
      setLoading(null);
    }
  }

  async function handleManagePayment() {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      const errMsg = extractError(data);
      if (errMsg.includes('No billing account')) {
        setErrorModal('No active subscription yet. Choose a plan below to get started.');
      } else {
        setErrorModal(errMsg || 'Unable to open billing portal. Please try again.');
      }
    } catch {
      setErrorModal('Network error. Please check your connection and try again.');
    } finally {
      setPortalLoading(false);
    }
  }

  const currentPlanConfig = PLAN_CONFIGS.find(p => p.id === currentPlan);

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 max-w-6xl">

      {/* Checkout success banner */}
      {successBanner && (
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-xl animate-fade-in"
          style={{ background: 'var(--success-soft)', border: '1px solid rgba(16,185,129,0.2)' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--success)', color: '#fff' }}>
            <CheckCircle2 size={16} />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold" style={{ color: 'var(--success)' }}>Payment successful</p>
            <p className="text-[12px]" style={{ color: 'var(--text-dark-secondary)' }}>Your subscription is now active. It may take a moment for your plan to update.</p>
          </div>
          <button onClick={() => setSuccessBanner(false)} className="text-[16px] px-2 py-1 rounded hover:bg-white/50 transition-colors" style={{ color: 'var(--text-dark-secondary)' }}>&times;</button>
        </div>
      )}

      {/* Current plan + usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Current Plan Card */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #e8eaef', boxShadow: 'var(--shadow-sm)' }}>
          <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, var(--accent), #fbbf24, var(--accent))', backgroundSize: '200% 100%' }} />
          <div className="p-5 md:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)', boxShadow: '0 0 16px var(--accent-glow)' }}>
                <Zap size={18} color="#0b0e14" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>
                  {currentPlanConfig?.name || (currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1))} Plan
                </h3>
                <p className="text-[12px]" style={{ color: 'var(--text-dark-secondary)' }}>
                  {currentPlan === 'trial' ? '7-day free trial' : 'Active subscription'}
                </p>
              </div>
            </div>

            <div className="mb-5">
              {currentPlanConfig ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-[36px] font-bold tracking-tight" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>${currentPlanConfig.monthlyPrice}</span>
                  <span className="text-[14px]" style={{ color: 'var(--text-dark-secondary)' }}>/mo</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-[36px] font-bold tracking-tight" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>$0</span>
                  <span className="text-[14px]" style={{ color: 'var(--text-dark-secondary)' }}> trial</span>
                </div>
              )}
            </div>

            <div className="text-[12px] font-medium mb-5 px-3 py-2.5 rounded-lg" style={{
              background: currentPlan === 'trial' ? 'var(--warning-soft, #fef3c7)' : 'var(--success-soft)',
              color: currentPlan === 'trial' ? 'var(--warning, #d97706)' : 'var(--success)',
            }}>
              {currentPlan === 'trial' ? 'Free trial — upgrade to unlock full features' : 'Active subscription'}
            </div>

            <Button variant="secondary" size="md" className="w-full" onClick={handleManagePayment} disabled={portalLoading}>
              {portalLoading ? <><Loader2 size={14} className="animate-spin" /> Opening portal...</> : <><CreditCard size={14} /> Manage Payment</>}
            </Button>
          </div>
        </div>

        {/* Usage Card */}
        <div className="lg:col-span-2 rounded-xl" style={{ background: '#fff', border: '1px solid #e8eaef', boxShadow: 'var(--shadow-sm)' }}>
          <div className="px-5 md:px-6 pt-5 md:pt-6 pb-2">
            <h3 className="text-[15px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>Current Usage</h3>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-dark-secondary)' }}>Resource consumption this billing period</p>
          </div>
          <div className="px-5 md:px-6 pb-5 md:pb-6 divide-y" style={{ borderColor: '#f0f2f5' }}>
            <Meter label="Conversations" used={usage.convos.used} limit={usage.convos.limit} icon={<MessageSquare size={14} />} />
            <Meter label="AI Agents" used={usage.agents.used} limit={usage.agents.limit} icon={<Bot size={14} />} />
            <Meter label="Team Members" used={usage.users.used} limit={usage.users.limit} icon={<Users size={14} />} />
          </div>
        </div>
      </div>

      {/* Plans section */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[18px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>Available Plans</h2>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-dark-secondary)' }}>Choose the plan that fits your business</p>
          </div>
          {/* Annual/Monthly toggle */}
          <div className="flex items-center p-1 rounded-xl" style={{ background: '#f0f2f5', border: '1px solid #e8eaef' }}>
            <button
              onClick={() => setAnnual(false)}
              className="px-4 md:px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all"
              style={{
                background: !annual ? '#fff' : 'transparent',
                color: !annual ? 'var(--text-dark)' : 'var(--text-dark-secondary)',
                boxShadow: !annual ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                border: !annual ? '1px solid #e8eaef' : '1px solid transparent',
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className="px-4 md:px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2"
              style={{
                background: annual ? '#fff' : 'transparent',
                color: annual ? 'var(--text-dark)' : 'var(--text-dark-secondary)',
                boxShadow: annual ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                border: annual ? '1px solid #e8eaef' : '1px solid transparent',
              }}
            >
              Annual
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {PLAN_CONFIGS.map((p) => {
            const cur = p.id === currentPlan;
            const price = annual ? p.annualPrice : p.monthlyPrice;
            const isLoading = loading === p.id;
            return (
              <div
                key={p.id}
                className="rounded-xl relative transition-all duration-200 hover:-translate-y-0.5 flex flex-col overflow-hidden"
                style={{
                  background: cur ? 'linear-gradient(135deg, #fffbeb, #ffffff)' : '#fff',
                  border: p.popular ? '2px solid var(--accent)' : cur ? '2px solid var(--accent)' : '1px solid #e8eaef',
                  boxShadow: p.popular ? '0 0 0 1px rgba(245,158,11,0.1), 0 8px 24px rgba(245,158,11,0.08)' : cur ? 'var(--shadow-glow)' : '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                {p.popular && <div className="h-[3px] accent-gradient-bar" />}

                <div className="p-5 md:p-6 flex flex-col flex-1">
                  {p.popular && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Sparkles size={12} style={{ color: 'var(--accent)' }} />
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Most Popular</span>
                    </div>
                  )}
                  {cur && !p.popular && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Crown size={12} style={{ color: 'var(--accent)' }} />
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Current Plan</span>
                    </div>
                  )}
                  {cur && p.popular && (
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center gap-1.5">
                        <Crown size={12} style={{ color: 'var(--accent)' }} />
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Current Plan</span>
                      </span>
                    </div>
                  )}

                  <h3 className="text-[16px] font-bold mb-0.5" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>{p.name}</h3>
                  <p className="text-[12px] mb-4" style={{ color: 'var(--text-dark-secondary)' }}>{p.description}</p>

                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-[32px] md:text-[36px] font-bold tracking-tight" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>${price}</span>
                    <span className="text-[14px]" style={{ color: 'var(--text-dark-secondary)' }}>/mo</span>
                  </div>
                  {annual && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[12px] line-through" style={{ color: 'var(--text-dark-secondary)' }}>${p.monthlyPrice}/mo</span>
                      <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                        Save ${(p.monthlyPrice - p.annualPrice) * 12}/yr
                      </span>
                    </div>
                  )}
                  {!annual && <div className="mb-4" />}

                  <div className="border-t pt-4 mb-5 flex-1" style={{ borderColor: '#f0f2f5' }}>
                    <div className="space-y-2.5">
                      {p.features.map((f) => (
                        <div key={f} className="flex items-center gap-2.5">
                          <Check size={14} className="shrink-0" style={{ color: 'var(--success)' }} />
                          <span className="text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {cur ? (
                    <Button variant="secondary" size="md" className="w-full" disabled>
                      <Shield size={14} /> Current Plan
                    </Button>
                  ) : (
                    <Button
                      variant={p.popular ? 'primary' : 'secondary'}
                      size="md"
                      className="w-full"
                      onClick={() => handleUpgrade(p.id)}
                      disabled={!!loading}
                    >
                      {isLoading ? (
                        <><Loader2 size={14} className="animate-spin" /> Processing...</>
                      ) : (
                        <>{p.cta} <ArrowRight size={14} /></>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise callout */}
        <div className="mt-5 md:mt-6 rounded-xl overflow-hidden" style={{ border: '1px solid #e8eaef' }}>
          <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />
          <div className="p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, #fefdf8, #f8f9fb)' }}>
            <div>
              <h3 className="text-[15px] font-bold mb-1" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>Need more?</h3>
              <p className="text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>Enterprise plans with custom limits, dedicated support, and SLA guarantees.</p>
            </div>
            <Button variant="secondary" size="md" className="shrink-0 w-full sm:w-auto" onClick={() => setErrorModal('Enterprise inquiries: Please email hello@leadsandsaas.com')}>
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <>
      <TopBar title="Billing" subtitle="Plan & usage" />
      <Suspense fallback={<div className="flex-1 p-8"><div className="skeleton h-[200px] rounded-xl" /></div>}>
        <BillingContent />
      </Suspense>

      {/* Error/info modal is handled inside BillingContent */}
    </>
  );
}
