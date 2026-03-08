import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

export const PATCH = withAuth(async (req: NextRequest, ctx) => {
  try {
    const parts = req.url.split('/');
    const id = parts[parts.length - 1];
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: appointment, error } = await admin
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .eq('org_id', ctx.orgId)
      .select()
      .single();

    if (error || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json({ appointment });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requiredRole: 'agent' });
