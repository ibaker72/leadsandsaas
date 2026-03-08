import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

export const GET = withAuth(async (_req: NextRequest, ctx) => {
  try {
    const admin = createAdminClient();

    // Get pipeline stages
    const { data: stages, error } = await admin
      .from('pipeline_stages')
      .select('id, name, description, position, color, is_win_stage, is_loss_stage')
      .eq('org_id', ctx.orgId)
      .order('position', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch stages' }, { status: 500 });
    }

    if (!stages || stages.length === 0) {
      return NextResponse.json({ stages: [] });
    }

    // Get all pipeline entries for this org
    const { data: entries } = await admin
      .from('lead_pipeline_entries')
      .select('id, lead_id, stage_id, entered_at, estimated_value, notes')
      .eq('org_id', ctx.orgId);

    // Get all leads for enrichment
    const leadIds = [...new Set((entries || []).map(e => e.lead_id as string))];
    const leadMap = new Map<string, Record<string, unknown>>();
    if (leadIds.length > 0) {
      const { data: leads } = await admin
        .from('leads')
        .select('id, first_name, last_name, email, phone, status, score, source, agent_id')
        .in('id', leadIds);
      (leads || []).forEach(l => leadMap.set(l.id as string, l));
    }

    // Group entries by stage with lead data
    const stageEntries = new Map<string, Record<string, unknown>[]>();
    (entries || []).forEach(e => {
      const stageId = e.stage_id as string;
      const lead = leadMap.get(e.lead_id as string);
      const enriched = {
        ...e,
        lead_name: lead ? [lead.first_name, lead.last_name].filter(Boolean).join(' ') || 'Unknown' : 'Unknown',
        lead_email: (lead?.email as string) || '',
        lead_phone: (lead?.phone as string) || '',
        lead_status: (lead?.status as string) || 'new',
        lead_score: Number(lead?.score) || 0,
        lead_source: (lead?.source as string) || '',
        lead_agent_id: (lead?.agent_id as string) || null,
        lead_service: '',
      };
      if (!stageEntries.has(stageId)) stageEntries.set(stageId, []);
      stageEntries.get(stageId)!.push(enriched);
    });

    const enrichedStages = stages.map(s => ({
      ...s,
      entries: stageEntries.get(s.id as string) || [],
    }));

    return NextResponse.json({ stages: enrichedStages });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requiredRole: 'viewer' });
