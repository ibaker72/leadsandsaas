import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient as createAdminSupabase } from '@/lib/supabase/admin';
import { getAgentEngine, type AgentContext } from '@/lib/ai/engine';
import { ActionExecutor } from '@/lib/ai/executor';
import { DomainEventEmitter } from '@/lib/events/emitter';
import { verifyTwilioSignature } from '@/lib/comms/verify';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const sig = req.headers.get('x-twilio-signature') ?? '';
    if (!verifyTwilioSignature(req.url, params, sig)) return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });

    const from = params.get('From')!;
    const to = params.get('To')!;
    const msgBody = params.get('Body')?.trim() ?? '';
    const msgSid = params.get('MessageSid')!;
    if (!msgBody) return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } });

    const db = createAdminSupabase();
    const { data: agent } = await db.from('agents').select('*, organizations(*)').eq('status', 'active').contains('channels', { sms: { twilio_number: to } }).single();
    if (!agent) return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } });

    const org = (agent as any).organizations;
    const orgId = org.id;

    // Find or create lead
    let { data: lead } = await db.from('leads').select('*').eq('phone_e164', from).eq('org_id', orgId).maybeSingle();
    if (!lead) {
      const { data: newLead } = await db.from('leads').insert({ org_id: orgId, agent_id: agent.id, phone: from, phone_e164: from, source: 'sms_inbound', sms_consent: true, sms_consent_at: new Date().toISOString() }).select().single();
      lead = newLead;
      await new DomainEventEmitter(db).emit('lead.created', 'lead', lead!.id, { source: 'sms_inbound' }, orgId);
    }
    if (!lead || lead.opted_out) return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } });
    if (['stop','unsubscribe','cancel','quit'].includes(msgBody.toLowerCase())) {
      await db.from('leads').update({ opted_out: true, opted_out_at: new Date().toISOString() }).eq('id', lead.id);
      return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } });
    }

    // Find or create conversation
    let { data: convo } = await db.from('conversations').select('*').eq('lead_id', lead.id).eq('agent_id', agent.id).eq('channel', 'sms').eq('is_active', true).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!convo) { const { data: nc } = await db.from('conversations').insert({ org_id: orgId, lead_id: lead.id, agent_id: agent.id, channel: 'sms' }).select().single(); convo = nc; }

    // Record inbound
    await db.from('messages').insert({ org_id: orgId, conversation_id: convo!.id, lead_id: lead.id, direction: 'inbound', sender_type: 'lead', channel: 'sms', body: msgBody, status: 'delivered', external_id: msgSid });
    if (convo!.is_human_takeover) return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } });

    // Load context & run AI
    const [msgs, kb, stages, entry] = await Promise.all([
      db.from('messages').select('*').eq('conversation_id', convo!.id).order('created_at', { ascending: true }).limit(20).then(r => r.data ?? []),
      db.from('agent_knowledge_base').select('*').eq('agent_id', agent.id).eq('is_active', true).then(r => r.data ?? []),
      db.from('pipeline_stages').select('*').eq('org_id', orgId).order('position', { ascending: true }).then(r => r.data ?? []),
      db.from('lead_pipeline_entries').select('*, pipeline_stages(*)').eq('lead_id', lead.id).maybeSingle().then(r => r.data),
    ]);

    const ctx: AgentContext = { organization: org, agent: agent as any, lead: lead as any, conversation: convo as any, recentMessages: msgs as any, knowledgeBase: kb as any, pipelineStages: stages as any, currentStage: (entry as any)?.pipeline_stages ?? null };
    const result = await getAgentEngine().processMessage(msgBody, ctx);
    if (result.ok) await new ActionExecutor({ db, agent: agent as any, lead: lead as any, conversation: convo as any, orgId }).executeAll(result.value);

    return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } });
  } catch (e) { console.error('Twilio webhook error:', e); return new NextResponse('<Response></Response>', { status: 200, headers: { 'Content-Type': 'text/xml' } }); }
}
