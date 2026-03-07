import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerSupabase, createAdminSupabase } from '@/lib/db/supabase';
import { AppError, errorResponse } from '@/lib/errors';
import type { MemberRole, OrgPlan } from '@/lib/types/domain';

export interface AuthenticatedContext { userId: string; orgId: string; role: MemberRole; plan: OrgPlan; }
type HandlerFn = (req: NextRequest, ctx: AuthenticatedContext) => Promise<NextResponse | Response>;

const ROLE_HIERARCHY: Record<MemberRole, number> = { viewer: 0, agent: 1, admin: 2, owner: 3 };

export function withAuth(handler: HandlerFn, options: { requiredRole?: MemberRole } = {}) {
  const { requiredRole = 'viewer' } = options;
  return async (req: NextRequest): Promise<NextResponse | Response> => {
    try {
      const supabase = await createRouteHandlerSupabase();
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) return errorResponse(AppError.unauthorized());
      const userId = session.user.id;
      const orgId = session.user.app_metadata?.org_id as string;
      const role = (session.user.app_metadata?.role as MemberRole) ?? 'viewer';
      if (!orgId) return errorResponse(AppError.badRequest('No organization context.'));
      if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[requiredRole]) return errorResponse(AppError.forbidden());
      const db = createAdminSupabase();
      const { data: org } = await db.from('organizations').select('plan').eq('id', orgId).single();
      return handler(req, { userId, orgId, role, plan: (org?.plan ?? 'trial') as OrgPlan });
    } catch { return errorResponse(AppError.internal()); }
  };
}
