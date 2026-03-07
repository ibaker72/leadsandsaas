import Stripe from 'stripe';
import { createAdminSupabase } from '@/lib/db/supabase';
import { Ok, type Result, tryCatch } from '@/lib/errors';
import { AppError } from '@/lib/errors';
import type { OrgPlan } from '@/lib/types/domain';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' });

export async function createCheckoutSession(orgId: string, planId: OrgPlan, interval: 'monthly' | 'annual', userId: string, email: string): Promise<Result<{ url: string }>> {
  return tryCatch(async () => {
    const db = createAdminSupabase();
    const { data: org } = await db.from('organizations').select('stripe_customer_id, name').eq('id', orgId).single();
    let customerId = org?.stripe_customer_id as string | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { org_id: orgId, user_id: userId }, name: org?.name as string });
      customerId = customer.id;
      await db.from('organizations').update({ stripe_customer_id: customerId }).eq('id', orgId);
    }
    const priceId = process.env[`STRIPE_PRICE_${planId.toUpperCase()}_${interval === 'annual' ? 'ANNUAL' : 'MONTHLY'}`];
    if (!priceId) throw AppError.badRequest(`No price for ${planId} (${interval})`);
    const session = await stripe.checkout.sessions.create({
      customer: customerId, mode: 'subscription', line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
      metadata: { org_id: orgId }, allow_promotion_codes: true,
    });
    return { url: session.url! };
  }, (e) => AppError.externalService('Stripe', (e as Error).message, e));
}

export async function createPortalSession(orgId: string): Promise<Result<{ url: string }>> {
  return tryCatch(async () => {
    const db = createAdminSupabase();
    const { data: org } = await db.from('organizations').select('stripe_customer_id').eq('id', orgId).single();
    if (!org?.stripe_customer_id) throw AppError.badRequest('No billing account');
    const session = await stripe.billingPortal.sessions.create({ customer: org.stripe_customer_id as string, return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing` });
    return { url: session.url };
  });
}
