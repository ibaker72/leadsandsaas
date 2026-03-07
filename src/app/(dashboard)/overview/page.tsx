'use client';

import { TopBar } from '@/components/dashboard/sidebar';
import { StatCard, Card, Badge } from '@/components/ui/primitives';
import { Users, MessageSquare, Calendar, TrendingUp, Bot, ChevronRight, Zap, Phone } from 'lucide-react';
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
  { name: 'HVAC Sales Pro', convos: 156, booked: 34, time: '28s' },
  { name: 'Roofing Lead Closer', convos: 89, booked: 22, time: '32s' },
  { name: 'Med Spa Concierge', convos: 203, booked: 67, time: '24s' },
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
    <div className="flex items-end gap-[3px] h-12 md:h-16">
      {d.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm animate-fade-in opacity-0"
          style={{
            height: `${(v / mx) * 100}%`,
            background: i >= d.length - 3 ? 'var(--accent)' : '#e2e5eb',
            opacity: i >= d.length - 3 ? (i === d.length - 1 ? 1 : 0.6) : 0.5,
            animationDelay: `${i * 30}ms`,
            animationFillMode: 'forwards',
            minWidth: '3px',
          }}
        />
      ))}
    </div>
  );
}

export default function OverviewPage() {
  return (
    <>
      <TopBar title="Overview" subtitle="Your sales command center" />
      <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-5 md:space-y-8">
        {/* Stat cards: 2-col mobile, 4-col desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          <StatCard label="Total Leads" value={STATS.totalLeads.toLocaleString()} change={STATS.leadsChange} icon={<Users size={18} />} accentColor="var(--info)" delay={50} />
          <StatCard label="Active Convos" value={STATS.activeConvos} change={STATS.convosChange} icon={<MessageSquare size={18} />} accentColor="var(--accent)" delay={100} />
          <StatCard label="Appts Today" value={STATS.appts} change={STATS.apptsChange} icon={<Calendar size={18} />} accentColor="var(--success)" delay={150} />
          <StatCard label="Conv. Rate" value={`${STATS.convRate}%`} change={STATS.convRateChange} icon={<TrendingUp size={18} />} accentColor="#a855f7" delay={200} />
        </div>

        {/* Chart + Agents: stack on mobile, side-by-side desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          <Card className="lg:col-span-3 animate-fade-in opacity-0 stagger-3" style={{ animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h3 className="text-[14px] md:text-[15px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>
                  Conversation Volume
                </h3>
                <p className="text-[12px] md:text-[13px] mt-0.5" style={{ color: 'var(--text-dark-secondary)' }}>Last 14 days</p>
              </div>
              <div className="text-right">
                <div className="text-[20px] md:text-[24px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>847</div>
                <div className="text-[11px] md:text-[12px] font-medium" style={{ color: 'var(--success)' }}>+12% vs prior</div>
              </div>
            </div>
            <MiniChart />
          </Card>

          <Card className="lg:col-span-2 animate-fade-in opacity-0 stagger-4" padding={false} style={{ animationFillMode: 'forwards' }}>
            <div className="p-4 md:p-5 pb-3 flex items-center justify-between">
              <h3 className="text-[14px] md:text-[15px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>Agent Performance</h3>
              <Link href="/agents" className="text-[12px] font-semibold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {AGENTS.map((a) => (
                <div key={a.name} className="px-4 md:px-5 py-3 md:py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--accent-soft)' }}>
                    <Bot size={15} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-dark)' }}>{a.name}</div>
                    <div className="text-[11px] md:text-[11.5px]" style={{ color: 'var(--text-dark-secondary)' }}>
                      {a.convos} convos · {a.booked} booked · {a.time}
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full shrink-0 status-dot-active" style={{ background: 'var(--success)' }} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Live + Activity: stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card padding={false} className="animate-fade-in opacity-0 stagger-5" style={{ animationFillMode: 'forwards' }}>
            <div className="p-4 md:p-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h3 className="text-[14px] md:text-[15px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>
                  Live Conversations
                </h3>
                <span className="w-2 h-2 rounded-full status-dot-active" style={{ background: 'var(--success)' }} />
              </div>
              <Link href="/conversations" className="text-[12px] font-semibold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {LIVE.map((c) => (
                <Link key={c.id} href={`/conversations`} className="block px-4 md:px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--text-dark)' }}>{c.name}</span>
                      {c.unread && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />}
                    </div>
                    <span className="text-[11px] shrink-0 ml-2" style={{ color: 'var(--text-dark-secondary)' }}>{c.time}</span>
                  </div>
                  <p className="text-[12.5px] leading-relaxed line-clamp-2 mb-1.5" style={{ color: 'var(--text-dark-secondary)' }}>{c.msg}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="muted">{c.ch}</Badge>
                    <span className="text-[11px] truncate" style={{ color: 'var(--text-dark-secondary)' }}>via {c.agent}</span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card padding={false} className="animate-fade-in opacity-0 stagger-6" style={{ animationFillMode: 'forwards' }}>
            <div className="p-4 md:p-5 pb-3">
              <h3 className="text-[14px] md:text-[15px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>
                Recent Activity
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {ACTIVITY.map((a) => (
                <div key={a.id} className="px-4 md:px-5 py-3 md:py-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${a.color}14`, color: a.color }}>
                    <a.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] md:text-[13px] font-medium" style={{ color: 'var(--text-dark)' }}>{a.text}</div>
                    <div className="text-[11px] md:text-[12px] mt-0.5" style={{ color: 'var(--text-dark-secondary)' }}>{a.name} · {a.time}</div>
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
