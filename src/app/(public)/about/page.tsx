import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Target, Heart, Zap, Shield, Users, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About — LeadsAndSaaS | AI Sales Agents for Service Businesses',
  description: 'Learn about LeadsAndSaaS — our mission to help service businesses capture more leads and book more appointments with AI-powered sales agents.',
};

const VALUES = [
  { icon: Target, title: 'Built for Service Businesses', desc: 'We\'re not a generic CRM. Every feature is designed specifically for HVAC techs, roofers, dentists, and other service pros who are too busy doing the work to answer every lead.' },
  { icon: Heart, title: 'Simple Over Complex', desc: 'Most sales platforms have hundreds of features that small businesses never touch. We build the ones that actually move the needle — and we make them work perfectly.' },
  { icon: Zap, title: 'Speed Wins Deals', desc: '78% of customers buy from the first responder. Our AI agents respond in seconds — not hours. That speed is your competitive advantage.' },
  { icon: Shield, title: 'Your Data, Your Business', desc: 'We never sell your data. Row-level security isolates every organization. Your leads, conversations, and pipeline are yours alone.' },
];

const TEAM_STATS = [
  { value: '24/7', label: 'AI availability' },
  { value: '11', label: 'Industries supported' },
  { value: '24/7', label: 'AI agent availability' },
  { value: '<5s', label: 'Average response time' },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-[36px] sm:text-[48px] font-bold tracking-tight mb-6" style={{ fontFamily: 'Satoshi' }}>
            We help service businesses stop losing leads
          </h1>
          <p className="text-[16px] sm:text-[18px] text-gray-600 max-w-2xl mx-auto leading-relaxed">
            LeadsAndSaaS was built with a simple observation: service businesses are great at their craft but terrible at sales follow-up. We fix that with AI.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-[24px] sm:text-[30px] font-bold tracking-tight mb-6" style={{ fontFamily: 'Satoshi' }}>Our story</h2>
          <div className="space-y-4 text-[16px] text-gray-600 leading-relaxed">
            <p>
              Every day, thousands of service businesses lose revenue to slow follow-up. A homeowner requests an HVAC estimate at 8pm on a Saturday. By Monday morning when someone calls back, they've already hired a competitor.
            </p>
            <p>
              We built LeadsAndSaaS to solve this problem. Our AI sales agents respond to every inquiry instantly — via SMS, email, and web chat. They qualify leads, answer common questions, and book appointments automatically.
            </p>
            <p>
              Unlike enterprise platforms that cost hundreds per month and take weeks to set up, LeadsAndSaaS is designed for small and mid-sized service businesses. Sign up, tell us your industry, and your AI agent is ready in minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-[24px] sm:text-[30px] font-bold tracking-tight mb-10 text-center" style={{ fontFamily: 'Satoshi' }}>What we believe</h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  <v.icon size={24} />
                </div>
                <h3 className="text-[16px] font-bold mb-2" style={{ fontFamily: 'Satoshi' }}>{v.title}</h3>
                <p className="text-[14px] text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {TEAM_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-[30px] sm:text-[36px] font-bold tracking-tight" style={{ color: 'var(--accent)', fontFamily: 'Satoshi' }}>{stat.value}</div>
                <div className="text-[13px] text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20" style={{ background: 'linear-gradient(145deg, #0b0e14 0%, #141928 50%, #1a1f2e 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-[28px] sm:text-[36px] font-bold tracking-tight mb-4 text-white" style={{ fontFamily: 'Satoshi' }}>
            Ready to grow your business?
          </h2>
          <p className="text-[16px] text-gray-400 mb-8">Join service businesses already growing with LeadsAndSaaS.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[16px] font-bold hover:opacity-90 transition-all" style={{ background: 'var(--accent)', color: '#0b0e14' }}>
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <a href="mailto:hello@leadsandsaas.com" className="text-[14px] font-semibold text-gray-400 hover:text-white transition-colors">
              Contact us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
