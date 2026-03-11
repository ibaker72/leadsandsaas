'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Zap, Calendar, HelpCircle, Rocket, Eye } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Message = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  time: string;
};

type QuickAction = {
  icon: React.ReactNode;
  label: string;
  response: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: <Calendar size={14} />,
    label: 'Book a demo',
    response: "Great choice! You can book a live demo with our team at any time. Head to your Overview page and click \"Book a Demo\", or reply here with your preferred day and time and we'll get it set up.",
  },
  {
    icon: <HelpCircle size={14} />,
    label: 'Ask a question',
    response: "Of course! I'm here to help. What would you like to know about LeadsAndSaaS? I can help with lead capture, messaging, appointments, pipeline setup, integrations, and more.",
  },
  {
    icon: <Rocket size={14} />,
    label: 'Start setup help',
    response: "Let's get you set up! Here's a quick checklist:\n\n1. **Agents** — Add your team members under Agents\n2. **Pipeline** — Customize your pipeline stages\n3. **Widget** — Grab your embed code from Settings\n4. **Integrations** — Connect Twilio (SMS) or Resend (email)\n\nWhich step would you like help with first?",
  },
  {
    icon: <Eye size={14} />,
    label: 'Preview lead capture',
    response: "Your lead capture widget is ready to embed! Go to **Settings → Widget / Embed** to copy your embed code. It works on any website — just paste the script tag before your closing </body> tag.\n\nYou can customize the color, position, and vertical to match your brand.",
  },
];

const GREETING = "Hi there! 👋 I'm your LeadsAndSaaS assistant. How can I help you today?";

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

let msgCounter = 0;
function nextId() {
  return `msg-${++msgCounter}-${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: nextId(), role: 'assistant', text: GREETING, time: now() },
  ]);
  const [input, setInput] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  function addUserMessage(text: string) {
    const userMsg: Message = { id: nextId(), role: 'user', text, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setShowQuickActions(false);
    return userMsg;
  }

  function addAssistantMessage(text: string) {
    // Small delay for natural feel
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text, time: now() }]);
    }, 600);
  }

  function handleQuickAction(action: QuickAction) {
    addUserMessage(action.label);
    addAssistantMessage(action.response);
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    addUserMessage(text);
    addAssistantMessage(
      "Thanks for your message! This assistant is a workflow helper — for full conversation support, check out the **Conversations** page where you can chat with leads in real time.\n\nIs there anything else I can help you with?"
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* ----------------------------------------------------------------- */}
      {/* Slide-out chat panel                                               */}
      {/* ----------------------------------------------------------------- */}
      {open && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 z-[90] md:hidden"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={() => setOpen(false)}
          />

          <div
            className="fixed z-[95] flex flex-col animate-fade-in"
            style={{
              bottom: '88px',
              right: '20px',
              width: '380px',
              maxWidth: 'calc(100vw - 40px)',
              height: '520px',
              maxHeight: 'calc(100vh - 120px)',
              borderRadius: '20px',
              background: '#fff',
              boxShadow: '0 12px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{
                background: 'linear-gradient(135deg, #0b0e14 0%, #1a1f2e 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--accent)', boxShadow: '0 0 12px var(--accent-glow)' }}
                >
                  <Zap size={16} color="#0b0e14" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi' }}>
                    LeadsAndSaaS
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages area */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              style={{ background: '#f8f9fb' }}
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap"
                    style={
                      msg.role === 'user'
                        ? {
                            background: 'var(--accent)',
                            color: '#0b0e14',
                            borderBottomRightRadius: '6px',
                            fontWeight: 500,
                          }
                        : {
                            background: '#fff',
                            color: 'var(--text-dark)',
                            border: '1px solid #e5e7eb',
                            borderBottomLeftRadius: '6px',
                          }
                    }
                  >
                    {/* Render bold markdown: **text** */}
                    {msg.text.split(/(\*\*.*?\*\*)/).map((part, i) =>
                      part.startsWith('**') && part.endsWith('**') ? (
                        <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </div>
                </div>
              ))}

              {/* Quick actions */}
              {showQuickActions && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12.5px] font-medium transition-all"
                      style={{
                        background: '#fff',
                        color: 'var(--text-dark)',
                        border: '1px solid #e5e7eb',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.background = 'var(--accent-soft)';
                        e.currentTarget.style.color = '#92400e';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.color = 'var(--text-dark)';
                      }}
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div
              className="shrink-0 px-4 py-3"
              style={{ background: '#fff', borderTop: '1px solid #e5e7eb' }}
            >
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 resize-none text-[13.5px] px-3.5 py-2.5 rounded-xl transition-all"
                  style={{
                    background: '#f8f9fb',
                    border: '1.5px solid #e5e7eb',
                    outline: 'none',
                    color: 'var(--text-dark)',
                    maxHeight: '80px',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all"
                  style={{
                    background: input.trim() ? 'var(--accent)' : '#e5e7eb',
                    color: input.trim() ? '#0b0e14' : '#9ca3af',
                    cursor: input.trim() ? 'pointer' : 'default',
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="text-[10.5px] mt-1.5 text-center" style={{ color: 'var(--text-dark-secondary)' }}>
                Powered by LeadsAndSaaS
              </p>
            </div>
          </div>
        </>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Floating trigger button                                            */}
      {/* ----------------------------------------------------------------- */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed z-[95] flex items-center justify-center transition-all duration-200"
        style={{
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '18px',
          background: open
            ? 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
            : 'linear-gradient(135deg, var(--accent) 0%, #d97706 100%)',
          boxShadow: open
            ? '0 4px 20px rgba(0,0,0,0.2)'
            : '0 4px 20px var(--accent-glow), 0 8px 32px rgba(245,158,11,0.15)',
          color: open ? '#fff' : '#0b0e14',
          cursor: 'pointer',
          border: 'none',
        }}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
}
