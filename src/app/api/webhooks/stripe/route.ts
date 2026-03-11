import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient as createAdminSupabase } from '@/lib/supabase/admin';

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' });
  }
  return _stripe;
}
const LIMITS: Record<string, Record<string, number>> = {
  starter: { max_agents: 1, max_conversations_monthly: 500, max_users: 1, max_knowledge_base_mb: 50 },
  growth: { max_agents: 3, max_conversations_monthly: 2500, max_users: 5, max_knowledge_base_mb: 200 },
  scale: { max_agents: 999, max_conversations_monthly: 999999, max_users: 999, max_knowledge_base_mb: 1000 },
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  let event: Stripe.Event;
  try { event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!); } catch { return NextResponse.json({ error: 'Invalid signature' }, { status: 400 }); }

  const db = createAdminSupabase();
  try {
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const sub = event.data.object as Stripe.Subscription;
      const lookupKey = sub.items.data[0]?.price?.lookup_key ?? '';
      const planId = lookupKey.split('_')[0] || 'starter';
      await db.from('organizations').update({ stripe_subscription_id: sub.id, plan: planId as any, limits: LIMITS[planId] || LIMITS.starter }).eq('stripe_customer_id', sub.customer as string);
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      await db.from('organizations').update({ plan: 'trial', stripe_subscription_id: null, limits: { max_agents: 0, max_conversations_monthly: 0, max_users: 1, max_knowledge_base_mb: 0 } }).eq('stripe_customer_id', sub.customer as string);
    }
    return NextResponse.json({ received: true });
  } catch (e) { console.error('Stripe error:', e); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
