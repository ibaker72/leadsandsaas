'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/dashboard/sidebar';
import { Card, Button, Badge } from '@/components/ui/primitives';
import {
  Bot, Users, Code, CreditCard, CheckCircle2, ArrowRight,
  Zap, Sparkles, ChevronRight, Building2, Palette,
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
  href: string;
  actionLabel: string;
  accentColor: string;
}

const STEPS: OnboardingStep[] = [
  {
    id: 'agent',
    title: 'Create your first AI agent',
    description: 'Set up an AI sales agent trained for your industry. It will handle leads, qualify prospects, and book appointments 24/7.',
    icon: Bot,
    href: '/agents',
    actionLabel: 'Create Agent',
    accentColor: 'var(--accent)',
  },
  {
    id: 'lead',
    title: 'Add or import your first lead',
    description: 'Add a lead manually, import from a CSV, or connect your web forms to start capturing leads automatically.',
    icon: Users,
    href: '/leads',
    actionLabel: 'Go to Leads',
    accentColor: 'var(--info)',
  },
  {
    id: 'widget',
    title: 'Install the lead capture widget',
    description: 'Copy a single line of code to your website. The chat widget will capture leads and route them to your AI agent.',
    icon: Code,
    href: '/settings',
    actionLabel: 'Get Widget Code',
    accentColor: 'var(--success)',
  },
  {
    id: 'billing',
    title: 'Review your plan',
    description: 'You\'re on a 14-day free trial. Explore plan options and upgrade when you\'re ready — no pressure.',
    icon: CreditCard,
    href: '/billing',
    actionLabel: 'View Plans',
    accentColor: '#a855f7',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem('ls_onboarding_steps');
    if (stored) {
      try {
        setCompleted(new Set(JSON.parse(stored)));
      } catch { /* ignore parse errors */ }
    }
  }, []);

  function markComplete(stepId: string) {
    const next = new Set(completed);
    next.add(stepId);
    setCompleted(next);
    localStorage.setItem('ls_onboarding_steps', JSON.stringify([...next]));
  }

  function handleStepAction(step: OnboardingStep) {
    markComplete(step.id);
    router.push(step.href);
  }

  function handleFinish() {
    localStorage.setItem('ls_onboarding_complete', 'true');
    router.push('/overview');
  }

  const progress = (completed.size / STEPS.length) * 100;
  const allDone = completed.size === STEPS.length;

  return (
    <>
      <TopBar title="Welcome" subtitle="Let's get you set up" />
      <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-3xl mx-auto w-full">
        {/* Hero section */}
        <div className="text-center mb-8 md:mb-10 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-glow)' }}>
            <Sparkles size={28} color="#0b0e14" />
          </div>
          <h1 className="text-[22px] md:text-[28px] font-bold mb-2" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>
            Welcome to LeadSaaS
          </h1>
          <p className="text-[14px] md:text-[15px] max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-dark-secondary)' }}>
            Complete these steps to start converting leads with AI-powered sales agents.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] md:text-[13px] font-semibold" style={{ color: 'var(--text-dark)' }}>
              Setup progress
            </span>
            <span className="text-[12px] md:text-[13px] font-bold tabular-nums" style={{ color: 'var(--accent)' }}>
              {completed.size}/{STEPS.length} complete
            </span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#e8eaef' }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent), #fbbf24)' }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 md:space-y-4 mb-8 md:mb-10">
          {STEPS.map((step, i) => {
            const done = completed.has(step.id);
            return (
              <Card
                key={step.id}
                padding={false}
                className={`animate-fade-in overflow-hidden transition-all ${done ? 'opacity-70' : ''}`}
              >
                {/* Accent line */}
                <div className="h-[2px]" style={{ background: done ? 'var(--success)' : step.accentColor, opacity: done ? 1 : 0.6 }} />
                <div className="p-4 md:p-5 flex items-start gap-4">
                  {/* Step number / check */}
                  <div
                    className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: done ? 'var(--success-soft)' : `${step.accentColor}14`,
                      color: done ? 'var(--success)' : step.accentColor,
                    }}
                  >
                    {done ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[14px] md:text-[15px] font-bold" style={{ color: done ? 'var(--text-dark-secondary)' : 'var(--text-dark)', fontFamily: 'Satoshi' }}>
                        {step.title}
                      </h3>
                      {done && <Badge variant="success">Done</Badge>}
                    </div>
                    <p className="text-[12px] md:text-[13px] leading-relaxed mb-3" style={{ color: 'var(--text-dark-secondary)' }}>
                      {step.description}
                    </p>
                    <div className="flex items-center gap-2">
                      {done ? (
                        <Button variant="ghost" size="sm" onClick={() => router.push(step.href)}>
                          Revisit <ChevronRight size={13} />
                        </Button>
                      ) : (
                        <Button variant={i === 0 && completed.size === 0 ? 'primary' : 'secondary'} size="sm" onClick={() => handleStepAction(step)}>
                          {step.actionLabel} <ArrowRight size={13} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Finish / Skip */}
        <div className="text-center space-y-3">
          {allDone ? (
            <Button variant="primary" size="lg" onClick={handleFinish} className="px-8">
              <Zap size={16} /> Go to Dashboard <ArrowRight size={16} />
            </Button>
          ) : (
            <button
              onClick={handleFinish}
              className="text-[13px] font-medium transition-colors hover:underline"
              style={{ color: 'var(--text-dark-secondary)' }}
            >
              Skip for now — I&apos;ll explore on my own
            </button>
          )}
        </div>
      </div>
    </>
  );
}
