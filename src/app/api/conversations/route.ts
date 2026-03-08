import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

export const GET = withAuth(async (_req: NextRequest, ctx) => {
  try {
    const admin = createAdminClient();

    // Get conversations
    const { data: conversations, error } = await admin
      .from('conversations')
      .select('id, lead_id, agent_id, channel, is_active, is_human_takeover, message_count, last_message_at, summary, created_at')
      .eq('org_id', ctx.orgId)
      .eq('is_active', true)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    // Get lead info
    const leadIds = [...new Set(conversations.map(c => c.lead_id as string))];
    const { data: leads } = await admin
      .from('leads')
      .select('id, first_name, last_name, email, phone, status, score')
      .in('id', leadIds);

    const leadMap = new Map<string, Record<string, unknown>>();
    (leads || []).forEach(l => leadMap.set(l.id as string, l));

    // Get agent info
    const agentIds = [...new Set(conversations.filter(c => c.agent_id).map(c => c.agent_id as string))];
    const agentMap = new Map<string, string>();
    if (agentIds.length > 0) {
      const { data: agents } = await admin
        .from('agents')
        .select('id, name')
        .in('id', agentIds);
      (agents || []).forEach(a => agentMap.set(a.id as string, a.name as string));
    }

    // Get last message for each conversation
    const convoIds = conversations.map(c => c.id as string);
    const { data: lastMessages } = await admin
      .from('messages')
      .select('conversation_id, body')
      .in('conversation_id', convoIds)
      .order('created_at', { ascending: false });

    const lastMsgMap = new Map<string, string>();
    (lastMessages || []).forEach(m => {
      const convoId = m.conversation_id as string;
      if (!lastMsgMap.has(convoId)) {
        lastMsgMap.set(convoId, m.body as string);
      }
    });

    const enriched = conversations.map(c => {
      const lead = leadMap.get(c.lead_id as string);
      return {
        ...c,
        lead_name: lead ? [lead.first_name, lead.last_name].filter(Boolean).join(' ') || 'Unknown' : 'Unknown',
        lead_phone: (lead?.phone as string) || '',
        lead_email: (lead?.email as string) || '',
        lead_status: (lead?.status as string) || 'new',
        lead_score: Number(lead?.score) || 0,
        agent_name: c.agent_id ? (agentMap.get(c.agent_id as string) || 'Unassigned') : 'Unassigned',
        last_message: lastMsgMap.get(c.id as string) || '',
      };
    });

    return NextResponse.json({ conversations: enriched });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requiredRole: 'viewer' });

export const POST = withAuth(async (req: NextRequest, ctx) => {
  try {
    const { lead_id, agent_id, channel } = await req.json();
    if (!lead_id) {
      return NextResponse.json({ error: 'lead_id is required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Verify lead belongs to org
    const { data: lead } = await admin
      .from('leads')
      .select('id')
      .eq('id', lead_id)
      .eq('org_id', ctx.orgId)
      .single();

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const { data: conversation, error } = await admin
      .from('conversations')
      .insert({
        org_id: ctx.orgId,
        lead_id,
        agent_id: agent_id || null,
        channel: channel || 'web_chat',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    return NextResponse.json({ conversation }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requiredRole: 'agent' });
