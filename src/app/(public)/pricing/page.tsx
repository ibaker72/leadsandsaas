'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Zap, HelpCircle } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 29,
    annualPrice: 24,
    description: 'For solo operators and single-location businesses',
    highlight: false,
    features: [
      'Up to 500 leads',
      '1 AI sales agent',
      'SMS + email + web chat',
      'Appointment scheduling',
      'Basic pipeline view',
      '1 user seat',
      'Email support',
    ],
    bestFor: 'Solo operators, single-location businesses',
  },
  {
    id: 'growth',
    name: 'Growth',
    monthlyPrice: 79,
    annualPrice: 66,
    description: 'For growing businesses with a small team',
    highlight: true,
    features: [
      'Up to 2,500 leads',
      '3 AI sales agents',
      'Everything in Starter, plus:',
      'Agent Hub (manage team/partners)',
      'Advanced pipeline with stages',
      'Conversation analytics',
      '5 user seats',
      'Priority support',
    ],
    bestFor: 'Growing businesses with a small team',
  },
  {
    id: 'scale',
    name: 'Scale',
    monthlyPrice: 149,
    annualPrice: 124,
    description: 'For agencies and multi-location businesses',
    highlight: false,
    features: [
      'Unlimited leads',
      'Unlimited AI sales agents',
      'Everything in Growth, plus:',
      'Custom AI training/prompts',
      'API access',
      'White-label widget',
      'Advanced reporting & analytics',
      'Unlimited user seats',
      'Dedicated account manager',
    ],
    bestFor: 'Agencies and multi-location businesses',
  },
];

const COMPARISON_ROWS = [
  { feature: 'Leads', starter: '500', growth: '2,500', scale: 'Unlimited' },
  { feature: 'AI Sales Agents', starter: '1', growth: '3', scale: 'Unlimited' },
  { feature: 'User Seats', starter: '1', growth: '5', scale: 'Unlimited' },
  { feature: 'SMS Conversations', starter: true, growth: true, scale: true },
  { feature: 'Email Automation', starter: true, growth: true, scale: true },
  { feature: 'Web Chat Widget', starter: true, growth: true, scale: true },
  { feature: 'Appointment Scheduling', starter: true, growth: true, scale: true },
  { feature: 'Basic Pipeline', starter: true, growth: true, scale: true },
  { feature: 'Agent Hub', starter: false, growth: true, scale: true },
  { feature: 'Advanced Pipeline', starter: false, growth: true, scale: true },
  { feature: 'Conversation Analytics', starter: false, growth: true, scale: true },
  { feature: 'Custom AI Training', starter: false, growth: false, scale: true },
  { feature: 'API Access', starter: false, growth: false, scale: true },
  { feature: 'White-Label Widget', starter: false, growth: false, scale: true },
  { feature: 'Advanced Reporting', starter: false, growth: false, scale: true },
  { feature: 'Support', starter: 'Email', growth: 'Priority', scale: 'Dedicated Manager' },
];

const FAQS = [
  {
    q: 'What happens after my trial?',
    a: 'Your 7-day trial gives you full access to Growth-tier features. When the trial ends, you choose a plan to continue. Your data is kept safe for 30 days — nothing is deleted.',
  },
  {
    q: 'Can I switch plans?',
    a: 'Yes, you can upgrade or downgrade your plan at any time from the billing page. Changes take effect immediately, and billing is prorated.',
  },
  {
    q: 'Is there a contract?',
    a: 'No long-term contracts. Monthly plans are billed month-to-month. Annual plans are billed yearly at a discounted rate (2 months free).',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. Cancel anytime from your billing page. You will retain access through the end of your current billing period.',
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-[36px] sm:text-[48px] font-bold tracking-tight mb-4" style={{ fontFamily: 'Satoshi' }}>
            Simple, transparent pricing
          </h1>
          <p className="text-[16px] sm:text-[18px] text-gray-600 max-w-xl mx-auto mb-8">
            GoHighLevel features at Pipedrive prices. Start free, upgrade when you are ready.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-gray-100 rounded-xl p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-all ${!annual ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-all ${annual ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Annual <span className="text-[12px] font-bold ml-1" style={{ color: 'var(--accent)' }}>Save 17%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="pb-16 sm:pb-24 -mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 sm:p-8 border bg-white relative ${plan.highlight ? 'border-amber-300 shadow-xl shadow-amber-100/50 ring-1 ring-amber-200 scale-[1.02]' : 'border-gray-100'}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide" style={{ background: 'var(--accent)', color: '#0b0e14' }}>
                    Most Popular
                  </div>
                )}
                <h3 className="text-[20px] font-bold mb-1" style={{ fontFamily: 'Satoshi' }}>{plan.name}</h3>
                <p className="text-[13px] text-gray-500 mb-5">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-[42px] font-bold tracking-tight" style={{ fontFamily: 'Satoshi' }}>
                    ${annual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-[14px] text-gray-500">/month</span>
                </div>
                {annual && (
                  <p className="text-[12px] text-gray-500 -mt-4 mb-6">
                    Billed annually (${plan.annualPrice * 12}/yr)
                  </p>
                )}
                <Link
                  href="/signup"
                  className={`w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-bold transition-all mb-6 ${plan.highlight ? 'hover:opacity-90 shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  style={plan.highlight ? { background: 'var(--accent)', color: '#0b0e14' } : undefined}
                >
                  Start Free Trial <ArrowRight size={16} />
                </Link>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] text-gray-600">
                      <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-[13px] text-gray-500 mt-6">
            All trials start with Growth-level access so you can experience the full product.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-[24px] sm:text-[30px] font-bold tracking-tight mb-8 text-center" style={{ fontFamily: 'Satoshi' }}>
            Compare plans
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-4 font-semibold text-gray-500 w-[40%]">Feature</th>
                    <th className="text-center p-4 font-bold text-gray-700">Starter</th>
                    <th className="text-center p-4 font-bold" style={{ color: 'var(--accent)' }}>Growth</th>
                    <th className="text-center p-4 font-bold text-gray-700">Scale</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.feature} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="p-4 font-medium text-gray-700">{row.feature}</td>
                      {(['starter', 'growth', 'scale'] as const).map((plan) => {
                        const val = row[plan];
                        return (
                          <td key={plan} className="p-4 text-center">
                            {val === true ? (
                              <CheckCircle2 size={18} className="mx-auto" style={{ color: 'var(--accent)' }} />
                            ) : val === false ? (
                              <span className="text-gray-300">—</span>
                            ) : (
                              <span className="font-semibold text-gray-700">{val}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-[24px] sm:text-[30px] font-bold tracking-tight mb-8 text-center" style={{ fontFamily: 'Satoshi' }}>
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="bg-white rounded-xl p-5 border border-gray-100">
                <h3 className="text-[15px] font-bold mb-2 flex items-start gap-2" style={{ fontFamily: 'Satoshi' }}>
                  <HelpCircle size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                  {faq.q}
                </h3>
                <p className="text-[14px] text-gray-600 leading-relaxed pl-[26px]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20" style={{ background: 'linear-gradient(145deg, #0b0e14 0%, #141928 50%, #1a1f2e 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-[28px] sm:text-[36px] font-bold tracking-tight mb-4 text-white" style={{ fontFamily: 'Satoshi' }}>
            Start converting leads today
          </h2>
          <p className="text-[16px] text-gray-400 mb-8">7-day free trial with full Growth-level access. No credit card required.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[16px] font-bold hover:opacity-90 transition-all" style={{ background: 'var(--accent)', color: '#0b0e14' }}>
            Start Free Trial <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
