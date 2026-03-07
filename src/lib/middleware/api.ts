import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AppError, errorResponse } from '@/lib/errors';
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
 * API route middleware — authenticates via Supabase, resolves org via membership table.
 *
 * Key difference from old version: org_id comes from the organization_members table,
 * NOT from JWT claims. This is the security-critical change.
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
      const { data: membership } = await admin
        .from('organization_members')
        .select('org_id, role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (!membership) {
        return errorResponse(AppError.badRequest('No organization. Complete signup first.'));
      }

      const orgId = membership.org_id as string;
      const role = membership.role as MemberRole;

      // 3. Role check
      if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[requiredRole]) {
        return errorResponse(AppError.forbidden());
      }

      // 4. Get plan
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
