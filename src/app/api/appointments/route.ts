import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

export const GET = withAuth(async (_req: NextRequest, ctx) => {
  try {
    const admin = createAdminClient();
    const { data: appointments, error } = await admin
      .from('appointments')
      .select('id, title, description, service_type, status, starts_at, ends_at, timezone, location, is_virtual, notes, lead_id, agent_id, conversation_id, created_at')
      .eq('org_id', ctx.orgId)
      .order('starts_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({ appointments: [] });
    }

    // Get lead names
    const leadIds = [...new Set(appointments.filter(a => a.lead_id).map(a => a.lead_id as string))];
    const leadMap = new Map<string, string>();
    if (leadIds.length > 0) {
      const { data: leads } = await admin.from('leads').select('id, first_name, last_name').in('id', leadIds);
      (leads || []).forEach(l => leadMap.set(l.id as string, [l.first_name, l.last_name].filter(Boolean).join(' ') || 'Unknown'));
    }

    const enriched = appointments.map(a => ({
      ...a,
      lead_name: a.lead_id ? (leadMap.get(a.lead_id as string) || 'Unknown') : 'Unknown',
    }));

    return NextResponse.json({ appointments: enriched });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requiredRole: 'viewer' });

export const POST = withAuth(async (req: NextRequest, ctx) => {
  try {
    const {
      title,
      lead_id,
      service_type,
      starts_at,
      ends_at,
      timezone,
      agent_id,
      conversation_id,
      notes,
      description,
    } = await req.json();

    if (!title || !starts_at || !ends_at) {
      return NextResponse.json(
        { error: 'title, starts_at, and ends_at are required' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: appointment, error } = await admin
      .from('appointments')
      .insert({
        org_id: ctx.orgId,
        title,
        lead_id: lead_id || null,
        service_type,
        starts_at,
        ends_at,
        timezone,
        agent_id,
        conversation_id,
        notes,
        description,
        status: 'scheduled',
        is_virtual: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ appointment });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, { requiredRole: 'agent' });
