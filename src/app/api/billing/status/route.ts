import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/billing/status
 * Returns the current org plan, limits, and usage counts for the billing page.
 */
export const GET = withAuth(async (_req: NextRequest, ctx) => {
  try {
    const admin = createAdminClient();

    // Get org details
    const { data: org } = await admin
      .from('organizations')
      .select('plan, limits')
      .eq('id', ctx.orgId)
      .single();

    // Count agents
    const { count: agentsCount } = await admin
      .from('agents')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', ctx.orgId);

    // Count active members
    const { count: membersCount } = await admin
      .from('organization_members')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', ctx.orgId)
      .eq('is_active', true);

    // Count conversations this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count: convosCount } = await admin
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', ctx.orgId)
      .gte('created_at', monthStart);

    return NextResponse.json({
      plan: org?.plan || 'trial',
      limits: org?.limits || {},
      agents_count: agentsCount || 0,
      members_count: membersCount || 0,
      conversations_used: convosCount || 0,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch billing status' }, { status: 500 });
  }
}, { requiredRole: 'viewer' });
