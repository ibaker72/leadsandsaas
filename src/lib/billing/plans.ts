import type { OrgPlan } from '@/lib/types/domain';

/**
 * Central plan-to-Stripe-price mapping.
 *
 * Production Stripe price IDs for LeadSaaS plans.
 * Environment variables override these defaults if set.
 */

export interface PlanPricing {
  monthly: string;
  annual: string;
}

const PLAN_PRICES: Record<string, PlanPricing> = {
  starter: {
    monthly: 'price_1T8ty0BAIc5bqZ87vhrLgtod',
    annual: 'price_1T8uHbBAIc5bqZ87Hj2EXVDG',
  },
  growth: {
    monthly: 'price_1T8tyzBAIc5bqZ87e84BFuLF',
    annual: 'price_1T8uJABAIc5bqZ87FtMEsmB5',
  },
  scale: {
    monthly: 'price_1T8tzqBAIc5bqZ87GJKtcpcM',
    annual: 'price_1T8uKQBAIc5bqZ87V5by6O1Z',
  },
};

/**
 * Resolve the Stripe price ID for a given plan and interval.
 * Checks env vars first (STRIPE_PRICE_STARTER_MONTHLY etc.), falls back to hardcoded.
 */
export function getPriceId(planId: OrgPlan, interval: 'monthly' | 'annual'): string | null {
  // Env var override (existing convention)
  const envKey = `STRIPE_PRICE_${planId.toUpperCase()}_${interval.toUpperCase()}`;
  const envVal = process.env[envKey];
  if (envVal && envVal !== 'price_xxx') return envVal;

  // Hardcoded fallback
  const plan = PLAN_PRICES[planId];
  if (!plan) return null;
  return plan[interval] || null;
}

export const VALID_BILLABLE_PLANS: OrgPlan[] = ['starter', 'growth', 'scale'];
