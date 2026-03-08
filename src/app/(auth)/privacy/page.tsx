{/*
  IMPORTANT: This is a starter template for a Privacy Policy page.
  It should be reviewed and customized by qualified legal counsel
  before use in production. This template does not constitute legal advice.
*/}

import Link from 'next/link';
import { Zap, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(145deg, #0b0e14 0%, #141928 50%, #1a1f2e 100%)' }}>
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/login" className="flex items-center gap-2 text-[13px] font-medium hover:underline" style={{ color: 'var(--accent)' }}>
            <ArrowLeft size={14} />
            Back
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <Zap size={16} color="#0b0e14" strokeWidth={2.5} />
            </div>
            <span className="text-[18px] font-bold tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi' }}>LeadSaaS</span>
          </Link>
        </div>

        {/* Content card */}
        <div className="rounded-2xl p-6 md:p-10 animate-fade-in" style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h1 className="text-[26px] md:text-[32px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>Privacy Policy</h1>
          <p className="text-[13px] mb-8" style={{ color: 'var(--text-dark-secondary)' }}>Last updated: March 8, 2026</p>

          <div className="space-y-6 text-[14px] leading-relaxed" style={{ color: 'var(--text-dark-secondary)' }}>
            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>1. Introduction</h2>
              <p>
                LeadSaaS (&quot;we,&quot; &quot;our,&quot; or &quot;the Service&quot;) is a lead automation, messaging, scheduling, and business management platform. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our Service, including our website, dashboard, APIs, and embeddable widgets.
              </p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>2. Information We Collect</h2>
              <p className="mb-3">We collect information in several ways:</p>
              <p className="font-semibold mb-1" style={{ color: 'var(--text-dark)' }}>Account Information</p>
              <p className="mb-3">When you sign up, we collect your name, email address, company name, industry, and password. We also generate internal identifiers for your organization.</p>
              <p className="font-semibold mb-1" style={{ color: 'var(--text-dark)' }}>Lead &amp; Contact Data</p>
              <p className="mb-3">Through your use of the Service, you may submit or capture lead and contact information including names, email addresses, phone numbers, service requests, appointment details, and conversation histories. You are the data controller of this information; we process it on your behalf.</p>
              <p className="font-semibold mb-1" style={{ color: 'var(--text-dark)' }}>Conversation &amp; Messaging Data</p>
              <p className="mb-3">We store messages exchanged through our platform, including SMS, email, and web chat conversations between you, your agents (human or AI), and your leads.</p>
              <p className="font-semibold mb-1" style={{ color: 'var(--text-dark)' }}>Integration Credentials</p>
              <p className="mb-3">When you connect third-party services (e.g., Twilio, Resend), we store the configuration and credentials you provide. These are encrypted at rest and never returned in plaintext through our API.</p>
              <p className="font-semibold mb-1" style={{ color: 'var(--text-dark)' }}>Usage &amp; Analytics Data</p>
              <p>We collect information about how you interact with the Service, including pages visited, features used, and performance metrics.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>3. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Provide, maintain, and improve the Service</li>
                <li>Process lead capture submissions and route them to your team</li>
                <li>Send and receive messages on your behalf through integrated channels</li>
                <li>Schedule and manage appointments</li>
                <li>Manage your billing, subscriptions, and trial periods</li>
                <li>Send transactional emails (account confirmation, password resets)</li>
                <li>Detect and prevent abuse, fraud, and unauthorized access</li>
                <li>Provide customer support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>4. Data Sharing &amp; Third Parties</h2>
              <p className="mb-3">We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Service providers</strong> — Infrastructure (Supabase, Vercel), payment processing (Stripe), messaging (Twilio, Resend), and analytics providers that help us operate the Service</li>
                <li><strong>At your direction</strong> — When you configure integrations or webhooks, data flows to the endpoints you specify</li>
                <li><strong>Legal obligations</strong> — When required by law, regulation, or valid legal process</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>5. Data Security</h2>
              <p>
                We implement industry-standard security measures including encrypted data storage, secure API authentication, role-based access controls, and secret masking. Integration credentials are stored securely and never exposed in plaintext through our client-facing interfaces. However, no system is perfectly secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>6. Data Retention</h2>
              <p>
                We retain your account and organizational data for as long as your account is active. Lead data, conversations, and appointment records are retained according to your plan and settings. When you delete your account, we will remove your data within 30 days, except where retention is required by law or for legitimate business purposes (e.g., billing records).
              </p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>7. Your Rights</h2>
              <p className="mb-3">Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Access the personal data we hold about you</li>
                <li>Request correction or deletion of your data</li>
                <li>Object to or restrict certain processing</li>
                <li>Export your data in a portable format</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="mt-3">To exercise these rights, contact us at the address below.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>8. Cookies &amp; Tracking</h2>
              <p>
                We use essential cookies for authentication and session management. We may use analytics tools to understand usage patterns. We do not use third-party advertising trackers.
              </p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>9. Children&apos;s Privacy</h2>
              <p>
                The Service is not intended for individuals under the age of 18. We do not knowingly collect information from children.
              </p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page and updating the &quot;Last updated&quot; date. Continued use of the Service after changes constitutes acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>11. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our data practices, please contact us at <a href="mailto:privacy@leadsandsaas.com" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>privacy@leadsandsaas.com</a>.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 mt-8 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <Link href="/terms" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>Terms of Service</Link>
          <span>·</span>
          <span>© {new Date().getFullYear()} LeadSaaS</span>
        </div>
      </div>
    </div>
  );
}
