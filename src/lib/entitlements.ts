import type { OrgPlan } from '@/lib/types/domain';

export interface PlanLimits {
  maxLeads: number;
  maxAgents: number;
  maxUsers: number;
  features: string[];
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  starter: {
    maxLeads: 500,
    maxAgents: 1,
    maxUsers: 1,
    features: ['sms', 'email', 'webchat', 'scheduling', 'basic_pipeline'],
  },
  growth: {
    maxLeads: 2500,
    maxAgents: 3,
    maxUsers: 5,
    features: ['sms', 'email', 'webchat', 'scheduling', 'agent_hub', 'advanced_pipeline', 'analytics'],
  },
  scale: {
    maxLeads: Infinity,
    maxAgents: Infinity,
    maxUsers: Infinity,
    features: ['sms', 'email', 'webchat', 'scheduling', 'agent_hub', 'advanced_pipeline', 'analytics', 'custom_ai', 'api_access', 'whitelabel', 'advanced_reporting'],
  },
  // Trial gets Growth-level access
  trial: {
    maxLeads: 2500,
    maxAgents: 3,
    maxUsers: 5,
    features: ['sms', 'email', 'webchat', 'scheduling', 'agent_hub', 'advanced_pipeline', 'analytics'],
  },
};

export function getPlanLimits(plan: OrgPlan | string): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
}

export function canAccessFeature(plan: OrgPlan | string, feature: string): boolean {
  const limits = getPlanLimits(plan);
  return limits.features.includes(feature);
}

export function isAtLimit(plan: OrgPlan | string, resource: 'leads' | 'agents' | 'users', currentCount: number): boolean {
  const limits = getPlanLimits(plan);
  switch (resource) {
    case 'leads': return currentCount >= limits.maxLeads;
    case 'agents': return currentCount >= limits.maxAgents;
    case 'users': return currentCount >= limits.maxUsers;
    default: return false;
  }
}

export function getUpgradePlan(currentPlan: OrgPlan | string): string | null {
  switch (currentPlan) {
    case 'starter': return 'growth';
    case 'growth': return 'scale';
    case 'trial': return 'starter';
    default: return null;
  }
}

export {
  getPlanDisplayName,
  getPlanPrice,
} from '@/lib/billing/pricing-config';
