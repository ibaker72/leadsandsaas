'use client';

import { useState, useEffect } from 'react';
import { TopBar } from '@/components/dashboard/sidebar';
import { StatCard, Card, Badge, Avatar, SectionHeader, LiveIndicator } from '@/components/ui/primitives';
import { Users, MessageSquare, Calendar, TrendingUp, Bot, ChevronRight, Zap, Phone, Activity } from 'lucide-react';
import Link from 'next/link';

const ACTIVITY_ICON_MAP: Record<string, { icon: typeof Users; color: string }> = {
  lead_created: { icon: Users, color: 'var(--info)' },
  appointment_booked: { icon: Calendar, color: 'var(--success)' },
  lead_qualified: { icon: TrendingUp, color: 'var(--accent)' },
  escalation: { icon: Phone, color: 'var(--danger)' },
  message_sent: { icon: MessageSquare, color: 'var(--info)' },
  lead_converted: { icon: Zap, color: 'var(--success)' },
};

function MiniChart({ seed }: { seed: number }) {
  const d = Array.from({ length: 14 }, (_, i) => {
    const base = seed > 0 ? 20 + ((seed * 7 + i * 13) % 60) : 0;
    return Math.max(5, base);
  });
  const mx = Math.max(...d, 1);
  return (
    <div className="flex items-end gap-[4px] h-14 md:h-20 mt-2">
      {d.map((v, i) => {
        const isRecent = i >= d.length - 3;
        const height = `${(v / mx) * 100}%`;
        return (
          <div key={i} className="flex-1 relative animate-fade-in opacity-0" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'forwards' }}>
            <div className="absolute inset-x-0 bottom-0 rounded-t-sm" style={{ height, background: isRecent ? 'var(--accent)' : '#e2e5eb', opacity: isRecent ? 1 : 0.5, minWidth: '4px' }} />
            {isRecent && (
              <div className="absolute inset-x-0 bottom-0 rounded-t-sm" style={{ height, background: 'linear-gradient(180deg, rgba(251,191,36,0.3) 0%, var(--accent) 100%)', minWidth: '4px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

type AgentPerf = { name: string; convos: number; booked: number; time: string; rate: number };
type LiveConvo = { id: string; name: string; agent: string; msg: string; time: string; unread: boolean; ch: string };
type RecentAct = { id: string; text: string; name: string; time: string; type: string };

export default function OverviewPage() {
  const [stats, setStats] = useState({ totalLeads: 0, leadsChange: 0, activeConvos: 0, apptsToday: 0, convRate: 0, pipelineValue: 0 });
  const [agents, setAgents] = useState<AgentPerf[]>([]);
  const [live, setLive] = useState<LiveConvo[]>([]);
  const [activity, setActivity] = useState<RecentAct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/overview/stats')
      .then(r => r.json())
      .then(data => {
        if (data.stats) {
          setStats({
            totalLeads: data.stats.totalLeads || 0,
            leadsChange: data.stats.leadsChange || 0,
            activeConvos: data.stats.activeConvos || 0,
            apptsToday: data.stats.apptsToday || 0,
            convRate: data.stats.convRate || 0,
            pipelineValue: data.stats.pipelineValue || 0,
          });
          setAgents(data.stats.agentPerformance || []);
          setLive(data.stats.liveConversations || []);
          setActivity(data.stats.recentActivity || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <TopBar title="Overview" subtitle="Your sales command center" />
      <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-5 md:space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          <StatCard label="Total Leads" value={loading ? '—' : stats.totalLeads.toLocaleString()} change={stats.leadsChange} icon={<Users size={18} />} accentColor="var(--info)" delay={50} />
          <StatCard label="Active Convos" value={loading ? '—' : stats.activeConvos} change={0} icon={<MessageSquare size={18} />} accentColor="var(--accent)" delay={100} />
          <StatCard label="Appts Today" value={loading ? '—' : stats.apptsToday} change={0} icon={<Calendar size={18} />} accentColor="var(--success)" delay={150} />
          <StatCard label="Conv. Rate" value={loading ? '—' : `${stats.convRate}%`} change={0} icon={<TrendingUp size={18} />} accentColor="#a855f7" delay={200} />
        </div>

        {/* Chart + Agents */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          <Card className="lg:col-span-3 animate-fade-in opacity-0 stagger-3 [animation-fill-mode:forwards]">
            <div className="flex items-center justify-between mb-2">
              <SectionHeader title="Conversation Volume" action={<span className="text-[12px] md:text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>Last 14 days</span>} />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[24px] md:text-[30px] font-bold count-up" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>
                {loading ? '—' : stats.activeConvos}
              </span>
            </div>
            <MiniChart seed={stats.totalLeads} />
          </Card>

          <Card className="lg:col-span-2 animate-fade-in opacity-0 stagger-4 [animation-fill-mode:forwards]" padding={false}>
            <div className="p-4 md:p-5 pb-3">
              <SectionHeader
                title="Agent Performance"
                action={<Link href="/agents" className="text-[12px] font-semibold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: 'var(--accent)' }}>View all <ChevronRight size={14} /></Link>}
              />
            </div>
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="px-5 py-8 text-center text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>Loading...</div>
              ) : agents.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <Bot size={24} style={{ color: '#e2e5eb' }} className="mx-auto mb-2" />
                  <p className="text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>No agents yet</p>
                </div>
              ) : agents.map((a) => (
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
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <span className="text-[11px] font-bold tabular-nums" style={{ color: 'var(--accent)' }}>{a.rate}%</span>
                    <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: '#e8eaef' }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(a.rate, 100)}%`, background: 'var(--accent)' }} />
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
              {loading ? (
                <div className="px-5 py-8 text-center text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>Loading...</div>
              ) : live.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <MessageSquare size={24} style={{ color: '#e2e5eb' }} className="mx-auto mb-2" />
                  <p className="text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>No active conversations</p>
                </div>
              ) : live.map((c) => (
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
                    <p className="text-[12.5px] leading-relaxed line-clamp-1 mb-1" style={{ color: 'var(--text-dark-secondary)' }}>{c.msg || 'Conversation active'}</p>
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
              {loading ? (
                <div className="px-5 py-8 text-center text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>Loading...</div>
              ) : activity.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <Activity size={24} style={{ color: '#e2e5eb' }} className="mx-auto mb-2" />
                  <p className="text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>No recent activity</p>
                </div>
              ) : activity.map((a, idx) => {
                const iconInfo = ACTIVITY_ICON_MAP[a.type] || { icon: Users, color: 'var(--info)' };
                const Icon = iconInfo.icon;
                return (
                  <div key={a.id} className="px-4 md:px-5 py-3 md:py-3.5 flex items-start gap-3 hover:bg-gray-50/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${iconInfo.color}14`, color: iconInfo.color }}>
                      <Icon size={14} />
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
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
