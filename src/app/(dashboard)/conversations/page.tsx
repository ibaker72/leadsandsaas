'use client';

import { useState, useRef, useEffect } from 'react';
import { TopBar } from '@/components/dashboard/sidebar';
import { Badge, Button, LEAD_STATUS_VARIANT, Avatar, Modal, FormField, FormInput, FormSelect, FormTextarea } from '@/components/ui/primitives';
import { Search, Bot, User, Send, Phone, Mail, Pause, Play, ChevronLeft, Calendar, Info, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

type Convo = {
  id: string;
  name: string;
  phone: string;
  ch: 'sms' | 'email' | 'web_chat';
  agent: string;
  msg: string;
  time: string;
  unread: boolean;
  status: string;
  score: number;
  ai: boolean;
  lead_id: string;
};

type Msg = { id: string; dir: 'in' | 'out'; type: string; body: string; time: string; actions?: string[]; queued?: boolean; status?: 'sending' | 'sent' | 'failed' };

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function ConversationsPage() {
  const [convos, setConvos] = useState<Convo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selId, setSelId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [search, setSearch] = useState('');
  const [humanMsg, setHumanMsg] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [aiPaused, setAiPaused] = useState<Record<string, boolean>>({});
  const [operatorMode, setOperatorMode] = useState(false);
  const [bookModal, setBookModal] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Booking form state
  const [bookService, setBookService] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookDuration, setBookDuration] = useState('30');
  const [bookNotes, setBookNotes] = useState('');

  const sel = convos.find((c) => c.id === selId);
  const isPaused = selId ? aiPaused[selId] ?? false : false;

  // Fetch conversations
  useEffect(() => {
    fetch('/api/conversations')
      .then(r => r.json())
      .then(data => {
        if (data.conversations && data.conversations.length > 0) {
          const mapped = data.conversations.map((c: Record<string, unknown>) => ({
            id: c.id as string,
            name: (c.lead_name as string) || 'Unknown',
            phone: (c.lead_phone as string) || '',
            ch: ((c.channel as string) || 'sms') as 'sms' | 'email' | 'web_chat',
            agent: (c.agent_name as string) || 'Unassigned',
            msg: (c.last_message as string) || 'No messages yet',
            time: c.last_message_at ? timeAgo(new Date(c.last_message_at as string)) : '',
            unread: false,
            status: (c.lead_status as string) || 'new',
            score: Number(c.lead_score) || 0,
            ai: !(c.is_human_takeover as boolean),
            lead_id: (c.lead_id as string) || '',
          }));
          setConvos(mapped);
          // Auto-select first on desktop
          if (window.innerWidth >= 768) setSelId(mapped[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selId) return;
    fetch(`/api/conversations/${selId}/messages`)
      .then(r => r.json())
      .then(data => {
        if (data.messages) {
          setMessages(data.messages.map((m: Record<string, unknown>) => ({
            id: (m.id as string),
            dir: (m.direction === 'inbound' ? 'in' : 'out') as 'in' | 'out',
            type: (m.sender_type as string) || 'system',
            body: (m.body as string) || '',
            time: new Date(m.created_at as string).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            status: (m.status as string) === 'sent' ? 'sent' as const : undefined,
          })));
        }
      })
      .catch(() => {});
  }, [selId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selId, messages.length]);

  async function retrySend(msg: Msg) {
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, status: 'sending' } : m));
    try {
      const res = await fetch('/api/conversations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: selId, message: msg.body, channel: sel?.ch }),
      });
      if (!res.ok) throw new Error('Send failed');
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, status: 'sent', queued: false } : m));
    } catch {
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, status: 'failed' } : m));
    }
  }

  async function handleSend() {
    if (!humanMsg.trim()) return;
    const msgId = String(Date.now());
    const newMsg: Msg = {
      id: msgId,
      dir: 'out',
      type: 'human',
      body: humanMsg.trim(),
      time: nowTime(),
      status: 'sending',
    };
    setMessages((prev) => [...prev, newMsg]);
    const msgBody = humanMsg.trim();
    setHumanMsg('');
    if (selId && !isPaused) {
      setAiPaused((prev) => ({ ...prev, [selId]: true }));
      setOperatorMode(true);
    }

    try {
      const res = await fetch('/api/conversations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: selId, message: msgBody, channel: sel?.ch }),
      });
      if (!res.ok) throw new Error('Send failed');
      setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, status: 'sent', queued: false } : m));
    } catch {
      setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, status: 'failed' } : m));
    }
  }

  function togglePause() {
    if (!selId) return;
    const willPause = !isPaused;
    setAiPaused((prev) => ({ ...prev, [selId]: willPause }));
    if (!willPause) setOperatorMode(false);

    fetch('/api/conversations/takeover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: selId, takeover: willPause }),
    });
  }

  function handleTakeover() {
    if (operatorMode) {
      setOperatorMode(false);
      if (selId) {
        setAiPaused((prev) => ({ ...prev, [selId]: false }));
        fetch('/api/conversations/takeover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversation_id: selId, takeover: false }),
        });
      }
    } else {
      setOperatorMode(true);
      if (selId) {
        setAiPaused((prev) => ({ ...prev, [selId]: true }));
        fetch('/api/conversations/takeover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversation_id: selId, takeover: true }),
        });
      }
    }
  }

  async function handleBookSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookDate || !bookTime) return;
    const apptMsg: Msg = {
      id: String(Date.now()),
      dir: 'out',
      type: 'system',
      body: `Appointment scheduled for ${new Date(bookDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${bookTime}${bookService ? ` — ${bookService}` : ''}`,
      time: nowTime(),
    };
    setMessages((prev) => [...prev, apptMsg]);
    setBookModal(false);

    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: bookService || 'Appointment',
        lead_id: sel?.lead_id || null,
        service_type: bookService,
        starts_at: new Date(bookDate + 'T' + bookTime).toISOString(),
        ends_at: new Date(new Date(bookDate + 'T' + bookTime).getTime() + parseInt(bookDuration) * 60000).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        conversation_id: selId,
        notes: bookNotes,
      }),
    });

    setBookSuccess(true);
    setTimeout(() => setBookSuccess(false), 3000);

    setBookService(''); setBookDate(''); setBookTime(''); setBookDuration('30'); setBookNotes('');
  }

  const filteredConvos = convos.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <TopBar title="Conversations" subtitle={`${convos.length} active`} />

      {bookSuccess && (
        <div className="fixed top-4 right-4 z-[100] px-4 py-2.5 rounded-lg text-[13px] font-medium animate-fade-in" style={{ background: 'var(--success)', color: '#fff' }}>
          Appointment booked successfully
        </div>
      )}

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
            {loading && (
              <div className="p-8 text-center">
                <div className="animate-pulse space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-16 rounded-lg" style={{ background: '#f0f2f5' }} />)}
                </div>
              </div>
            )}
            {!loading && convos.length === 0 && (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <MessageSquare size={32} style={{ color: '#e2e5eb' }} className="mx-auto mb-2" />
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-dark-secondary)' }}>No conversations yet</p>
                  <p className="text-[12px] mt-1" style={{ color: 'var(--text-dark-secondary)' }}>Conversations appear when leads start messaging.</p>
                </div>
              </div>
            )}
            {filteredConvos.map((c) => (
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
                      {aiPaused[c.id] ? (
                        <div className="flex items-center gap-1 ml-auto"><User size={11} style={{ color: 'var(--info)' }} /><span className="text-[10px] font-medium badge-inline" style={{ color: 'var(--info)' }}>You</span></div>
                      ) : c.ai ? (
                        <div className="flex items-center gap-1 ml-auto"><Bot size={11} style={{ color: 'var(--accent)' }} /><span className="text-[10px] font-medium badge-inline" style={{ color: 'var(--accent)' }}>AI</span></div>
                      ) : null}
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
                <button onClick={() => setSelId(null)} className="w-8 h-8 rounded-lg flex items-center justify-center md:hidden shrink-0" style={{ color: 'var(--text-dark)' }}><ChevronLeft size={20} /></button>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>{sel.name.split(' ').map((n) => n[0]).join('')}</div>
                <div className="min-w-0">
                  <span className="text-[13px] md:text-[13.5px] font-semibold block truncate" style={{ color: 'var(--text-dark)' }}>{sel.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] truncate" style={{ color: 'var(--text-dark-secondary)' }}>via {sel.agent}</span>
                    {operatorMode ? (
                      <span className="flex items-center gap-1 shrink-0"><span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--info)' }} /><span className="text-[10px] font-medium badge-inline" style={{ color: 'var(--info)' }}>You &bull; Operating</span></span>
                    ) : !isPaused && sel.ai ? (
                      <span className="flex items-center gap-1 shrink-0"><span className="w-1.5 h-1.5 rounded-full status-dot-active" style={{ background: 'var(--success)' }} /><span className="text-[10px] font-medium badge-inline" style={{ color: 'var(--success)' }}>AI</span></span>
                    ) : isPaused ? (
                      <span className="flex items-center gap-1 shrink-0"><Pause size={9} style={{ color: 'var(--warning)' }} /><span className="text-[10px] font-medium badge-inline" style={{ color: 'var(--warning)' }}>Paused</span></span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={togglePause}>
                  {isPaused ? <><Play size={13} /> Resume AI</> : <><Pause size={13} /> Pause AI</>}
                </Button>
                <button onClick={() => setShowDetail(!showDetail)} className="w-8 h-8 rounded-lg flex items-center justify-center lg:hidden" style={{ color: showDetail ? 'var(--accent)' : 'var(--text-dark-secondary)' }}><Info size={18} /></button>
              </div>
            </div>

            {isPaused && (
              <div className="px-4 md:px-5 py-2 flex items-center gap-2 text-[12px] font-medium" style={{ background: 'var(--warning-soft)', color: 'var(--warning)', borderBottom: '1px solid var(--warning)' }}>
                <AlertCircle size={13} />
                <span>AI paused — {operatorMode ? 'you are in control' : 'auto-replies stopped'}</span>
                <button onClick={togglePause} className="ml-auto text-[11px] font-bold hover:underline">Resume</button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare size={32} style={{ color: '#e2e5eb' }} className="mx-auto mb-2" />
                    <p className="text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>No messages yet. Start the conversation.</p>
                  </div>
                </div>
              )}
              {messages.length > 0 && (
                <div className="flex justify-center mb-4">
                  <span className="text-[11px] font-medium px-3 py-1 rounded-full badge-inline" style={{ background: '#f0f2f5', color: 'var(--text-dark-secondary)' }}>Today</span>
                </div>
              )}
              {messages.map((m) => {
                if (m.type === 'system') {
                  return (
                    <div key={m.id} className="flex justify-center my-2 animate-fade-in">
                      <span className="text-[11px] md:text-[12px] font-medium px-3 py-1.5 rounded-lg" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>{m.body}</span>
                    </div>
                  );
                }
                return (
                  <div key={m.id} className={`flex ${m.dir === 'in' ? 'justify-start' : 'justify-end'} mb-1 animate-fade-in`}>
                    <div className={`max-w-[85%] md:max-w-[70%] ${m.dir === 'out' ? 'flex flex-col items-end' : ''}`}>
                      <div className="px-3.5 py-2.5 rounded-2xl" style={{
                        background: m.dir === 'in' ? '#f0f2f5' : m.type === 'human' || m.type === 'human_agent' ? 'var(--info)' : 'var(--bg-primary)',
                        color: m.dir === 'in' ? 'var(--text-dark)' : '#fff',
                        borderBottomLeftRadius: m.dir === 'in' ? '6px' : undefined,
                        borderBottomRightRadius: m.dir === 'out' ? '6px' : undefined,
                      }}>
                        <p className="text-[13px] md:text-[13.5px] leading-relaxed">{m.body}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1 px-1">
                        <span className="text-[10px] md:text-[10.5px]" style={{ color: 'var(--text-dark-secondary)' }}>{m.time}</span>
                        {m.dir === 'out' && (m.type === 'ai' || m.type === 'ai_agent') && <span className="flex items-center gap-0.5 text-[10px] badge-inline" style={{ color: 'var(--accent)' }}><Bot size={10} /> AI</span>}
                        {m.dir === 'out' && (m.type === 'human' || m.type === 'human_agent') && <span className="flex items-center gap-0.5 text-[10px] badge-inline" style={{ color: 'var(--info)' }}><User size={10} /> You</span>}
                        {m.status === 'sending' && <span className="text-[9px] italic" style={{ color: 'var(--text-dark-secondary)' }}>Sending...</span>}
                        {m.status === 'sent' && <span className="text-[9px] font-medium" style={{ color: 'var(--success)' }}>&#10003; Sent</span>}
                        {m.status === 'failed' && <button onClick={() => retrySend(m)} className="text-[9px] font-medium cursor-pointer hover:underline" style={{ color: 'var(--danger)', background: 'none', border: 'none', padding: 0 }}>Failed — tap to retry</button>}
                        {m.queued && !m.status && <span className="text-[9px] italic" style={{ color: 'var(--text-dark-secondary)' }}>Queued — connect channels to deliver</span>}
                      </div>
                      {m.dir === 'out' && m.actions && (
                        <div className="flex flex-wrap gap-1 mt-1.5 px-1">
                          {m.actions.map((a, i) => (
                            <span key={i} className="text-[9px] md:text-[10px] px-2 py-0.5 rounded-md font-medium badge-inline flex items-center gap-1" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid rgba(245,158,11,0.15)' }}><Sparkles size={8} />{a}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <div className="px-3 md:px-5 py-3" style={{ borderTop: '1px solid #e8eaef' }}>
              <div className="flex items-center gap-2 md:gap-3">
                <input type="text" placeholder={operatorMode ? 'Type your message...' : 'Take over and type...'} value={humanMsg} onChange={(e) => setHumanMsg(e.target.value)}
                  className="flex-1 px-4 py-2.5 md:py-3 rounded-xl text-[13.5px]"
                  style={{ background: '#f0f2f5', color: 'var(--text-dark)', border: `2px solid ${operatorMode ? 'var(--info)' : 'transparent'}`, outline: 'none' }}
                  onFocus={(e) => { if (!operatorMode) e.target.style.borderColor = 'var(--accent)'; }}
                  onBlur={(e) => { if (!operatorMode) e.target.style.borderColor = 'transparent'; }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                />
                <button onClick={handleSend} className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                  style={{ background: humanMsg ? (operatorMode ? 'var(--info)' : 'var(--accent)') : '#e2e5eb', color: humanMsg ? '#fff' : 'var(--text-dark-secondary)' }}><Send size={16} /></button>
              </div>
              <p className="text-[10px] md:text-[11px] mt-2 px-1 hidden sm:block" style={{ color: 'var(--text-dark-secondary)' }}>
                {operatorMode ? 'You are operating this conversation. Messages will be queued until channels are connected.' : 'Sending pauses the AI and transfers control to you.'}
              </p>
            </div>
          </div>
        )}

        {!sel && !loading && (
          <div className="hidden md:flex flex-1 items-center justify-center bg-white">
            <div className="text-center">
              <MessageSquare size={40} style={{ color: '#e2e5eb' }} className="mx-auto mb-3" />
              <p className="text-[14px] font-medium" style={{ color: 'var(--text-dark-secondary)' }}>
                {convos.length === 0 ? 'No conversations yet' : 'Select a conversation'}
              </p>
              {convos.length === 0 && (
                <p className="text-[12px] mt-1" style={{ color: 'var(--text-dark-secondary)' }}>
                  Conversations will appear when leads start messaging.
                </p>
              )}
            </div>
          </div>
        )}

        {sel && (
          <div className={`${showDetail ? 'fixed inset-0 z-50 bg-white lg:static lg:z-auto' : 'hidden'} lg:block w-full lg:w-[260px] xl:w-[280px] shrink-0 border-l overflow-y-auto`} style={{ borderColor: '#e8eaef', background: '#fafbfc' }}>
            <div className="p-5">
              <button onClick={() => setShowDetail(false)} className="mb-4 text-[13px] font-medium flex items-center gap-1.5 lg:hidden" style={{ color: 'var(--text-dark-secondary)' }}><ChevronLeft size={16} /> Back</button>
              <div className="text-center mb-5">
                <Avatar name={sel.name} size="lg" />
                <h4 className="text-[15px] font-bold mt-3" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>{sel.name}</h4>
                <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--text-dark-secondary)' }}>{sel.phone}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-lg p-3 text-center" style={{ background: '#f0f2f5' }}>
                  <div className="text-[18px] font-bold" style={{ color: sel.score >= 70 ? 'var(--success)' : sel.score >= 40 ? 'var(--accent)' : 'var(--danger)', fontFamily: 'Satoshi' }}>{sel.score}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-dark-secondary)' }}>Score</div>
                  <div className="w-full h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: '#e2e5eb' }}><div className="h-full rounded-full transition-all" style={{ width: `${sel.score}%`, background: sel.score >= 70 ? 'var(--success)' : sel.score >= 40 ? 'var(--accent)' : 'var(--danger)' }} /></div>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: '#f0f2f5' }}>
                  <div className="text-[18px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>{messages.length}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-dark-secondary)' }}>Messages</div>
                </div>
              </div>
              <h5 className="text-[11px] md:text-[12px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-dark-secondary)' }}>Lead Info</h5>
              <div className="space-y-2.5 mb-6">
                {[
                  { l: 'Status', v: sel.status },
                  { l: 'Channel', v: sel.ch.toUpperCase() },
                  { l: 'Agent', v: sel.agent },
                  { l: 'Phone', v: sel.phone || 'N/A' },
                ].map(({ l, v }) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-[12px]" style={{ color: 'var(--text-dark-secondary)' }}>{l}</span>
                    <span className="text-[12px] font-medium" style={{ color: v === 'N/A' ? 'var(--text-dark-secondary)' : 'var(--text-dark)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Button variant="primary" size="sm" className="w-full" onClick={() => setBookModal(true)}><Calendar size={14} /> Book Appointment</Button>
                <Button variant={operatorMode ? 'danger' : 'secondary'} size="sm" className="w-full" onClick={handleTakeover}>
                  {operatorMode ? <><Bot size={14} /> Return to AI</> : <><User size={14} /> Take Over</>}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal open={bookModal} onClose={() => setBookModal(false)} title="Book Appointment">
        <form onSubmit={handleBookSubmit} className="space-y-4">
          <FormField label="Client"><FormInput value={sel?.name || ''} disabled /></FormField>
          <FormField label="Service Type"><FormInput placeholder="e.g. AC Repair, Consultation" value={bookService} onChange={(e) => setBookService(e.target.value)} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date" required><FormInput type="date" value={bookDate} onChange={(e) => setBookDate(e.target.value)} required /></FormField>
            <FormField label="Time" required><FormInput type="time" value={bookTime} onChange={(e) => setBookTime(e.target.value)} required /></FormField>
          </div>
          <FormField label="Duration">
            <FormSelect value={bookDuration} onChange={(e) => setBookDuration(e.target.value)}>
              <option value="15">15 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">1 hour</option><option value="90">1.5 hours</option>
            </FormSelect>
          </FormField>
          <FormField label="Notes"><FormTextarea placeholder="Any notes for this appointment..." rows={2} value={bookNotes} onChange={(e) => setBookNotes(e.target.value)} /></FormField>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="secondary" size="md" className="flex-1" type="button" onClick={() => setBookModal(false)}>Cancel</Button>
            <Button variant="primary" size="md" className="flex-1" type="submit">Schedule</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
