'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/dashboard/sidebar';
import { Card, Button, FormField, FormInput } from '@/components/ui/primitives';
import {
  Building2, Bot, ArrowRight, ArrowLeft, CheckCircle2, Zap,
} from 'lucide-react';

const PERSONAS = [
  { value: 'professional', label: 'Professional', desc: 'Formal and business-like' },
  { value: 'friendly', label: 'Friendly', desc: 'Warm and approachable' },
  { value: 'direct', label: 'Direct', desc: 'Concise and to-the-point' },
];

const APPOINTMENT_TYPES = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'estimate', label: 'Free Estimate' },
  { value: 'service_call', label: 'Service Call' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Business info
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');

  // Step 2: AI Agent setup
  const [persona, setPersona] = useState('friendly');
  const [businessHoursStart, setBusinessHoursStart] = useState('08:00');
  const [businessHoursEnd, setBusinessHoursEnd] = useState('18:00');
  const [appointmentTypes, setAppointmentTypes] = useState<string[]>(['consultation']);

  const [saving, setSaving] = useState(false);

  function toggleApptType(val: string) {
    setAppointmentTypes((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  }

  async function handleSaveBusinessInfo() {
    setSaving(true);
    localStorage.setItem('ls_business_phone', phone);
    localStorage.setItem('ls_business_address', address);
    localStorage.setItem('ls_business_website', website);
    setSaving(false);
    setStep(2);
  }

  async function handleSaveAgent() {
    setSaving(true);
    localStorage.setItem('ls_agent_persona', persona);
    localStorage.setItem('ls_business_hours', JSON.stringify({ start: businessHoursStart, end: businessHoursEnd }));
    localStorage.setItem('ls_appointment_types', JSON.stringify(appointmentTypes));
    setSaving(false);
    setStep(3);
  }

  function handleFinish() {
    localStorage.setItem('ls_onboarding_complete', 'true');
    router.push('/overview');
    router.refresh();
  }

  return (
    <>
      <TopBar title="Get Started" subtitle="Set up your account in 3 quick steps" />
      <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-2xl mx-auto w-full">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
                style={{
                  background: step > s ? 'var(--success)' : step === s ? 'var(--accent)' : '#e8eaef',
                  color: step >= s ? '#0b0e14' : 'var(--text-dark-secondary)',
                }}
              >
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              {s < 3 && (
                <div className="flex-1 h-[2px] rounded-full" style={{ background: step > s ? 'var(--success)' : '#e8eaef' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Business Info */}
        {step === 1 && (
          <Card className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-[18px] font-bold" style={{ fontFamily: 'Satoshi', color: 'var(--text-dark)' }}>Tell us about your business</h2>
                <p className="text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>This helps your AI agent respond accurately.</p>
              </div>
            </div>
            <div className="space-y-4">
              <FormField label="Business Phone Number">
                <FormInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
              </FormField>
              <FormField label="Business Address / Service Area">
                <FormInput value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, ST or 'Greater Phoenix Area'" />
              </FormField>
              <FormField label="Website URL" hint="Optional">
                <FormInput type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourbusiness.com" />
              </FormField>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={handleSaveBusinessInfo} disabled={saving}>
                Continue <ArrowRight size={14} />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: AI Agent Setup */}
        {step === 2 && (
          <Card className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                <Bot size={20} />
              </div>
              <div>
                <h2 className="text-[18px] font-bold" style={{ fontFamily: 'Satoshi', color: 'var(--text-dark)' }}>Set up your first AI agent</h2>
                <p className="text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>Configure how your AI agent communicates with leads.</p>
              </div>
            </div>
            <div className="space-y-5">
              <FormField label="Agent Personality">
                <div className="grid grid-cols-3 gap-3">
                  {PERSONAS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPersona(p.value)}
                      className="p-3 rounded-xl text-left transition-all border"
                      style={{
                        borderColor: persona === p.value ? 'var(--accent)' : '#e5e7eb',
                        background: persona === p.value ? 'var(--accent-soft)' : '#f8f9fb',
                      }}
                    >
                      <div className="text-[13px] font-bold mb-0.5" style={{ color: 'var(--text-dark)' }}>{p.label}</div>
                      <div className="text-[11px]" style={{ color: 'var(--text-dark-secondary)' }}>{p.desc}</div>
                    </button>
                  ))}
                </div>
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Business Hours Start">
                  <FormInput type="time" value={businessHoursStart} onChange={(e) => setBusinessHoursStart(e.target.value)} />
                </FormField>
                <FormField label="Business Hours End">
                  <FormInput type="time" value={businessHoursEnd} onChange={(e) => setBusinessHoursEnd(e.target.value)} />
                </FormField>
              </div>
              <FormField label="Appointment Types">
                <div className="flex flex-wrap gap-2">
                  {APPOINTMENT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => toggleApptType(t.value)}
                      className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all border"
                      style={{
                        borderColor: appointmentTypes.includes(t.value) ? 'var(--accent)' : '#e5e7eb',
                        background: appointmentTypes.includes(t.value) ? 'var(--accent-soft)' : '#f8f9fb',
                        color: appointmentTypes.includes(t.value) ? 'var(--accent)' : 'var(--text-dark-secondary)',
                      }}
                    >
                      {appointmentTypes.includes(t.value) && <CheckCircle2 size={13} className="inline mr-1.5" />}
                      {t.label}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft size={14} /> Back
              </Button>
              <Button onClick={handleSaveAgent} disabled={saving}>
                Continue <ArrowRight size={14} />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Ready */}
        {step === 3 && (
          <Card className="animate-fade-in text-center py-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'var(--success-soft)' }}>
              <CheckCircle2 size={28} style={{ color: 'var(--success)' }} />
            </div>
            <h2 className="text-[22px] font-bold mb-2" style={{ fontFamily: 'Satoshi', color: 'var(--text-dark)' }}>
              You&apos;re all set!
            </h2>
            <p className="text-[14px] max-w-md mx-auto mb-8 leading-relaxed" style={{ color: 'var(--text-dark-secondary)' }}>
              Your AI agent is configured and ready to start handling leads.
              Head to your dashboard to see everything in action.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="primary" size="lg" onClick={handleFinish}>
                <Zap size={16} /> Go to Dashboard <ArrowRight size={16} />
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button onClick={() => { handleFinish(); setTimeout(() => router.push('/agents'), 100); }} className="text-[13px] font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                Create an Agent
              </button>
              <button onClick={() => { handleFinish(); setTimeout(() => router.push('/leads'), 100); }} className="text-[13px] font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                Add a Lead
              </button>
              <button onClick={() => { handleFinish(); setTimeout(() => router.push('/settings'), 100); }} className="text-[13px] font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                Install Widget
              </button>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
