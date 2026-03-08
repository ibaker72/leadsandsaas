import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

export const POST = withAuth(async (req: NextRequest, ctx) => {
  try {
    const { lead_id, stage_id, estimated_value, notes } = await req.json();
    if (!lead_id || !stage_id) {
      return NextResponse.json({ error: 'lead_id and stage_id are required' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: entry, error } = await admin
      .from('lead_pipeline_entries')
      .insert({
        org_id: ctx.orgId,
        lead_id,
        stage_id,
        estimated_value: estimated_value || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create pipeline entry' }, { status: 500 });
    }

    // Record transition
    await admin.from('pipeline_transitions').insert({
      org_id: ctx.orgId,
      lead_id,
      from_stage_id: null,
      to_stage_id: stage_id,
      triggered_by: `human_agent:${ctx.userId}`,
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requiredRole: 'agent' });
