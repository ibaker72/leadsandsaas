import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

export const GET = withAuth(async (req: NextRequest, ctx) => {
  try {
    // Extract conversation ID from URL: /api/conversations/[id]/messages
    const parts = req.url.split('/');
    const messagesIdx = parts.indexOf('messages');
    const conversationId = messagesIdx > 0 ? parts[messagesIdx - 1] : null;

    if (!conversationId) {
      return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Verify conversation belongs to org
    const { data: convo } = await admin
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('org_id', ctx.orgId)
      .single();

    if (!convo) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const { data: messages, error } = await admin
      .from('messages')
      .select('id, direction, sender_type, body, status, created_at')
      .eq('conversation_id', conversationId)
      .eq('org_id', ctx.orgId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requiredRole: 'viewer' });
