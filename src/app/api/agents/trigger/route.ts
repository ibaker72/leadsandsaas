import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient as createAdminSupabase, verifyInternalAuth } from '@/lib/supabase/admin';
import { getAgentEngine, type AgentContext } from '@/lib/ai/engine';
import { ActionExecutor } from '@/lib/ai/executor';

export async function POST(req: NextRequest) {
  if (!verifyInternalAuth(req.headers.get('authorization'))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { lead_id, agent_id, conversation_id, trigger, step_number, total_steps } = await req.json();
    const db = createAdminSupabase();
    const [{ data: lead }, { data: agent }] = await Promise.all([db.from('leads').select('*').eq('id', lead_id).single(), db.from('agents').select('*').eq('id', agent_id).single()]);
    if (!lead || !agent) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const { data: org } = await db.from('organizations').select('*').eq('id', agent.org_id).single();
    if (!org) return NextResponse.json({ error: 'No org' }, { status: 404 });

    let convId = conversation_id;
    if (!convId) { const { data: c } = await db.from('conversations').select('id').eq('lead_id', lead_id).eq('is_active', true).order('created_at', { ascending: false }).limit(1).maybeSingle(); convId = c?.id; }
    if (!convId) { const ch = lead.phone_e164 && lead.sms_consent ? 'sms' : 'email'; const { data: nc } = await db.from('conversations').insert({ org_id: org.id, lead_id, agent_id, channel: ch }).select('id').single(); convId = nc?.id; }
    const { data: convo } = await db.from('conversations').select('*').eq('id', convId).single();
    if (!convo) return NextResponse.json({ error: 'No conversation' }, { status: 500 });

    const [msgs, kb, stages, entry] = await Promise.all([
      db.from('messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true }).limit(20).then(r => r.data ?? []),
      db.from('agent_knowledge_base').select('*').eq('agent_id', agent_id).eq('is_active', true).then(r => r.data ?? []),
      db.from('pipeline_stages').select('*').eq('org_id', org.id).order('position', { ascending: true }).then(r => r.data ?? []),
      db.from('lead_pipeline_entries').select('*, pipeline_stages(*)').eq('lead_id', lead_id).maybeSingle().then(r => r.data),
    ]);

    let prompt = trigger === 'new_lead_outreach' ? 'NEW lead from website. Send warm personalized first message, ask a qualifying question.'
      : trigger === 'follow_up' ? `Follow-up #${step_number} of ${total_steps}. Lead hasn't responded. Try a different angle.`
      : 'Generate appropriate outreach.';

    const ctx: AgentContext = { organization: org as any, agent: agent as any, lead: lead as any, conversation: convo as any, recentMessages: msgs as any, knowledgeBase: kb as any, pipelineStages: stages as any, currentStage: (entry as any)?.pipeline_stages ?? null };
    const result = await getAgentEngine().processMessage(prompt, ctx);
    if (!result.ok) return NextResponse.json({ error: result.error.message }, { status: 500 });
    await new ActionExecutor({ db, agent: agent as any, lead: lead as any, conversation: convo as any, orgId: org.id }).executeAll(result.value);
    return NextResponse.json({ success: true, actions: result.value.actions.length });
  } catch (e) { console.error('Trigger error:', e); return NextResponse.json({ error: 'Internal error' }, { status: 500 }); }
}
