import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

function extractId(url: string): string {
  const parts = url.split('/');
  // URL: /api/leads/[id] — id is the last segment
  return parts[parts.length - 1];
}

export const PATCH = withAuth(async (req: NextRequest, ctx) => {
  try {
    const id = extractId(req.url);
    const body = await req.json();
    const updates: Record<string, unknown> = {};

    for (const key of ['status', 'score', 'agent_id', 'first_name', 'last_name', 'email', 'phone']) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: lead, error } = await admin
      .from('leads')
      .update(updates)
      .eq('id', id)
      .eq('org_id', ctx.orgId)
      .select()
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead not found or update failed' }, { status: 404 });
    }
    return NextResponse.json({ lead });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requiredRole: 'agent' });

export const DELETE = withAuth(async (req: NextRequest, ctx) => {
  try {
    const id = extractId(req.url);
    const admin = createAdminClient();
    const { error } = await admin
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('org_id', ctx.orgId);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requiredRole: 'admin' });
