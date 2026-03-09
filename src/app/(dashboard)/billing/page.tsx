'use client';
import { useState, useEffect } from 'react';
import { TopBar } from '@/components/dashboard/sidebar';
import { Card, Button, Badge, Modal, ComingSoonContent } from '@/components/ui/primitives';
import { Check, Zap, MessageSquare, Bot, Users, ArrowRight, CreditCard, AlertTriangle, Loader2, Crown, Shield } from 'lucide-react';

/* ---------- Plan data ---------- */
const PLANS = [
  { id: 'starter' as const, name: 'Starter', monthly: 297, annual: 249, features: ['1 AI Agent', '500 conversations/mo', '1 team member', 'SMS & Email', 'Basic analytics'], cta: 'Get Started' },
  { id: 'growth' as const, name: 'Growth', monthly: 597, annual: 497, popular: true, features: ['3 AI Agents', '2,000 conversations/mo', '5 team members', 'All channels', 'Advanced analytics', 'Zapier integration'], cta: 'Upgrade to Growth' },
  { id: 'scale' as const, name: 'Scale', monthly: 1497, annual: 1247, features: ['10 AI Agents', '10,000 conversations/mo', 'Unlimited team', 'All channels + Voice', 'Priority support', 'White-label'], cta: 'Go Scale' },
];

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
    <div className="py-3 md:py-4" style={{ borderBottom: '1px solid #f0f2f5' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--text-dark-secondary)' }}>{icon}</span>
          <span className="text-[12px] md:text-[13px] font-medium" style={{ color: 'var(--text-dark)' }}>{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] md:text-[13px] font-bold tabular-nums" style={{ color }}>{used.toLocaleString()}</span>
          <span className="text-[11px]" style={{ color: 'var(--text-dark-secondary)' }}>/ {limit.toLocaleString()}</span>
        </div>
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: '#e8eaef' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <div>{pct >= 95 && <div className="flex items-center gap-1.5"><AlertTriangle size={11} style={{ color: 'var(--danger)' }} /><span className="text-[10.5px] font-medium" style={{ color: 'var(--danger)' }}>Approaching limit</span></div>}</div>
        <span className="text-[10.5px] font-semibold tabular-nums" style={{ color: 'var(--text-dark-secondary)' }}>{Math.round(pct)}%</span>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState('trial');
  const [usage, setUsage] = useState({ convos: { used: 0, limit: 500 }, agents: { used: 0, limit: 1 }, users: { used: 0, limit: 1 } });

  useEffect(() => {
    // Fetch real org plan and usage data
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

  /** Extract error message from API response (handles both {error} and {message,code} shapes) */
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
        return; // don't clear loading — page is navigating
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

  return (
    <>
      <TopBar title="Billing" subtitle="Plan & usage" />
      <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Current plan + usage — stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-glow)' }}>
                <Zap size={18} color="#0b0e14" />
              </div>
              <div>
                <h3 className="text-[15px] md:text-[16px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>{(PLANS.find(p => p.id === currentPlan)?.name || currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1))} Plan</h3>
                <p className="text-[11px] md:text-[12px]" style={{ color: 'var(--text-dark-secondary)' }}>{currentPlan === 'trial' ? '14-day trial' : 'Active subscription'}</p>
              </div>
            </div>
            <div className="mb-5">
              {(() => { const p = PLANS.find(pl => pl.id === currentPlan); return p ? (
                <><span className="text-[32px] md:text-[36px] font-bold count-up" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>${p.monthly}</span>
                <span className="text-[14px]" style={{ color: 'var(--text-dark-secondary)' }}>/mo</span></>
              ) : (
                <><span className="text-[32px] md:text-[36px] font-bold count-up" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>$0</span>
                <span className="text-[14px]" style={{ color: 'var(--text-dark-secondary)' }}> trial</span></>
              ); })()}
            </div>
            <div className="text-[12px] mb-4 px-3 py-2 rounded-lg" style={{ background: currentPlan === 'trial' ? 'var(--warning-soft, #fef3c7)' : 'var(--success-soft)', color: currentPlan === 'trial' ? 'var(--warning, #d97706)' : 'var(--success)' }}>
              {currentPlan === 'trial' ? 'Free trial — upgrade to unlock full features' : 'Active subscription'}
            </div>
            <Button variant="secondary" size="md" className="w-full" onClick={handleManagePayment} disabled={portalLoading}>
              {portalLoading ? <><Loader2 size={14} className="animate-spin" /> Opening portal...</> : <><CreditCard size={14} /> Manage Payment</>}
            </Button>
          </Card>
          <Card className="lg:col-span-2">
            <h3 className="text-[14px] md:text-[15px] font-bold mb-3 md:mb-4" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>Current Usage</h3>
            <Meter label="Conversations" used={usage.convos.used} limit={usage.convos.limit} icon={<MessageSquare size={14} />} />
            <Meter label="AI Agents" used={usage.agents.used} limit={usage.agents.limit} icon={<Bot size={14} />} />
            <Meter label="Team Members" used={usage.users.used} limit={usage.users.limit} icon={<Users size={14} />} />
          </Card>
        </div>

        {/* Plans section */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 md:mb-6">
            <h2 className="text-[16px] md:text-[18px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>All Plans</h2>
            {/* Annual/Monthly toggle */}
            <div className="flex items-center gap-2 p-1 rounded-lg" style={{ background: '#f0f2f5' }}>
              <button
                onClick={() => setAnnual(false)}
                className="px-3 md:px-4 py-2 rounded-md text-[12px] md:text-[13px] font-semibold transition-all"
                style={{
                  background: !annual ? '#fff' : 'transparent',
                  color: !annual ? 'var(--text-dark)' : 'var(--text-dark-secondary)',
                  boxShadow: !annual ? 'var(--shadow-sm)' : 'none',
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className="px-3 md:px-4 py-2 rounded-md text-[12px] md:text-[13px] font-semibold transition-all flex items-center gap-1.5"
                style={{
                  background: annual ? '#fff' : 'transparent',
                  color: annual ? 'var(--text-dark)' : 'var(--text-dark-secondary)',
                  boxShadow: annual ? 'var(--shadow-sm)' : 'none',
                }}
              >
                Annual
                <Badge variant="success">Save 17%</Badge>
              </button>
            </div>
          </div>

          {/* Plan cards — responsive grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {PLANS.map((p) => {
              const cur = p.id === currentPlan;
              const price = annual ? p.annual : p.monthly;
              const isLoading = loading === p.id;
              return (
                <div
                  key={p.id}
                  className="rounded-xl p-5 md:p-6 relative transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col"
                  style={{
                    background: cur ? 'linear-gradient(135deg, #fffbeb, #ffffff)' : '#fff',
                    border: cur ? '2px solid var(--accent)' : '1px solid #e8eaef',
                    boxShadow: cur ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                  }}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] md:text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap accent-gradient-bar" style={{ color: '#0b0e14' }}>
                      MOST POPULAR
                    </div>
                  )}
                  {cur && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Crown size={13} style={{ color: 'var(--accent)' }} />
                      <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Current Plan</span>
                    </div>
                  )}
                  <h3 className="text-[15px] md:text-[16px] font-bold mb-1" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>{p.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-[28px] md:text-[36px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>${price}</span>
                    <span className="text-[13px] md:text-[14px]" style={{ color: 'var(--text-dark-secondary)' }}>/mo</span>
                  </div>
                  {annual && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[12px] line-through" style={{ color: 'var(--text-dark-secondary)' }}>${p.monthly}/mo</span>
                      <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                        Save ${(p.monthly - p.annual) * 12}/yr
                      </span>
                    </div>
                  )}
                  {!annual && <div className="mb-3" />}

                  <div className="space-y-2 md:space-y-2.5 mb-5 md:mb-6 flex-1">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-center gap-2.5">
                        <Check size={14} className="shrink-0" style={{ color: 'var(--success)' }} />
                        <span className="text-[12px] md:text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>{f}</span>
                      </div>
                    ))}
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
              );
            })}
          </div>

          {/* Enterprise callout */}
          <div className="mt-5 md:mt-6 rounded-xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ background: '#f8f9fb', border: '1px solid #e8eaef' }}>
            <div>
              <h3 className="text-[14px] md:text-[15px] font-bold mb-1" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>Need more?</h3>
              <p className="text-[12px] md:text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>Enterprise plans with custom limits, dedicated support, and SLA guarantees.</p>
            </div>
            <Button variant="secondary" size="md" className="shrink-0 w-full sm:w-auto" onClick={() => setErrorModal('Enterprise inquiries: Please email sales@leadsandsaas.com')}>
              Contact Sales
            </Button>
          </div>
        </div>
      </div>

      {/* Error/info modal */}
      <Modal open={!!errorModal} onClose={() => setErrorModal(null)} title="Billing">
        <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--text-dark-secondary)' }}>{errorModal}</p>
        <Button variant="primary" size="md" className="w-full" onClick={() => setErrorModal(null)}>Got it</Button>
      </Modal>
    </>
  );
}
