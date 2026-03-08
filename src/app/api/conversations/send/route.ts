import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

export const POST = withAuth(async (req: NextRequest, ctx) => {
  try {
    const { conversation_id, message, channel } = await req.json();

    if (!conversation_id || !message) {
      return NextResponse.json(
        { error: 'conversation_id and message are required' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Look up conversation and verify org ownership
    const { data: conversation, error: convError } = await admin
      .from('conversations')
      .select('*')
      .eq('id', conversation_id)
      .eq('org_id', ctx.orgId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Insert outbound message
    const { data: msg, error: msgError } = await admin
      .from('messages')
      .insert({
        org_id: ctx.orgId,
        conversation_id,
        lead_id: conversation.lead_id,
        direction: 'outbound',
        sender_type: 'human_agent',
        sender_id: ctx.userId,
        channel: channel ?? conversation.channel,
        body: message,
        status: 'queued',
      })
      .select()
      .single();

    if (msgError) {
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Update conversation metadata
    const { error: updateError } = await admin
      .from('conversations')
      .update({
        is_human_takeover: true,
        human_agent_id: ctx.userId,
        last_message_at: new Date().toISOString(),
        message_count: (Number(conversation.message_count) || 0) + 1,
      })
      .eq('id', conversation_id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Message sent but failed to update conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: msg });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, { requiredRole: 'agent' });
