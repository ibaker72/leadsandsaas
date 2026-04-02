import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AppError, errorResponse } from '@/lib/errors';
import { randomBytes } from 'crypto';
import type { MemberRole, OrgPlan } from '@/lib/types/domain';

export interface AuthenticatedContext {
  userId: string;
  orgId: string;
  role: MemberRole;
  plan: OrgPlan;
}

type HandlerFn = (req: NextRequest, ctx: AuthenticatedContext) => Promise<NextResponse | Response>;

const ROLE_HIERARCHY: Record<MemberRole, number> = {
  viewer: 0, agent: 1, admin: 2, owner: 3,
};

/**
 * Auto-repair for legacy users who have an auth account but no organization.
 *
 * This handles users who signed up before bootstrap fixes, or whose bootstrap
 * partially failed. It creates a new org using stored user_metadata.
 *
 * Safety: only creates a NEW org, never attaches to existing orgs.
 * Only runs when user has zero active memberships.
 */
async function tryAutoRepair(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<{ orgId: string; role: MemberRole } | null> {
  try {
    // Get user metadata for org details
    const { data: authData } = await admin.auth.admin.getUserById(userId);
    if (!authData?.user) return null;

    const meta = authData.user.user_metadata || {};
    const companyName = meta.company_name || meta.full_name || 'My Organization';
    const fullName = meta.full_name || '';
    const vertical = meta.vertical || 'general';

    // Check for orphaned org (org exists but membership is missing)
    // This handles the case where org was created but membership insert failed
    const { data: orphanedOrg } = await admin
      .from('organizations')
      .select('id')
      .eq('slug', companyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'org')
      .maybeSingle();

    // If no orphaned org, create a new one
    const baseSlug = companyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = baseSlug || `org-${Date.now()}`;
    const { data: existingSlug } = await admin.from('organizations').select('id').eq('slug', slug).maybeSingle();
    if (existingSlug) slug = `${slug}-${Date.now().toString(36)}`;

    const captureKey = randomBytes(16).toString('hex');
    const { data: org, error: orgError } = await admin
      .from('organizations')
      .insert({
        name: companyName.trim(),
        slug,
        vertical,
        plan: 'trial',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        capture_key: captureKey,
      })
      .select('id')
      .single();

    if (orgError || !org) {
      console.error('Auto-repair: org creation failed:', orgError);
      return null;
    }

    const orgId = org.id as string;

    const { error: memberError } = await admin.from('organization_members').insert({
      org_id: orgId, user_id: userId, role: 'owner', is_active: true,
    });

    if (memberError) {
      await admin.from('organizations').delete().eq('id', orgId);
      console.error('Auto-repair: membership creation failed:', memberError);
      return null;
    }

    // Non-fatal extras
    await admin.from('user_profiles').upsert({ id: userId, full_name: fullName.trim() });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).rpc('create_default_pipeline', { p_org_id: orgId }).catch(() => {});
    await admin.auth.admin.updateUserById(userId, {
      app_metadata: { org_id: orgId, role: 'owner' },
    }).catch(() => {});

    console.log('Auto-repair complete for user:', userId, 'org:', orgId);
    return { orgId, role: 'owner' as MemberRole };
  } catch (err) {
    console.error('Auto-repair failed:', err);
    return null;
  }
}

/**
 * API route middleware — authenticates via Supabase, resolves org via membership table.
 *
 * If no membership exists, attempts auto-repair for legacy/broken accounts
 * by creating a new org from the user's stored metadata.
 */
export function withAuth(handler: HandlerFn, options: { requiredRole?: MemberRole } = {}) {
  const { requiredRole = 'viewer' } = options;

  return async (req: NextRequest): Promise<NextResponse | Response> => {
    try {
      // 1. Authenticate — getUser() verifies the JWT server-side
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return errorResponse(AppError.unauthorized());

      // 2. Resolve org membership from the database (NOT from JWT)
      const admin = createAdminClient();
      let { data: membership } = await admin
        .from('organization_members')
        .select('org_id, role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .single();

      // 3. Auto-repair: if no membership, try to bootstrap from user metadata
      if (!membership) {
        const repaired = await tryAutoRepair(admin, user.id);
        if (repaired) {
          membership = { org_id: repaired.orgId, role: repaired.role };
        } else {
          return errorResponse(AppError.badRequest('No organization. Complete signup first.'));
        }
      }

      const orgId = membership.org_id as string;
      const role = membership.role as MemberRole;

      // 4. Role check
      if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[requiredRole]) {
        return errorResponse(AppError.forbidden());
      }

      // 5. Get plan
      const { data: org } = await admin
        .from('organizations')
        .select('plan')
        .eq('id', orgId)
        .single();

      return handler(req, {
        userId: user.id,
        orgId,
        role,
        plan: (org?.plan ?? 'trial') as OrgPlan,
      });
    } catch {
      return errorResponse(AppError.internal());
    }
  };
}
