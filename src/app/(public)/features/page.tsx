import Link from 'next/link';
import type { Metadata } from 'next';
import {
  MessageSquare, Users, Calendar, Bot, ArrowRight,
  Zap, BarChart3, Shield, Globe, Clock, Smartphone,
  Mail, Code, Workflow, Database, Bell, Settings,
  CheckCircle2, Sparkles, Target, TrendingUp,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Features — AI Lead Capture, Conversations & Scheduling | LeadSaaS',
  description: 'Explore all LeadSaaS features: AI conversations, lead management, appointment booking, agent hub, pipeline tracking, and more.',
};

const FEATURE_SECTIONS = [
  {
    category: 'AI Conversations',
    icon: MessageSquare,
    headline: 'Respond to every lead instantly',
    description: 'Your AI sales agents handle inbound conversations across SMS, email, and web chat — 24/7. They qualify leads, answer questions, and book appointments without any human intervention.',
    features: [
      { icon: Smartphone, title: 'SMS Conversations', desc: 'Two-way SMS with AI-powered responses. Leads text your business number and get instant, intelligent replies.' },
      { icon: Mail, title: 'Email Automation', desc: 'AI handles email inquiries with personalized responses. Follow-up sequences run automatically.' },
      { icon: Globe, title: 'Web Chat Widget', desc: 'Drop-in chat widget for your website. Captures leads and routes them to your AI agent in real time.' },
      { icon: Clock, title: '24/7 Availability', desc: 'Never miss a lead again. AI agents respond instantly — nights, weekends, holidays.' },
    ],
  },
  {
    category: 'Lead Management',
    icon: Users,
    headline: 'Capture, track, and convert every lead',
    description: 'From first contact to closed deal, LeadSaaS tracks every lead through your pipeline. Score leads automatically, tag them by source, and never let a hot prospect slip away.',
    features: [
      { icon: Target, title: 'Lead Scoring', desc: 'AI automatically scores leads based on engagement, intent signals, and qualification data.' },
      { icon: Database, title: 'Contact Database', desc: 'Centralized lead database with full conversation history, notes, tags, and custom fields.' },
      { icon: Workflow, title: 'Pipeline Tracking', desc: 'Visual pipeline with customizable stages. Drag-and-drop leads through your sales process.' },
      { icon: TrendingUp, title: 'Conversion Analytics', desc: 'Track conversion rates by source, agent, and stage. Know what is working and what is not.' },
    ],
  },
  {
    category: 'Appointment Booking',
    icon: Calendar,
    headline: 'Book appointments on autopilot',
    description: 'AI agents check availability, suggest times, and book appointments directly into your calendar. Send automated reminders to reduce no-shows.',
    features: [
      { icon: Calendar, title: 'Smart Scheduling', desc: 'AI agents negotiate appointment times with leads and book directly into your schedule.' },
      { icon: Bell, title: 'Automated Reminders', desc: '24-hour and 1-hour reminders via SMS and email. Reduce no-shows by up to 40%.' },
      { icon: Settings, title: 'Service Types', desc: 'Configure different appointment types: consultations, estimates, service calls, follow-ups.' },
      { icon: Sparkles, title: 'Rescheduling', desc: 'Leads can reschedule via AI. No phone tag, no back-and-forth emails.' },
    ],
  },
  {
    category: 'Agent Hub',
    icon: Bot,
    headline: 'Manage your team and track performance',
    description: 'Whether you have AI agents, human sales reps, or referral partners — manage them all from one dashboard. Track who is converting and who needs coaching.',
    features: [
      { icon: Bot, title: 'AI Agent Management', desc: 'Create, configure, and monitor multiple AI agents. Each one trained for your specific industry.' },
      { icon: Users, title: 'Team Management', desc: 'Invite team members, assign roles, and control access. Everyone sees only what they need.' },
      { icon: BarChart3, title: 'Performance Dashboards', desc: 'Conversion rates, response times, appointments booked — per agent, per channel, per period.' },
      { icon: Shield, title: 'Escalation Rules', desc: 'Set triggers for when AI should hand off to a human. Keep control of high-value conversations.' },
    ],
  },
];

const ADDITIONAL_FEATURES = [
  { icon: Code, title: 'API Access', desc: 'RESTful API for custom integrations (Scale plan).' },
  { icon: Globe, title: 'White-Label Widget', desc: 'Customize the chat widget to match your brand (Scale plan).' },
  { icon: Shield, title: 'Data Security', desc: 'Row-level security, encrypted data, SOC 2 compliance.' },
  { icon: BarChart3, title: 'Advanced Reporting', desc: 'Custom reports and export capabilities (Scale plan).' },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-[36px] sm:text-[48px] font-bold tracking-tight mb-6" style={{ fontFamily: 'Satoshi' }}>
            Everything you need to convert more leads
          </h1>
          <p className="text-[16px] sm:text-[18px] text-gray-600 max-w-2xl mx-auto mb-8">
            AI-powered sales tools built specifically for service businesses. From first contact to booked appointment — one platform handles it all.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[16px] font-bold transition-all hover:opacity-90 shadow-lg shadow-amber-200/50" style={{ background: 'var(--accent)', color: '#0b0e14' }}>
            Start Free Trial <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Feature Sections */}
      {FEATURE_SECTIONS.map((section, idx) => (
        <section key={section.category} className={`py-16 sm:py-24 ${idx % 2 === 1 ? 'bg-gray-50' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-4" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                <section.icon size={16} />
                <span className="text-[13px] font-bold">{section.category}</span>
              </div>
              <h2 className="text-[28px] sm:text-[36px] font-bold tracking-tight mb-4" style={{ fontFamily: 'Satoshi' }}>
                {section.headline}
              </h2>
              <p className="text-[16px] text-gray-600 leading-relaxed">{section.description}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {section.features.map((feature) => (
                <div key={feature.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                    <feature.icon size={20} />
                  </div>
                  <h3 className="text-[15px] font-bold mb-2" style={{ fontFamily: 'Satoshi' }}>{feature.title}</h3>
                  <p className="text-[13px] text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Additional Features */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-[24px] sm:text-[30px] font-bold tracking-tight mb-8 text-center" style={{ fontFamily: 'Satoshi' }}>
            Plus even more
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {ADDITIONAL_FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  <f.icon size={16} />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold mb-1" style={{ fontFamily: 'Satoshi' }}>{f.title}</h4>
                  <p className="text-[12px] text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20" style={{ background: 'linear-gradient(145deg, #0b0e14 0%, #141928 50%, #1a1f2e 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-[28px] sm:text-[36px] font-bold tracking-tight mb-4 text-white" style={{ fontFamily: 'Satoshi' }}>
            See it in action
          </h2>
          <p className="text-[16px] text-gray-400 mb-8">Start your 7-day free trial and experience every feature firsthand.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[16px] font-bold hover:opacity-90 transition-all" style={{ background: 'var(--accent)', color: '#0b0e14' }}>
            Start Free Trial <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
