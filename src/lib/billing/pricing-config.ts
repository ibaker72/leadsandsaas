/**
 * Single source of truth for plan pricing, features, and metadata.
 *
 * Used by:
 *  - Landing page pricing preview
 *  - Public /pricing page
 *  - Dashboard /billing page
 *  - Dashboard /dashboard/upgrade page
 *  - Checkout session creation (via plans.ts)
 *  - Entitlements/limits (via entitlements.ts)
 */

export interface PlanConfig {
  id: 'starter' | 'growth' | 'scale';
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  features: string[];
  detailedFeatures: string[];
  limits: {
    leads: number | 'Unlimited';
    agents: number | 'Unlimited';
    users: number | 'Unlimited';
    conversationsMonthly: number | 'Unlimited';
    knowledgeBaseMb: number;
  };
  cta: string;
  bestFor: string;
}

export const PLAN_CONFIGS: PlanConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For solo operators and single-location businesses',
    monthlyPrice: 29,
    annualPrice: 24,
    popular: false,
    features: [
      '1 AI Agent',
      '500 conversations/mo',
      '1 team member',
      'SMS & Email',
      'Web chat widget',
      'Appointment scheduling',
      'Basic pipeline view',
    ],
    detailedFeatures: [
      'Up to 500 leads',
      '1 AI sales agent',
      'SMS + email + web chat',
      'Appointment scheduling',
      'Basic pipeline view',
      '1 user seat',
      'Email support',
    ],
    limits: {
      leads: 500,
      agents: 1,
      users: 1,
      conversationsMonthly: 500,
      knowledgeBaseMb: 50,
    },
    cta: 'Get Started',
    bestFor: 'Solo operators, single-location businesses',
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'For growing businesses with a small team',
    monthlyPrice: 79,
    annualPrice: 66,
    popular: true,
    features: [
      '3 AI Agents',
      '2,500 conversations/mo',
      '5 team members',
      'All channels',
      'Advanced analytics',
      'Agent Hub',
      'Advanced pipeline',
    ],
    detailedFeatures: [
      'Up to 2,500 leads',
      '3 AI sales agents',
      'Everything in Starter, plus:',
      'Agent Hub (manage team/partners)',
      'Advanced pipeline with stages',
      'Conversation analytics',
      '5 user seats',
      'Priority support',
    ],
    limits: {
      leads: 2500,
      agents: 3,
      users: 5,
      conversationsMonthly: 2500,
      knowledgeBaseMb: 200,
    },
    cta: 'Upgrade to Growth',
    bestFor: 'Growing businesses with a small team',
  },
  {
    id: 'scale',
    name: 'Scale',
    description: 'For agencies and multi-location businesses',
    monthlyPrice: 149,
    annualPrice: 124,
    popular: false,
    features: [
      'Unlimited AI Agents',
      'Unlimited conversations',
      'Unlimited team members',
      'All channels + Voice',
      'Priority support',
      'White-label widget',
      'API access',
    ],
    detailedFeatures: [
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
    limits: {
      leads: 'Unlimited',
      agents: 'Unlimited',
      users: 'Unlimited',
      conversationsMonthly: 'Unlimited',
      knowledgeBaseMb: 1000,
    },
    cta: 'Go Scale',
    bestFor: 'Agencies and multi-location businesses',
  },
];

/** Look up a plan by ID */
export function getPlanConfig(planId: string): PlanConfig | undefined {
  return PLAN_CONFIGS.find((p) => p.id === planId);
}

/** Get the display price for a plan */
export function getPlanPrice(planId: string, interval: 'monthly' | 'annual' = 'monthly'): number {
  const plan = getPlanConfig(planId);
  if (!plan) return 0;
  return interval === 'annual' ? plan.annualPrice : plan.monthlyPrice;
}

/** Get plan display name */
export function getPlanDisplayName(planId: string): string {
  const names: Record<string, string> = {
    starter: 'Starter',
    growth: 'Growth',
    scale: 'Scale',
    trial: 'Free Trial',
  };
  return names[planId] || planId;
}

/** Comparison table rows for the public pricing page */
export const COMPARISON_ROWS = [
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
