'use client';

import { useState, useRef, useEffect } from 'react';
import { TopBar } from '@/components/dashboard/sidebar';
import { Badge, Button, LEAD_STATUS_VARIANT, Avatar, LiveIndicator, Modal, ComingSoonContent } from '@/components/ui/primitives';
import { Search, Bot, User, Send, Phone, Mail, Pause, Play, ChevronLeft, Calendar, Info, Sparkles, MessageSquare } from 'lucide-react';

const CONVOS = [
  { id: '1', name: 'Sarah Mitchell', phone: '+1 (555) 234-5678', ch: 'sms' as const, agent: 'HVAC Sales Pro', msg: 'Yes, I need my AC looked at ASAP.', time: '2m', unread: true, status: 'contacted', score: 72, ai: true },
  { id: '2', name: 'Marcus Johnson', phone: '+1 (555) 345-6789', ch: 'email' as const, agent: 'Roofing Lead Closer', msg: 'Tuesday at 10am works for me.', time: '8m', unread: false, status: 'qualified', score: 88, ai: true },
  { id: '3', name: 'David Chen', phone: '+1 (555) 456-7890', ch: 'sms' as const, agent: 'Med Spa Concierge', msg: 'How much does a hydrafacial cost?', time: '15m', unread: true, status: 'new', score: 45, ai: true },
  { id: '4', name: 'Lisa Rodriguez', phone: '+1 (555) 567-8901', ch: 'sms' as const, agent: 'HVAC Sales Pro', msg: 'What makes you different?', time: '22m', unread: false, status: 'nurturing', score: 55, ai: false },
];

const MSGS = [
  { id: '1', dir: 'in' as const, type: 'lead', body: "Hi, my AC isn't cooling at all and it's 95 degrees. Can someone come look at it?", time: '10:42 AM' },
  { id: '2', dir: 'out' as const, type: 'ai', body: "Hi Sarah! So sorry about your AC issues in this heat. We can help. What type of system do you have — central air, mini-split, or window unit?", time: '10:42 AM', actions: ['score_lead: 65'] },
  { id: '3', dir: 'in' as const, type: 'lead', body: "It's central air. House is about 12 years old.", time: '10:44 AM' },
  { id: '4', dir: 'out' as const, type: 'ai', body: "Got it — 12-year-old central AC. Could be refrigerant, capacitor, or compressor. We carry most parts and usually fix same-day. We have slots at 2 PM today or 9 AM tomorrow — which works?", time: '10:44 AM', actions: ['update_pipeline → Qualified', 'score_lead: 72'] },
  { id: '5', dir: 'in' as const, type: 'lead', body: '2pm today works!! What does the service call cost?', time: '10:45 AM' },
];

export default function ConversationsPage() {
  const [selId, setSelId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [search, setSearch] = useState('');
  const [humanMsg, setHumanMsg] = useState('');
  const [modal, setModal] = useState<'book' | 'takeover' | 'pause' | 'sent' | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const sel = CONVOS.find((c) => c.id === selId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selId]);

  useEffect(() => {
    if (window.innerWidth >= 768 && !selId) setSelId(CONVOS[0].id);
  }, []);

  function handleSend() {
    if (!humanMsg.trim()) return;
    setHumanMsg('');
    setModal('sent');
  }

  return (
    <>
      <TopBar title="Conversations" subtitle={`${CONVOS.length} active`} />

      <div className="flex-1 flex overflow-hidden relative" style={{ height: 'calc(100vh - 56px)' }}>
        {/* LEFT: Conversation list */}
        <div
          className={`w-full md:w-[320px] lg:w-[340px] shrink-0 flex flex-col border-r overflow-hidden ${selId ? 'hidden md:flex' : 'flex'}`}
          style={{ borderColor: '#e8eaef' }}
        >
          <div className="p-3" style={{ borderBottom: '1px solid #e8eaef' }}>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dark-secondary)' }} />
              <input type="text" placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px]"
                style={{ background: '#f0f2f5', color: 'var(--text-dark)', border: 'none', outline: 'none' }} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {CONVOS.map((c) => (
              <button key={c.id} onClick={() => setSelId(c.id)}
                className="w-full text-left px-4 py-3.5 transition-all relative row-hover-accent"
                style={{ background: c.id === selId ? '#f0f2f5' : 'transparent', borderBottom: '1px solid #f0f2f5' }}>
                {c.id === selId && <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full hidden md:block" style={{ background: 'var(--accent)' }} />}
                <div className="flex items-start gap-3">
                  <Avatar name={c.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-semibold" style={{ color: 'var(--text-dark)' }}>{c.name}</span>
                        {c.unread && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />}
                      </div>
                      <span className="text-[10.5px] shrink-0 ml-2 tabular-nums" style={{ color: 'var(--text-dark-secondary)' }}>{c.time}</span>
                    </div>
                    <p className="text-[12.5px] line-clamp-1 mb-1.5" style={{ color: 'var(--text-dark-secondary)' }}>{c.msg}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={LEAD_STATUS_VARIANT[c.status] || 'muted'}>{c.status}</Badge>
                      {c.ch === 'sms' ? <Phone size={10} style={{ color: 'var(--text-dark-secondary)' }} /> : <Mail size={10} style={{ color: 'var(--text-dark-secondary)' }} />}
                      {c.ai && (
                        <div className="flex items-center gap-1 ml-auto">
                          <Bot size={11} style={{ color: 'var(--accent)' }} />
                          <span className="text-[10px] font-medium badge-inline" style={{ color: 'var(--accent)' }}>AI</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: Chat area */}
        {sel && (
          <div className={`flex-1 flex flex-col bg-white min-w-0 ${selId ? 'flex' : 'hidden md:flex'}`}>
            <div className="h-14 px-3 md:px-5 flex items-center justify-between shrink-0 gap-2" style={{ borderBottom: '1px solid #e8eaef' }}>
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <button onClick={() => setSelId(null)} className="w-8 h-8 rounded-lg flex items-center justify-center md:hidden shrink-0" style={{ color: 'var(--text-dark)' }}>
                  <ChevronLeft size={20} />
                </button>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  {sel.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <span className="text-[13px] md:text-[13.5px] font-semibold block truncate" style={{ color: 'var(--text-dark)' }}>{sel.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] truncate" style={{ color: 'var(--text-dark-secondary)' }}>via {sel.agent}</span>
                    {sel.ai && (
                      <span className="flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full status-dot-active" style={{ background: 'var(--success)' }} />
                        <span className="text-[10px] font-medium badge-inline" style={{ color: 'var(--success)' }}>AI</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => setModal('pause')}>
                  {sel.ai ? <><Pause size={13} /> Pause AI</> : <><Play size={13} /> Resume</>}
                </Button>
                <button onClick={() => setShowDetail(!showDetail)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center lg:hidden"
                  style={{ color: showDetail ? 'var(--accent)' : 'var(--text-dark-secondary)' }}>
                  <Info size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1">
              <div className="flex justify-center mb-4">
                <span className="text-[11px] font-medium px-3 py-1 rounded-full badge-inline" style={{ background: '#f0f2f5', color: 'var(--text-dark-secondary)' }}>Today</span>
              </div>
              {MSGS.map((m) => (
                <div key={m.id} className={`flex ${m.dir === 'in' ? 'justify-start' : 'justify-end'} mb-1 animate-fade-in`}>
                  <div className={`max-w-[85%] md:max-w-[70%] ${m.dir === 'out' ? 'flex flex-col items-end' : ''}`}>
                    <div className="px-3.5 py-2.5 rounded-2xl"
                      style={{
                        background: m.dir === 'in' ? '#f0f2f5' : 'var(--bg-primary)',
                        color: m.dir === 'in' ? 'var(--text-dark)' : 'var(--text-primary)',
                        borderBottomLeftRadius: m.dir === 'in' ? '6px' : undefined,
                        borderBottomRightRadius: m.dir === 'out' ? '6px' : undefined,
                      }}>
                      <p className="text-[13px] md:text-[13.5px] leading-relaxed">{m.body}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[10px] md:text-[10.5px]" style={{ color: 'var(--text-dark-secondary)' }}>{m.time}</span>
                      {m.dir === 'out' && m.type === 'ai' && (
                        <span className="flex items-center gap-0.5 text-[10px] badge-inline" style={{ color: 'var(--accent)' }}>
                          <Bot size={10} /> AI
                        </span>
                      )}
                    </div>
                    {m.dir === 'out' && (m as any).actions && (
                      <div className="flex flex-wrap gap-1 mt-1.5 px-1">
                        {((m as any).actions as string[]).map((a, i) => (
                          <span key={i} className="text-[9px] md:text-[10px] px-2 py-0.5 rounded-md font-medium badge-inline flex items-center gap-1" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid rgba(245,158,11,0.15)' }}>
                            <Sparkles size={8} />{a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="px-3 md:px-5 py-3" style={{ borderTop: '1px solid #e8eaef' }}>
              <div className="flex items-center gap-2 md:gap-3">
                <input type="text" placeholder="Take over and type..." value={humanMsg} onChange={(e) => setHumanMsg(e.target.value)}
                  className="flex-1 px-4 py-2.5 md:py-3 rounded-xl text-[13.5px]"
                  style={{ background: '#f0f2f5', color: 'var(--text-dark)', border: '2px solid transparent', outline: 'none' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'transparent')}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                />
                <button onClick={handleSend}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                  style={{ background: humanMsg ? 'var(--accent)' : '#e2e5eb', color: humanMsg ? '#0b0e14' : 'var(--text-dark-secondary)' }}>
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] md:text-[11px] mt-2 px-1 hidden sm:block" style={{ color: 'var(--text-dark-secondary)' }}>
                Sending pauses the AI and transfers control to you.
              </p>
            </div>
          </div>
        )}

        {/* Placeholder when nothing selected */}
        {!sel && (
          <div className="hidden md:flex flex-1 items-center justify-center bg-white">
            <div className="text-center">
              <MessageSquare size={40} style={{ color: '#e2e5eb' }} className="mx-auto mb-3" />
              <p className="text-[14px] font-medium" style={{ color: 'var(--text-dark-secondary)' }}>Select a conversation</p>
            </div>
          </div>
        )}

        {/* RIGHT: Lead detail panel */}
        {sel && (
          <div
            className={`${showDetail ? 'fixed inset-0 z-50 bg-white lg:static lg:z-auto' : 'hidden'} lg:block w-full lg:w-[260px] xl:w-[280px] shrink-0 border-l overflow-y-auto`}
            style={{ borderColor: '#e8eaef', background: '#fafbfc' }}>
            <div className="p-5">
              <button onClick={() => setShowDetail(false)} className="mb-4 text-[13px] font-medium flex items-center gap-1.5 lg:hidden" style={{ color: 'var(--text-dark-secondary)' }}>
                <ChevronLeft size={16} /> Back
              </button>

              <div className="text-center mb-5">
                <Avatar name={sel.name} size="lg" />
                <h4 className="text-[15px] font-bold mt-3" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>{sel.name}</h4>
                <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--text-dark-secondary)' }}>{sel.phone}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-lg p-3 text-center" style={{ background: '#f0f2f5' }}>
                  <div className="text-[18px] font-bold" style={{ color: sel.score >= 70 ? 'var(--success)' : sel.score >= 40 ? 'var(--accent)' : 'var(--danger)', fontFamily: 'Satoshi' }}>{sel.score}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-dark-secondary)' }}>Score</div>
                  <div className="w-full h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: '#e2e5eb' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${sel.score}%`, background: sel.score >= 70 ? 'var(--success)' : sel.score >= 40 ? 'var(--accent)' : 'var(--danger)' }} />
                  </div>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: '#f0f2f5' }}>
                  <div className="text-[18px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>5</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-dark-secondary)' }}>Messages</div>
                </div>
              </div>

              <h5 className="text-[11px] md:text-[12px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-dark-secondary)' }}>Qualification</h5>
              <div className="space-y-2.5 mb-6">
                {[
                  { l: 'Service', v: 'AC Repair' },
                  { l: 'Timeline', v: 'ASAP' },
                  { l: 'Property', v: 'Residential' },
                  { l: 'Budget', v: 'Not discussed' },
                ].map(({ l, v }) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-[12px]" style={{ color: 'var(--text-dark-secondary)' }}>{l}</span>
                    <span className="text-[12px] font-medium" style={{ color: v.includes('Not') ? 'var(--text-dark-secondary)' : 'var(--text-dark)' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Button variant="primary" size="sm" className="w-full" onClick={() => setModal('book')}><Calendar size={14} /> Book Appointment</Button>
                <Button variant="secondary" size="sm" className="w-full" onClick={() => setModal('takeover')}><User size={14} /> Take Over</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      <Modal open={modal === 'book'} onClose={() => setModal(null)} title="Book Appointment">
        <ComingSoonContent
          feature="Appointment Booking"
          description="Calendar integration with Google Calendar and Outlook sync is coming soon. Appointments will auto-populate from AI agent bookings."
        />
        <Button variant="primary" size="md" className="w-full mt-4" onClick={() => setModal(null)}>Got it</Button>
      </Modal>

      {/* Take Over Modal */}
      <Modal open={modal === 'takeover'} onClose={() => setModal(null)} title="Take Over Conversation">
        <ComingSoonContent
          feature="Human Takeover"
          description="Taking over a conversation pauses the AI agent and routes all messages to you directly. This requires live messaging channel integration."
        />
        <Button variant="primary" size="md" className="w-full mt-4" onClick={() => setModal(null)}>Got it</Button>
      </Modal>

      {/* Pause AI Modal */}
      <Modal open={modal === 'pause'} onClose={() => setModal(null)} title="AI Control">
        <ComingSoonContent
          feature="Pause / Resume AI"
          description="Pausing the AI agent stops auto-replies and transfers conversation control to a human agent. This requires live messaging integration."
        />
        <Button variant="primary" size="md" className="w-full mt-4" onClick={() => setModal(null)}>Got it</Button>
      </Modal>

      {/* Message Sent Modal */}
      <Modal open={modal === 'sent'} onClose={() => setModal(null)} title="Message">
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
            <Send size={20} />
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-dark-secondary)' }}>
            Message sending requires live Twilio/email integration. Your message was not delivered. Connect your channels in Settings to enable real-time messaging.
          </p>
        </div>
        <Button variant="primary" size="md" className="w-full mt-4" onClick={() => setModal(null)}>Got it</Button>
      </Modal>
    </>
  );
}
