import Stripe from 'stripe';
import { createAdminClient as createAdminSupabase } from '@/lib/supabase/admin';
import { type Result, tryCatch } from '@/lib/errors';
import { AppError } from '@/lib/errors';
import { getPriceId } from '@/lib/billing/plans';
import { absoluteUrl } from '@/lib/url';
import type { OrgPlan } from '@/lib/types/domain';

// Lazy-init to avoid build error when STRIPE_SECRET_KEY is not set
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' });
  }
  return _stripe;
}

/**
 * Resolve or create a valid Stripe customer for the organization.
 * If a stored customer ID is stale (deleted in Stripe), creates a fresh one.
 */
async function resolveStripeCustomer(
  db: ReturnType<typeof createAdminSupabase>,
  orgId: string,
  email: string,
  userId: string,
  orgName: string | undefined,
): Promise<string> {
  const { data: org } = await db.from('organizations').select('stripe_customer_id').eq('id', orgId).single();
  let customerId = org?.stripe_customer_id as string | undefined;

  if (customerId) {
    // Validate that the stored customer still exists in Stripe
    try {
      const existing = await getStripe().customers.retrieve(customerId);
      if ((existing as Stripe.DeletedCustomer).deleted) {
        customerId = undefined; // Customer was deleted, need a new one
      }
    } catch {
      // Customer not found in Stripe — stale ID, create a new one
      customerId = undefined;
    }
  }

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email,
      metadata: { org_id: orgId, user_id: userId },
      name: orgName ?? undefined,
    });
    customerId = customer.id;
    await db.from('organizations').update({ stripe_customer_id: customerId }).eq('id', orgId);
  }

  return customerId;
}

export async function createCheckoutSession(orgId: string, planId: OrgPlan, interval: 'monthly' | 'annual', userId: string, email: string): Promise<Result<{ url: string }>> {
  return tryCatch(async () => {
    const db = createAdminSupabase();
    const { data: org } = await db.from('organizations').select('stripe_customer_id, name').eq('id', orgId).single();
    const customerId = await resolveStripeCustomer(db, orgId, email, userId, org?.name as string | undefined);
    const priceId = getPriceId(planId, interval);
    if (!priceId) throw AppError.badRequest(`No price configured for ${planId} (${interval})`);
    const session = await getStripe().checkout.sessions.create({
      customer: customerId, mode: 'subscription', line_items: [{ price: priceId, quantity: 1 }],
      success_url: absoluteUrl('/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}'),
      cancel_url: absoluteUrl('/billing'),
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

    // Validate customer still exists before opening portal
    try {
      const existing = await getStripe().customers.retrieve(org.stripe_customer_id as string);
      if ((existing as Stripe.DeletedCustomer).deleted) {
        throw AppError.badRequest('No billing account');
      }
    } catch (e) {
      if (e instanceof AppError) throw e;
      // Stale customer ID — clear it so checkout can create a fresh one
      await db.from('organizations').update({ stripe_customer_id: null }).eq('id', orgId);
      throw AppError.badRequest('No billing account');
    }

    const session = await getStripe().billingPortal.sessions.create({ customer: org.stripe_customer_id as string, return_url: absoluteUrl('/billing') });
    return { url: session.url };
  });
}
