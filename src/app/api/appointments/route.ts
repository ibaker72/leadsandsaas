import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

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

    if (!title || !lead_id || !starts_at || !ends_at) {
      return NextResponse.json(
        { error: 'title, lead_id, starts_at, and ends_at are required' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: appointment, error } = await admin
      .from('appointments')
      .insert({
        org_id: ctx.orgId,
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
