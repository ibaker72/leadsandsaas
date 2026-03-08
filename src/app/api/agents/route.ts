import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

export const GET = withAuth(async (_req: NextRequest, ctx) => {
  try {
    const admin = createAdminClient();
    const { data: agents, error } = await admin
      .from('agents')
      .select('id, name, description, vertical, status, channels, stats, created_at')
      .eq('org_id', ctx.orgId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
    }
    return NextResponse.json({ agents: agents || [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requiredRole: 'viewer' });

export const POST = withAuth(async (req: NextRequest, ctx) => {
  try {
    const { name, description, vertical, status } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: agent, error } = await admin
      .from('agents')
      .insert({
        org_id: ctx.orgId,
        name,
        description: description || null,
        vertical: vertical || 'general',
        status: status || 'draft',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
    }
    return NextResponse.json({ agent }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requiredRole: 'admin' });
