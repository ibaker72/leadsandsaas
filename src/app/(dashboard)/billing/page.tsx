'use client';
import { TopBar } from '@/components/dashboard/sidebar';
import { Card, Button } from '@/components/ui/primitives';
import { Check, Zap, MessageSquare, Bot, Users, ArrowRight, CreditCard, AlertTriangle } from 'lucide-react';

const USAGE = { convos:{used:1247,limit:2000}, agents:{used:2,limit:3}, users:{used:3,limit:5} };
const PLANS = [
  { id:'starter', name:'Starter', price:297, features:['1 AI Agent','500 conversations/mo','1 team member','SMS & Email','Basic analytics'] },
  { id:'growth', name:'Growth', price:597, popular:true, features:['3 AI Agents','2,000 conversations/mo','5 team members','All channels','Advanced analytics','Zapier integration'] },
  { id:'scale', name:'Scale', price:1497, features:['10 AI Agents','10,000 conversations/mo','Unlimited team','All channels + Voice','Priority support','White-label'] },
];

function Meter({ label, used, limit, icon }: { label:string; used:number; limit:number; icon:React.ReactNode }) {
  const pct = Math.min((used/limit)*100, 100);
  const color = pct>=95?'var(--danger)':pct>=80?'var(--warning)':'var(--accent)';
  return (
    <div className="py-3 md:py-4" style={{ borderBottom:'1px solid #f0f2f5' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><span style={{ color:'var(--text-dark-secondary)' }}>{icon}</span><span className="text-[12px] md:text-[13px] font-medium" style={{ color:'var(--text-dark)' }}>{label}</span></div>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] md:text-[13px] font-bold tabular-nums" style={{ color }}>{used.toLocaleString()}</span>
          <span className="text-[11px]" style={{ color:'var(--text-dark-secondary)' }}>/ {limit.toLocaleString()}</span>
        </div>
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background:'#e8eaef' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}/>
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <div>{pct>=95&&<div className="flex items-center gap-1.5"><AlertTriangle size={11} style={{ color:'var(--danger)' }}/><span className="text-[10.5px] font-medium" style={{ color:'var(--danger)' }}>Approaching limit</span></div>}</div>
        <span className="text-[10.5px] font-semibold tabular-nums" style={{ color: 'var(--text-dark-secondary)' }}>{Math.round(pct)}%</span>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <>
      <TopBar title="Billing" subtitle="Plan & usage" />
      <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Current plan + usage — stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'var(--accent)', boxShadow:'var(--shadow-glow)' }}><Zap size={18} color="#0b0e14"/></div>
              <div>
                <h3 className="text-[15px] md:text-[16px] font-bold" style={{ color:'var(--text-dark)', fontFamily:'Satoshi' }}>Growth Plan</h3>
                <p className="text-[11px] md:text-[12px]" style={{ color:'var(--text-dark-secondary)' }}>Billed monthly</p>
              </div>
            </div>
            <div className="mb-5">
              <span className="text-[32px] md:text-[36px] font-bold count-up" style={{ color:'var(--text-dark)', fontFamily:'Satoshi' }}>$597</span>
              <span className="text-[14px]" style={{ color:'var(--text-dark-secondary)' }}>/mo</span>
            </div>
            <div className="text-[12px] mb-4 px-3 py-2 rounded-lg" style={{ background:'var(--success-soft)', color:'var(--success)' }}>
              Next billing: April 7, 2026
            </div>
            <Button variant="secondary" size="md" className="w-full"><CreditCard size={14}/> Manage Payment</Button>
          </Card>
          <Card className="lg:col-span-2">
            <h3 className="text-[14px] md:text-[15px] font-bold mb-3 md:mb-4" style={{ color:'var(--text-dark)', fontFamily:'Satoshi' }}>Current Usage</h3>
            <Meter label="Conversations" used={USAGE.convos.used} limit={USAGE.convos.limit} icon={<MessageSquare size={14}/>}/>
            <Meter label="AI Agents" used={USAGE.agents.used} limit={USAGE.agents.limit} icon={<Bot size={14}/>}/>
            <Meter label="Team Members" used={USAGE.users.used} limit={USAGE.users.limit} icon={<Users size={14}/>}/>
          </Card>
        </div>
        {/* Plans — responsive grid */}
        <div>
          <h2 className="text-[16px] md:text-[18px] font-bold mb-4 md:mb-5" style={{ color:'var(--text-dark)', fontFamily:'Satoshi' }}>All Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {PLANS.map(p => {
              const cur = p.id==='growth';
              return (
                <div key={p.id} className="rounded-xl p-5 md:p-6 relative transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" style={{ background: cur ? 'linear-gradient(135deg, #fffbeb, #ffffff)' : '#fff', border:cur?'2px solid var(--accent)':'1px solid #e8eaef', boxShadow:cur?'var(--shadow-glow)':'var(--shadow-sm)' }}>
                  {p.popular&&<div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] md:text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap accent-gradient-bar" style={{ color:'#0b0e14' }}>MOST POPULAR</div>}
                  <h3 className="text-[15px] md:text-[16px] font-bold mb-1" style={{ color:'var(--text-dark)', fontFamily:'Satoshi' }}>{p.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4 md:mb-5">
                    <span className="text-[30px] md:text-[36px] font-bold" style={{ color:'var(--text-dark)', fontFamily:'Satoshi' }}>${p.price}</span>
                    <span className="text-[13px] md:text-[14px]" style={{ color:'var(--text-dark-secondary)' }}>/mo</span>
                  </div>
                  <div className="space-y-2 md:space-y-2.5 mb-5 md:mb-6">
                    {p.features.map(f=><div key={f} className="flex items-center gap-2.5"><Check size={14} className="shrink-0" style={{ color:'var(--success)' }}/><span className="text-[12px] md:text-[13px]" style={{ color:'var(--text-dark-secondary)' }}>{f}</span></div>)}
                  </div>
                  {cur?<Button variant="secondary" size="md" className="w-full" disabled>Current Plan</Button>:<Button variant={p.popular?'primary':'secondary'} size="md" className="w-full">Upgrade <ArrowRight size={14}/></Button>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
