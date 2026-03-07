import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async () => {
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const APP_URL = Deno.env.get('APP_URL') || 'https://leadsandsaas.com';
  const { data: execs } = await db.from('workflow_executions').select('*, leads(*)').eq('status', 'running').lte('next_run_at', new Date().toISOString()).limit(100);
  if (!execs?.length) return new Response(JSON.stringify({ processed: 0 }));

  let processed = 0;
  for (const exec of execs) {
    const lead = (exec as any).leads;
    if (!lead || lead.opted_out) { await db.from('workflow_executions').update({ status: 'cancelled' }).eq('id', exec.id); continue; }
    // Check if lead responded
    const { data: recent } = await db.from('messages').select('id').eq('lead_id', lead.id).eq('direction', 'inbound').gt('created_at', exec.updated_at).limit(1).maybeSingle();
    if (recent) { await db.from('workflow_executions').update({ status: 'completed', metadata: { ...exec.metadata, reason: 'lead_responded' } }).eq('id', exec.id); processed++; continue; }
    // AI follow-up
    if (exec.metadata?.type === 'ai_scheduled_follow_up') {
      await fetch(`${APP_URL}/api/agents/send-message`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
        body: JSON.stringify({ org_id: exec.org_id, lead_id: lead.id, conversation_id: exec.metadata.conversation_id, channel: exec.metadata.channel||'sms', message: exec.metadata.message, sender_type: 'ai_agent', agent_id: exec.metadata.agent_id })
      });
      await db.from('workflow_executions').update({ status: 'completed' }).eq('id', exec.id);
    }
    processed++;
  }
  return new Response(JSON.stringify({ processed }));
});
