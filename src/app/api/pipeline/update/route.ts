import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

export const POST = withAuth(async (req: NextRequest, ctx) => {
  try {
    const { lead_id, entry_id, stage_id, estimated_value, notes, agent_id } = await req.json();

    if (!lead_id && !entry_id) {
      return NextResponse.json(
        { error: 'lead_id or entry_id is required' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Find the pipeline entry by lead_id or entry_id, verify org ownership
    let entryQuery = admin
      .from('lead_pipeline_entries')
      .select('*')
      .eq('org_id', ctx.orgId);

    if (lead_id) {
      entryQuery = entryQuery.eq('lead_id', lead_id);
    } else {
      entryQuery = entryQuery.eq('id', entry_id);
    }

    const { data: entry, error: entryError } = await entryQuery.single();

    if (entryError || !entry) {
      return NextResponse.json(
        { error: 'Pipeline entry not found for this lead' },
        { status: 404 }
      );
    }

    const entryId = entry.id as string;
    const resolvedLeadId = (lead_id || entry.lead_id) as string;
    const currentStageId = entry.stage_id as string;

    // If stage changed, record a transition
    if (stage_id && stage_id !== currentStageId) {
      const { error: transitionError } = await admin
        .from('pipeline_transitions')
        .insert({
          org_id: ctx.orgId,
          lead_id: resolvedLeadId,
          from_stage_id: currentStageId,
          to_stage_id: stage_id,
          triggered_by: `human_agent:${ctx.userId}`,
        });

      if (transitionError) {
        return NextResponse.json(
          { error: 'Failed to record pipeline transition' },
          { status: 500 }
        );
      }
    }

    // Build update payload
    const updates: Record<string, unknown> = {};
    if (stage_id !== undefined) updates.stage_id = stage_id;
    if (estimated_value !== undefined) updates.estimated_value = estimated_value;
    if (notes !== undefined) updates.notes = notes;

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await admin
        .from('lead_pipeline_entries')
        .update(updates)
        .eq('id', entryId)
        .eq('org_id', ctx.orgId);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update pipeline entry' },
          { status: 500 }
        );
      }
    }

    // If agent_id provided, update the lead's assigned agent
    if (agent_id !== undefined) {
      const { error: leadError } = await admin
        .from('leads')
        .update({ agent_id })
        .eq('id', resolvedLeadId)
        .eq('org_id', ctx.orgId);

      if (leadError) {
        return NextResponse.json(
          { error: 'Failed to update lead agent assignment' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, { requiredRole: 'agent' });
