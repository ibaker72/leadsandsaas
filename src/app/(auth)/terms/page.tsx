{/*
  IMPORTANT: This is a starter template for a Terms of Service page.
  It should be reviewed and customized by qualified legal counsel
  before use in production. This template does not constitute legal advice.
*/}

import Link from 'next/link';
import { Zap, ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
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
          <h1 className="text-[26px] md:text-[32px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>Terms of Service</h1>
          <p className="text-[13px] mb-8" style={{ color: 'var(--text-dark-secondary)' }}>Last updated: March 8, 2026</p>

          <div className="space-y-6 text-[14px] leading-relaxed" style={{ color: 'var(--text-dark-secondary)' }}>
            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>1. Acceptance of Terms</h2>
              <p>
                By accessing or using LeadSaaS (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms. If you do not agree, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>2. Description of Service</h2>
              <p>
                LeadSaaS is a software-as-a-service platform that provides lead capture and management, automated and manual messaging (SMS, email, web chat), appointment scheduling, sales pipeline tracking, AI-powered conversation agents, and third-party integrations. The Service is designed for businesses in service industries including but not limited to HVAC, roofing, dental, medical spa, plumbing, and general service providers.
              </p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>3. Accounts &amp; Registration</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>You must provide accurate, complete registration information</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>You must notify us immediately of any unauthorized access</li>
                <li>One person or legal entity may not maintain more than one free trial account</li>
                <li>You must be at least 18 years old to use the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>4. Free Trial &amp; Billing</h2>
              <p className="mb-3">
                New accounts receive a 14-day free trial with access to core features. After the trial period:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>You must subscribe to a paid plan to continue using the Service</li>
                <li>Billing is processed through Stripe; by subscribing, you also agree to Stripe&apos;s terms</li>
                <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                <li>All fees are non-refundable unless required by law</li>
                <li>We may change pricing with 30 days&apos; notice; continued use constitutes acceptance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>5. Acceptable Use</h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Use the Service to send unsolicited messages (spam) or violate CAN-SPAM, TCPA, or similar regulations</li>
                <li>Collect or store personal data without appropriate consent from data subjects</li>
                <li>Send messages without obtaining proper SMS or email consent as required by law</li>
                <li>Use the Service for any illegal, harmful, or fraudulent purpose</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Reverse-engineer, decompile, or disassemble the Service</li>
                <li>Use the Service in a way that could damage, disable, or impair it</li>
                <li>Resell or redistribute the Service without written permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>6. Your Data &amp; Responsibilities</h2>
              <p className="mb-3">
                You retain ownership of all data you submit to the Service, including lead information, conversation content, and appointment records. You are responsible for:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Ensuring you have the legal right to collect and process the data you submit</li>
                <li>Obtaining proper consent from your leads and contacts for messaging</li>
                <li>Complying with applicable data protection laws (GDPR, CCPA, etc.)</li>
                <li>Maintaining accurate consent records (SMS consent, email opt-in)</li>
                <li>Properly configuring and securing your third-party integrations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>7. AI-Powered Features</h2>
              <p>
                The Service includes AI-powered conversation agents and automation features. While we strive for accuracy, AI-generated responses may contain errors or inappropriate content. You are responsible for monitoring AI agent behavior, reviewing AI-generated messages before or after delivery, and ensuring AI interactions comply with your industry regulations. We are not liable for actions taken by AI agents on your behalf.
              </p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>8. Integrations &amp; Third-Party Services</h2>
              <p>
                The Service integrates with third-party providers (e.g., Twilio for SMS, Resend for email, Stripe for billing). Your use of these integrations is subject to those providers&apos; terms and policies. We are not responsible for the availability, accuracy, or actions of third-party services. You are responsible for securing your integration credentials.
              </p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>9. Service Availability</h2>
              <p>
                We strive to maintain high availability but do not guarantee uninterrupted access. We may perform maintenance, updates, or modifications that temporarily affect availability. We will make reasonable efforts to provide advance notice of planned downtime.
              </p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>10. Intellectual Property</h2>
              <p>
                The Service, including its design, code, features, and documentation, is owned by LeadSaaS and protected by intellectual property laws. Your subscription grants you a limited, non-exclusive, non-transferable license to use the Service for its intended purpose. The embeddable lead capture widget may be deployed on your websites as part of normal Service usage.
              </p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>11. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, LeadSaaS shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the twelve months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>12. Termination</h2>
              <p>
                Either party may terminate the agreement at any time. You may cancel your subscription through the billing section of your dashboard. We may suspend or terminate your account if you violate these Terms or engage in conduct that harms the Service or other users. Upon termination, your right to use the Service ceases immediately. We will retain your data for 30 days after termination, after which it will be deleted.
              </p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>13. Changes to Terms</h2>
              <p>
                We may modify these Terms at any time. We will notify you of material changes by email or through the Service. Continued use after changes take effect constitutes acceptance. If you disagree with the changes, you may terminate your account.
              </p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>14. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Delaware.
              </p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>15. Contact</h2>
              <p>
                For questions about these Terms, contact us at <a href="mailto:legal@leadsandsaas.com" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>legal@leadsandsaas.com</a>.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 mt-8 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <Link href="/privacy" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</Link>
          <span>·</span>
          <span>© {new Date().getFullYear()} LeadSaaS</span>
        </div>
      </div>
    </div>
  );
}
