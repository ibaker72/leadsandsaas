import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async () => {
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: events } = await db.from('domain_events').select('*').in('status', ['pending','failed']).lt('retry_count', 3).order('created_at', { ascending: true }).limit(50);
  if (!events?.length) return new Response(JSON.stringify({ processed: 0 }));

  let processed = 0, failed = 0;
  for (const event of events) {
    await db.from('domain_events').update({ status: 'processing' }).eq('id', event.id);
    try {
      // Dispatch by event type
      if (event.event_type === 'lead.created') {
        const { data: wf } = await db.from('workflow_sequences').select('*').eq('trigger_event', 'lead.new').eq('is_active', true).limit(1).maybeSingle();
        if (wf?.steps?.length) await db.from('workflow_executions').insert({ workflow_id: wf.id, org_id: event.org_id, lead_id: event.aggregate_id, status: 'running', next_run_at: new Date(Date.now() + (wf.steps[0].delay_hours||0)*3600000).toISOString() });
      }
      if (event.event_type === 'lead.opted_out') {
        await db.from('workflow_executions').update({ status: 'cancelled' }).eq('lead_id', event.aggregate_id).eq('status', 'running');
        await db.from('conversations').update({ is_active: false }).eq('lead_id', event.aggregate_id).eq('is_active', true);
      }
      // Deliver webhooks
      const { data: endpoints } = await db.from('webhook_endpoints').select('*').eq('org_id', event.org_id).eq('is_active', true).contains('events', [event.event_type]);
      for (const ep of endpoints || []) {
        const payload = JSON.stringify({ event_type: event.event_type, data: event.payload, timestamp: new Date().toISOString() });
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey('raw', encoder.encode(ep.secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const sig = Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)))).map(b => b.toString(16).padStart(2, '0')).join('');
        try {
          const r = await fetch(ep.url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-LeadSaaS-Signature': sig }, body: payload });
          await db.from('webhook_deliveries').insert({ org_id: event.org_id, endpoint_id: ep.id, event_id: event.id, event_type: event.event_type, payload: JSON.parse(payload), response_status: r.status, delivered_at: r.ok ? new Date().toISOString() : null });
        } catch {}
      }
      await db.from('domain_events').update({ status: 'completed', processed_at: new Date().toISOString() }).eq('id', event.id);
      processed++;
    } catch (e) {
      await db.from('domain_events').update({ status: event.retry_count+1>=3?'dead_letter':'failed', retry_count: event.retry_count+1, error_message: (e as Error).message }).eq('id', event.id);
      failed++;
    }
  }
  return new Response(JSON.stringify({ processed, failed }));
});
