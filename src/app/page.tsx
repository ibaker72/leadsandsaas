import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Zap, MessageSquare, Users, Calendar, Bot, ArrowRight,
  CheckCircle2, BarChart3, Shield, Clock,
} from 'lucide-react';
import { PLAN_CONFIGS } from '@/lib/billing/pricing-config';

export const metadata: Metadata = {
  title: 'LeadsAndSaaS — AI Sales Agents for Service Businesses',
  description: 'Capture more leads, respond instantly with AI, and book more appointments. Built for HVAC, roofing, dental, and service businesses.',
  openGraph: {
    title: 'LeadsAndSaaS — AI Sales Agents for Service Businesses',
    description: 'Capture more leads, respond instantly with AI, and book more appointments. Built for HVAC, roofing, dental, and service businesses.',
    type: 'website',
    url: 'https://leadsandsaas.com',
  },
  twitter: { card: 'summary_large_image' },
};

const INDUSTRIES = [
  { name: 'HVAC', slug: 'hvac', icon: '🔧' },
  { name: 'Roofing', slug: 'roofing', icon: '🏠' },
  { name: 'Dental', slug: 'dental', icon: '🦷' },
  { name: 'Med Spa', slug: 'med-spa', icon: '💆' },
  { name: 'Plumbing', slug: 'plumbing', icon: '🔩' },
  { name: 'Electrical', slug: 'electrical', icon: '⚡' },
  { name: 'Legal', slug: 'legal', icon: '⚖️' },
  { name: 'Real Estate', slug: 'real-estate', icon: '🏡' },
  { name: 'Auto Repair', slug: 'auto-repair', icon: '🚗' },
  { name: 'Landscaping', slug: 'landscaping', icon: '🌿' },
  { name: 'Cleaning', slug: 'cleaning', icon: '✨' },
];

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'AI Conversations',
    description: '24/7 automated lead engagement via SMS, email, and web chat. Your AI agent responds instantly — even at 2am.',
  },
  {
    icon: Users,
    title: 'Lead Management',
    description: 'Capture, track, score, and distribute leads across your team. Never let a hot lead slip through the cracks.',
  },
  {
    icon: Calendar,
    title: 'Appointment Booking',
    description: 'Automated scheduling tied directly into your pipeline. AI agents book appointments while you focus on the work.',
  },
  {
    icon: Bot,
    title: 'Agent Hub',
    description: 'Manage your sales team and referral partners. Track performance, conversions, and revenue per agent.',
  },
];

const STEPS = [
  { number: '01', title: 'Sign up and connect your business', description: 'Create your account in 60 seconds. Tell us your industry and we configure your AI agent automatically.' },
  { number: '02', title: 'AI agents start responding instantly', description: 'Your AI sales agent handles inbound leads via SMS, email, and web chat — qualifying and booking in real time.' },
  { number: '03', title: 'Track everything in your dashboard', description: 'Leads, conversations, appointments, revenue — all in one place. See exactly how your sales pipeline is performing.' },
];

const VALUE_PROPS = [
  { icon: Clock, title: 'Stop paying for missed leads', desc: 'The average service business loses thousands per year to slow follow-up. AI agents respond in seconds, not hours.' },
  { icon: BarChart3, title: 'Replace 3+ tools with one platform', desc: 'CRM + AI chat + scheduling + pipeline in a single dashboard. No more juggling subscriptions.' },
  { icon: Zap, title: 'No setup headaches', desc: 'Tell us your industry, we configure everything. Your AI agent is live in under 5 minutes.' },
];

const STATS = [
  { value: '24/7', label: 'AI Response' },
  { value: '< 5s', label: 'Reply Time' },
  { value: '11', label: 'Industries Supported' },
  { value: '5 min', label: 'Setup Time' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                <Zap size={20} color="#0b0e14" strokeWidth={2.5} />
              </div>
              <span className="text-[18px] font-bold tracking-tight" style={{ fontFamily: 'Satoshi' }}>LeadsAndSaaS</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
              <Link href="/pricing" className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
              <Link href="/industries" className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors">Industries</Link>
              <Link href="/about" className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors">About</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:inline-flex text-[14px] font-semibold text-gray-700 hover:text-gray-900 transition-colors px-4 py-2">
                Sign In
              </Link>
              <Link href="/signup" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all hover:opacity-90" style={{ background: 'var(--accent)', color: '#0b0e14' }}>
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 to-white" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16 sm:pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 mb-8">
              <Zap size={13} className="text-amber-600" />
              <span className="text-[12px] font-bold uppercase tracking-wider text-amber-700">AI-powered sales for service businesses</span>
            </div>
            <h1 className="text-[36px] sm:text-[52px] lg:text-[64px] font-bold leading-[1.08] tracking-tight mb-6" style={{ fontFamily: 'Satoshi' }}>
              Your AI sales agent that works{' '}
              <span className="relative">
                <span className="relative z-10" style={{ color: 'var(--accent)' }}>24/7</span>
              </span>
            </h1>
            <p className="text-[16px] sm:text-[18px] lg:text-[20px] leading-relaxed text-gray-600 max-w-2xl mx-auto mb-10">
              More leads captured, more appointments booked, less manual follow-up.
              AI agents that respond instantly via SMS, email, and web chat — so you can focus on the actual work.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[16px] font-bold transition-all hover:opacity-90 shadow-lg shadow-amber-200/50" style={{ background: 'var(--accent)', color: '#0b0e14' }}>
                Start Free Trial <ArrowRight size={18} />
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[16px] font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                See Pricing
              </Link>
            </div>
            <p className="text-[13px] text-gray-500 mt-5">7-day free trial · No credit card required · Cancel anytime</p>
          </div>

          {/* Hero Visual — Dashboard Preview */}
          <div className="mt-16 sm:mt-20 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-gray-200/80 shadow-2xl shadow-gray-200/60 overflow-hidden bg-white">
              <div className="h-8 bg-gray-100 flex items-center px-4 gap-2 border-b border-gray-200">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-3 text-[11px] text-gray-400 font-medium">leadsandsaas.com/overview</span>
              </div>
              <div className="p-6 sm:p-8 bg-gradient-to-b from-gray-50 to-white">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Leads', value: '1,247', change: '+12%', color: '#3b82f6' },
                    { label: 'Active Convos', value: '38', change: '+8%', color: '#f59e0b' },
                    { label: 'Appts Today', value: '12', change: '+23%', color: '#10b981' },
                    { label: 'Conv. Rate', value: '34%', change: '+5%', color: '#a855f7' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="h-[3px] rounded-full mb-3" style={{ background: stat.color, width: '40px' }} />
                      <div className="text-[24px] font-bold tracking-tight" style={{ fontFamily: 'Satoshi' }}>{stat.value}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[12px] text-gray-500">{stat.label}</span>
                        <span className="text-[11px] font-semibold text-green-600">{stat.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">The Problem</span>
            </div>
            <h2 className="text-[28px] sm:text-[40px] font-bold tracking-tight mb-5" style={{ fontFamily: 'Satoshi' }}>
              Stop losing leads to slow follow-up
            </h2>
            <p className="text-[16px] sm:text-[18px] text-gray-600 leading-relaxed">
              78% of customers buy from the first business that responds. When leads come in at 9pm on a Saturday,
              who&apos;s answering? LeadsAndSaaS AI agents respond instantly — qualifying leads, answering questions,
              and booking appointments while you focus on running your business.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { icon: Clock, title: 'Instant Response', desc: 'AI agents respond in seconds, not hours. Day or night, weekend or holiday.' },
              { icon: BarChart3, title: 'Never Miss a Lead', desc: 'Every inquiry gets a response. Every lead gets tracked. Nothing falls through the cracks.' },
              { icon: Shield, title: 'Built for Your Industry', desc: 'Pre-trained for HVAC, roofing, dental, and 8+ service verticals. Speaks your customers\' language.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 border border-gray-200/80 hover:border-gray-300 hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  <item.icon size={22} />
                </div>
                <h3 className="text-[16px] font-bold mb-2" style={{ fontFamily: 'Satoshi' }}>{item.title}</h3>
                <p className="text-[14px] text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Platform</span>
            </div>
            <h2 className="text-[28px] sm:text-[40px] font-bold tracking-tight mb-4" style={{ fontFamily: 'Satoshi' }}>
              Everything you need to convert leads
            </h2>
            <p className="text-[16px] sm:text-[18px] text-gray-600 max-w-2xl mx-auto leading-relaxed">
              From first contact to booked appointment — one platform handles it all.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="group rounded-2xl p-6 border border-gray-200/80 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50/50 transition-all bg-white">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  <feature.icon size={22} />
                </div>
                <h3 className="text-[16px] font-bold mb-2" style={{ fontFamily: 'Satoshi' }}>{feature.title}</h3>
                <p className="text-[14px] text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/features" className="inline-flex items-center gap-2 text-[14px] font-semibold hover:gap-3 transition-all" style={{ color: 'var(--accent)' }}>
              See all features <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">How It Works</span>
            </div>
            <h2 className="text-[28px] sm:text-[40px] font-bold tracking-tight mb-4" style={{ fontFamily: 'Satoshi' }}>
              Up and running in minutes
            </h2>
            <p className="text-[16px] sm:text-[18px] text-gray-600 max-w-lg mx-auto leading-relaxed">Three steps to start converting more leads.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Horizontal connector line spanning all three steps (desktop only) */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.5) 10%, rgba(251,191,36,0.4) 50%, rgba(251,191,36,0.5) 90%, transparent 100%)' }} />
            {STEPS.map((step) => (
              <div key={step.number} className="relative">
                {/* Step number dot accent — sits on the connector line */}
                <div className="hidden md:block absolute top-[29px] -left-1 w-[6px] h-[6px] rounded-full" style={{ background: 'var(--accent)', opacity: 0.5 }} />
                <div className="text-[48px] font-bold mb-4 leading-none" style={{ color: 'var(--accent)', opacity: 0.25, fontFamily: 'Satoshi' }}>{step.number}</div>
                <h3 className="text-[18px] font-bold mb-2" style={{ fontFamily: 'Satoshi' }}>{step.title}</h3>
                <p className="text-[14px] text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Industries</span>
            </div>
            <h2 className="text-[28px] sm:text-[40px] font-bold tracking-tight mb-4" style={{ fontFamily: 'Satoshi' }}>
              Built for service businesses
            </h2>
            <p className="text-[16px] sm:text-[18px] text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Pre-configured AI agents for your industry. No generic chatbots — real sales conversations.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {INDUSTRIES.map((industry) => (
              <Link
                key={industry.slug}
                href={`/industries/${industry.slug}`}
                className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200/80 bg-white hover:border-amber-200 hover:bg-amber-50/30 hover:shadow-sm transition-all"
              >
                <span className="text-[22px]">{industry.icon}</span>
                <span className="text-[14px] font-semibold text-gray-700 group-hover:text-gray-900">{industry.name}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/industries" className="inline-flex items-center gap-2 text-[14px] font-semibold hover:gap-3 transition-all" style={{ color: 'var(--accent)' }}>
              View all industries <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof — Stats + Value Props */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto mb-20">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-[32px] sm:text-[40px] font-bold tracking-tight" style={{ color: 'var(--accent)', fontFamily: 'Satoshi' }}>{stat.value}</div>
                <div className="text-[13px] sm:text-[14px] text-gray-500 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Value Props */}
          <div className="text-center mb-12">
            <h3 className="text-[24px] sm:text-[32px] font-bold tracking-tight" style={{ fontFamily: 'Satoshi' }}>
              Why businesses switch to LeadsAndSaaS
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {VALUE_PROPS.map((vp) => (
              <div key={vp.title} className="bg-white rounded-2xl p-6 border border-gray-200/80 hover:border-gray-300 hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  <vp.icon size={22} />
                </div>
                <h4 className="text-[16px] font-bold mb-2" style={{ fontFamily: 'Satoshi' }}>{vp.title}</h4>
                <p className="text-[14px] text-gray-600 leading-relaxed">{vp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pricing</span>
            </div>
            <h2 className="text-[28px] sm:text-[40px] font-bold tracking-tight mb-4" style={{ fontFamily: 'Satoshi' }}>
              Simple, transparent pricing
            </h2>
            <p className="text-[16px] sm:text-[18px] text-gray-600 leading-relaxed">Plans that grow with your business. Start free, upgrade anytime.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {PLAN_CONFIGS.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-6 border bg-white relative transition-all duration-200 hover:-translate-y-0.5 ${plan.popular ? 'border-amber-300 shadow-lg shadow-amber-100/50 ring-1 ring-amber-200' : 'border-gray-200/80 hover:border-gray-300 hover:shadow-md'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide" style={{ background: 'var(--accent)', color: '#0b0e14' }}>
                    Most Popular
                  </div>
                )}
                <h3 className="text-[18px] font-bold mb-1" style={{ fontFamily: 'Satoshi' }}>{plan.name}</h3>
                <p className="text-[13px] text-gray-500 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-[36px] font-bold tracking-tight" style={{ fontFamily: 'Satoshi' }}>${plan.monthlyPrice}</span>
                  <span className="text-[14px] text-gray-500">/mo</span>
                </div>
                <Link href="/signup" className={`w-full inline-flex items-center justify-center py-3 rounded-xl text-[14px] font-bold transition-all ${plan.popular ? 'hover:opacity-90 shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} style={plan.popular ? { background: 'var(--accent)', color: '#0b0e14' } : undefined}>
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/pricing" className="inline-flex items-center gap-2 text-[14px] font-semibold hover:gap-3 transition-all" style={{ color: 'var(--accent)' }}>
              See full pricing comparison <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28" style={{ background: 'linear-gradient(145deg, #0b0e14 0%, #141928 50%, #1a1f2e 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-[28px] sm:text-[44px] font-bold tracking-tight mb-5 text-white" style={{ fontFamily: 'Satoshi' }}>
            Ready to stop losing leads?
          </h2>
          <p className="text-[16px] sm:text-[18px] text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
            Start your 7-day free trial — no credit card required. Set up in minutes, start converting today.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[16px] font-bold transition-all hover:opacity-90 shadow-lg shadow-amber-500/20" style={{ background: 'var(--accent)', color: '#0b0e14' }}>
            Start Free Trial <ArrowRight size={18} />
          </Link>
          <p className="text-[13px] text-gray-500 mt-5">Join service businesses already growing with LeadsAndSaaS</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                  <Zap size={16} color="#0b0e14" strokeWidth={2.5} />
                </div>
                <span className="text-[16px] font-bold tracking-tight" style={{ fontFamily: 'Satoshi' }}>LeadsAndSaaS</span>
              </Link>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-4">AI sales agents for service businesses. Capture leads, automate conversations, book appointments.</p>
              <a href="mailto:hello@leadsandsaas.com" className="text-[13px] font-medium" style={{ color: 'var(--accent)' }}>hello@leadsandsaas.com</a>
            </div>
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/features" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link></li>
                <li><Link href="/industries" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors">Industries</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors">About</Link></li>
                <li><Link href="/login" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link></li>
                <li><Link href="/signup" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors">Start Free Trial</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/terms" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-8 text-center">
            <p className="text-[13px] text-gray-400">&copy; {new Date().getFullYear()} LeadsAndSaaS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
