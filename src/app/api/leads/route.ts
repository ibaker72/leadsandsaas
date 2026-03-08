import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

export const GET = withAuth(async (_req: NextRequest, ctx) => {
  try {
    const admin = createAdminClient();
    const { data: leads, error } = await admin
      .from('leads')
      .select('id, first_name, last_name, email, phone, status, score, source, agent_id, tags, created_at, updated_at')
      .eq('org_id', ctx.orgId)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
    return NextResponse.json({ leads: leads || [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requiredRole: 'viewer' });

export const POST = withAuth(async (req: NextRequest, ctx) => {
  try {
    const { first_name, last_name, email, phone, source, status, agent_id, notes } = await req.json();
    if (!first_name && !email && !phone) {
      return NextResponse.json({ error: 'At least name, email, or phone is required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Create lead
    const { data: lead, error } = await admin
      .from('leads')
      .insert({
        org_id: ctx.orgId,
        first_name: first_name || null,
        last_name: last_name || null,
        email: email || null,
        phone: phone || null,
        source: source || 'manual',
        status: status || 'new',
        agent_id: agent_id || null,
        qualification: notes ? { service_needed: null, timeline: null, budget_range: null, location: null, property_type: null, urgency: null, decision_maker: null, notes: [notes] } : undefined,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }

    // Auto-create pipeline entry in first stage
    const { data: firstStage } = await admin
      .from('pipeline_stages')
      .select('id')
      .eq('org_id', ctx.orgId)
      .order('position', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (firstStage && lead) {
      const leadId = lead.id as string;
      const stageId = firstStage.id as string;
      await admin.from('lead_pipeline_entries').insert({
        org_id: ctx.orgId,
        lead_id: leadId,
        stage_id: stageId,
      });
      await admin.from('pipeline_transitions').insert({
        org_id: ctx.orgId,
        lead_id: leadId,
        from_stage_id: null,
        to_stage_id: stageId,
        triggered_by: `human_agent:${ctx.userId}`,
      });
    }

    return NextResponse.json({ lead }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requiredRole: 'agent' });
