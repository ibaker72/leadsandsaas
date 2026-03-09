import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createCheckoutSession } from '@/lib/billing/stripe';
import { createClient } from '@/lib/supabase/server';
import type { OrgPlan } from '@/lib/types/domain';

const VALID_PLANS: OrgPlan[] = ['starter', 'growth', 'scale'];
const VALID_INTERVALS = ['monthly', 'annual'] as const;

export const POST = withAuth(async (req: NextRequest, ctx) => {
  const body = await req.json();
  const { planId, interval = 'monthly' } = body;

  if (!planId || !VALID_PLANS.includes(planId)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }
  if (!VALID_INTERVALS.includes(interval)) {
    return NextResponse.json({ error: 'Invalid interval' }, { status: 400 });
  }

  // Get user email for Stripe customer creation
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email ?? '';

  const result = await createCheckoutSession(
    ctx.orgId,
    planId as OrgPlan,
    interval as 'monthly' | 'annual',
    ctx.userId,
    email
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: result.error.statusCode || 500 });
  }

  return NextResponse.json({ url: result.value.url });
}, { requiredRole: 'owner' });
