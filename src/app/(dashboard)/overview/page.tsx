'use client';

import { TopBar } from '@/components/dashboard/sidebar';
import { StatCard, Card, Badge, Avatar, SectionHeader, LiveIndicator } from '@/components/ui/primitives';
import { Users, MessageSquare, Calendar, TrendingUp, Bot, ChevronRight, Zap, Phone, Activity } from 'lucide-react';
import Link from 'next/link';

const STATS = { totalLeads: 1247, leadsChange: 12.5, activeConvos: 38, convosChange: 8.3, appts: 7, apptsChange: -2.1, convRate: 24.6, convRateChange: 3.2 };

const ACTIVITY = [
  { id: '1', text: 'New lead from web form', name: 'Sarah Mitchell', time: '2m', icon: Users, color: 'var(--info)' },
  { id: '2', text: 'Appointment booked by AI', name: 'Marcus Johnson', time: '8m', icon: Calendar, color: 'var(--success)' },
  { id: '3', text: 'Lead qualified — high intent', name: 'David Chen', time: '15m', icon: TrendingUp, color: 'var(--accent)' },
  { id: '4', text: 'Escalated to human agent', name: 'Lisa Rodriguez', time: '22m', icon: Phone, color: 'var(--danger)' },
  { id: '5', text: 'Follow-up sent via SMS', name: 'James Wilson', time: '34m', icon: MessageSquare, color: 'var(--info)' },
  { id: '6', text: 'Lead converted', name: 'Emily Davis', time: '1h', icon: Zap, color: 'var(--success)' },
];

const AGENTS = [
  { name: 'HVAC Sales Pro', convos: 156, booked: 34, time: '28s', rate: 22 },
  { name: 'Roofing Lead Closer', convos: 89, booked: 22, time: '32s', rate: 25 },
  { name: 'Med Spa Concierge', convos: 203, booked: 67, time: '24s', rate: 33 },
];

const LIVE = [
  { id: '1', name: 'Sarah Mitchell', agent: 'HVAC Sales Pro', msg: 'Yes, I need my AC looked at ASAP.', time: '2m', unread: true, ch: 'SMS' },
  { id: '2', name: 'Marcus Johnson', agent: 'Roofing Lead Closer', msg: 'Tuesday at 10am works for me.', time: '8m', unread: false, ch: 'EMAIL' },
  { id: '3', name: 'David Chen', agent: 'Med Spa Concierge', msg: 'How much does a hydrafacial cost?', time: '15m', unread: true, ch: 'SMS' },
];

function MiniChart() {
  const d = [35, 48, 42, 65, 52, 78, 62, 85, 73, 91, 68, 95, 82, 74];
  const mx = Math.max(...d);
  return (
    <div className="flex items-end gap-[4px] h-14 md:h-20 mt-2">
      {d.map((v, i) => {
        const isRecent = i >= d.length - 3;
        const height = `${(v / mx) * 100}%`;
        return (
          <div key={i} className="flex-1 relative animate-fade-in opacity-0" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'forwards' }}>
            {/* Shadow bar for depth */}
            <div className="absolute inset-x-0 bottom-0 rounded-t-sm" style={{ height, background: isRecent ? 'var(--accent)' : '#e2e5eb', opacity: isRecent ? 1 : 0.5, minWidth: '4px' }} />
            {/* Gradient overlay on recent bars */}
            {isRecent && (
              <div className="absolute inset-x-0 bottom-0 rounded-t-sm" style={{ height, background: 'linear-gradient(180deg, rgba(251,191,36,0.3) 0%, var(--accent) 100%)', minWidth: '4px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OverviewPage() {
  return (
    <>
      <TopBar title="Overview" subtitle="Your sales command center" />
      <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-5 md:space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          <StatCard label="Total Leads" value={STATS.totalLeads.toLocaleString()} change={STATS.leadsChange} icon={<Users size={18} />} accentColor="var(--info)" delay={50} />
          <StatCard label="Active Convos" value={STATS.activeConvos} change={STATS.convosChange} icon={<MessageSquare size={18} />} accentColor="var(--accent)" delay={100} />
          <StatCard label="Appts Today" value={STATS.appts} change={STATS.apptsChange} icon={<Calendar size={18} />} accentColor="var(--success)" delay={150} />
          <StatCard label="Conv. Rate" value={`${STATS.convRate}%`} change={STATS.convRateChange} icon={<TrendingUp size={18} />} accentColor="#a855f7" delay={200} />
        </div>

        {/* Chart + Agents */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          <Card className="lg:col-span-3 animate-fade-in opacity-0 stagger-3 [animation-fill-mode:forwards]">
            <div className="flex items-center justify-between mb-2">
              <SectionHeader title="Conversation Volume" action={<span className="text-[12px] md:text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>Last 14 days</span>} />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[24px] md:text-[30px] font-bold count-up" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>847</span>
              <span className="text-[12px] md:text-[13px] font-semibold" style={{ color: 'var(--success)' }}>+12%</span>
            </div>
            <MiniChart />
          </Card>

          <Card className="lg:col-span-2 animate-fade-in opacity-0 stagger-4 [animation-fill-mode:forwards]" padding={false}>
            <div className="p-4 md:p-5 pb-3">
              <SectionHeader
                title="Agent Performance"
                action={<Link href="/agents" className="text-[12px] font-semibold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: 'var(--accent)' }}>View all <ChevronRight size={14} /></Link>}
              />
            </div>
            <div className="divide-y divide-gray-100">
              {AGENTS.map((a) => (
                <div key={a.name} className="px-4 md:px-5 py-3 md:py-3.5 flex items-center gap-3 hover:bg-gray-50/80 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--accent-soft)' }}>
                    <Bot size={15} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-dark)' }}>{a.name}</span>
                      <LiveIndicator />
                    </div>
                    <div className="text-[11px] md:text-[11.5px]" style={{ color: 'var(--text-dark-secondary)' }}>
                      {a.convos} convos · {a.booked} booked
                    </div>
                  </div>
                  {/* Mini conversion bar */}
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <span className="text-[11px] font-bold tabular-nums" style={{ color: 'var(--accent)' }}>{a.rate}%</span>
                    <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: '#e8eaef' }}>
                      <div className="h-full rounded-full" style={{ width: `${a.rate}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Live + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card padding={false} className="animate-fade-in opacity-0 stagger-5 [animation-fill-mode:forwards]">
            <div className="p-4 md:p-5 pb-3">
              <SectionHeader
                title="Live Conversations"
                live
                action={<Link href="/conversations" className="text-[12px] font-semibold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: 'var(--accent)' }}>View all <ChevronRight size={14} /></Link>}
              />
            </div>
            <div className="divide-y divide-gray-100">
              {LIVE.map((c) => (
                <Link key={c.id} href="/conversations" className="flex items-start gap-3 px-4 md:px-5 py-3.5 hover:bg-gray-50/80 transition-colors">
                  <Avatar name={c.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold" style={{ color: 'var(--text-dark)' }}>{c.name}</span>
                        {c.unread && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />}
                      </div>
                      <span className="text-[11px] shrink-0 ml-2 tabular-nums" style={{ color: 'var(--text-dark-secondary)' }}>{c.time}</span>
                    </div>
                    <p className="text-[12.5px] leading-relaxed line-clamp-1 mb-1" style={{ color: 'var(--text-dark-secondary)' }}>{c.msg}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="muted">{c.ch}</Badge>
                      <span className="text-[11px] truncate" style={{ color: 'var(--text-dark-secondary)' }}>via {c.agent}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card padding={false} className="animate-fade-in opacity-0 stagger-6 [animation-fill-mode:forwards]">
            <div className="p-4 md:p-5 pb-3">
              <SectionHeader title="Recent Activity" action={<Activity size={15} style={{ color: 'var(--text-dark-secondary)' }} />} />
            </div>
            <div className="divide-y divide-gray-100">
              {ACTIVITY.map((a, idx) => (
                <div key={a.id} className="px-4 md:px-5 py-3 md:py-3.5 flex items-start gap-3 hover:bg-gray-50/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${a.color}14`, color: a.color }}>
                    <a.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] md:text-[13px] font-medium" style={{ color: 'var(--text-dark)' }}>{a.text}</div>
                    <div className="text-[11px] md:text-[12px] mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--text-dark-secondary)' }}>
                      {a.name}
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span className="tabular-nums" style={{ color: idx < 2 ? 'var(--text-dark)' : undefined, fontWeight: idx < 2 ? 600 : undefined }}>{a.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
