import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Industries — AI Sales Agents for Service Businesses | LeadsAndSaaS',
  description: 'LeadsAndSaaS provides AI-powered lead capture and appointment booking for HVAC, roofing, dental, med spa, plumbing, electrical, legal, real estate, auto repair, landscaping, and cleaning businesses.',
};

const INDUSTRIES = [
  { name: 'HVAC', slug: 'hvac', icon: '🔧', description: 'Capture emergency repair leads 24/7. AI agents qualify service calls, schedule estimates, and follow up on seasonal maintenance.' },
  { name: 'Roofing', slug: 'roofing', icon: '🏠', description: 'Convert storm-damage leads fast. AI agents respond to inspection requests, qualify prospects, and book estimates automatically.' },
  { name: 'Dental', slug: 'dental', icon: '🦷', description: 'Fill your appointment book. AI agents handle new patient inquiries, schedule cleanings, and send automated reminders.' },
  { name: 'Med Spa', slug: 'med-spa', icon: '💆', description: 'Book more consultations. AI agents answer treatment questions, qualify leads by interest, and schedule appointments.' },
  { name: 'Plumbing', slug: 'plumbing', icon: '🔩', description: 'Never miss an emergency call. AI agents triage urgent vs. routine requests and book service appointments instantly.' },
  { name: 'Electrical', slug: 'electrical', icon: '⚡', description: 'Respond to service requests instantly. AI agents qualify electrical work requests, estimate scope, and schedule visits.' },
  { name: 'Legal', slug: 'legal', icon: '⚖️', description: 'Capture potential client inquiries 24/7. AI agents qualify case types, gather initial details, and book consultations.' },
  { name: 'Real Estate', slug: 'real-estate', icon: '🏡', description: 'Engage every buyer and seller lead. AI agents qualify prospects, answer property questions, and schedule showings.' },
  { name: 'Auto Repair', slug: 'auto-repair', icon: '🚗', description: 'Fill your bays. AI agents handle repair inquiries, provide rough estimates, and book drop-off appointments.' },
  { name: 'Landscaping', slug: 'landscaping', icon: '🌿', description: 'Win more seasonal contracts. AI agents respond to quote requests, qualify project scope, and schedule consultations.' },
  { name: 'Cleaning', slug: 'cleaning', icon: '✨', description: 'Book more recurring clients. AI agents qualify residential and commercial cleaning leads and schedule walkthroughs.' },
];

export default function IndustriesPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-[36px] sm:text-[48px] font-bold tracking-tight mb-6" style={{ fontFamily: 'Satoshi' }}>
            AI sales agents built for your industry
          </h1>
          <p className="text-[16px] sm:text-[18px] text-gray-600 max-w-2xl mx-auto">
            Not a generic chatbot. Pre-trained AI agents that understand your customers, your services, and how to book appointments in your business.
          </p>
        </div>
      </section>

      {/* Industry Grid */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIES.map((industry) => (
              <Link
                key={industry.slug}
                href={`/industries/${industry.slug}`}
                className="group rounded-2xl p-6 border border-gray-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50 transition-all bg-white"
              >
                <span className="text-[36px] block mb-4">{industry.icon}</span>
                <h3 className="text-[18px] font-bold mb-2 group-hover:text-amber-700 transition-colors" style={{ fontFamily: 'Satoshi' }}>{industry.name}</h3>
                <p className="text-[14px] text-gray-600 leading-relaxed mb-4">{industry.description}</p>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold group-hover:gap-2.5 transition-all" style={{ color: 'var(--accent)' }}>
                  Learn more <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20" style={{ background: 'linear-gradient(145deg, #0b0e14 0%, #141928 50%, #1a1f2e 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-[28px] sm:text-[36px] font-bold tracking-tight mb-4 text-white" style={{ fontFamily: 'Satoshi' }}>
            Don't see your industry?
          </h2>
          <p className="text-[16px] text-gray-400 mb-8">LeadsAndSaaS works for any service business. Start your free trial and configure a custom AI agent.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[16px] font-bold hover:opacity-90 transition-all" style={{ background: 'var(--accent)', color: '#0b0e14' }}>
            Start Free Trial <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
