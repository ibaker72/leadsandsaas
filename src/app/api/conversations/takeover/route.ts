import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

export const POST = withAuth(async (req: NextRequest, ctx) => {
  try {
    const { conversation_id, takeover } = await req.json();

    if (!conversation_id || typeof takeover !== 'boolean') {
      return NextResponse.json(
        { error: 'conversation_id and takeover (boolean) are required' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data, error } = await admin
      .from('conversations')
      .update({
        is_human_takeover: takeover,
        human_agent_id: takeover ? ctx.userId : null,
      })
      .eq('id', conversation_id)
      .eq('org_id', ctx.orgId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Conversation not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, { requiredRole: 'agent' });
