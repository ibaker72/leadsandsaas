import type { OrgPlan } from '@/lib/types/domain';

/**
 * Central plan-to-Stripe-price mapping.
 *
 * Production Stripe price IDs for LeadsAndSaaS plans.
 * Environment variables override these defaults if set.
 */

export interface PlanPricing {
  monthly: string;
  annual: string;
}

const PLAN_PRICES: Record<string, PlanPricing> = {
  starter: {
    monthly: 'price_1T9doWDKlxdQW6LVwMpDzqvS',
    annual: 'price_1T9doWDKlxdQW6LVwMpDzqvS',
  },
  growth: {
    monthly: 'price_1T9doyDKlxdQW6LV3rR7qjsj',
    annual: 'price_1T9doyDKlxdQW6LV3rR7qjsj',
  },
  scale: {
    monthly: 'price_1T9dpDDKlxdQW6LVhUB7vSAe',
    annual: 'price_1T9dpDDKlxdQW6LVhUB7vSAe',
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
