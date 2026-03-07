import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async () => {
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const APP_URL = Deno.env.get('APP_URL') || 'https://leadsandsaas.com';
  const now = Date.now(); let sent = 0;

  // 24h reminders
  const in24h = new Date(now + 24*3600000).toISOString();
  const in23h = new Date(now + 23*3600000).toISOString();
  const { data: r24 } = await db.from('appointments').select('*, leads(*), organizations(*)').in('status', ['scheduled','confirmed']).eq('reminder_sent_24h', false).gte('starts_at', in23h).lte('starts_at', in24h);
  for (const apt of r24||[]) {
    const lead = (apt as any).leads;
    if (!lead?.phone_e164 || lead.opted_out || !lead.sms_consent) continue;
    const t = new Date(apt.starts_at).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    await fetch(`${APP_URL}/api/agents/send-message`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
      body: JSON.stringify({ org_id: apt.org_id, lead_id: lead.id, channel: 'sms', message: `Reminder: Your ${apt.service_type||'appointment'} is tomorrow ${t}. Reply YES to confirm.`, sender_type: 'system' }) });
    await db.from('appointments').update({ reminder_sent_24h: true }).eq('id', apt.id);
    sent++;
  }

  // 1h reminders
  const in1h = new Date(now + 3600000).toISOString();
  const in45m = new Date(now + 2700000).toISOString();
  const { data: r1 } = await db.from('appointments').select('*, leads(*)').in('status', ['scheduled','confirmed']).eq('reminder_sent_1h', false).gte('starts_at', in45m).lte('starts_at', in1h);
  for (const apt of r1||[]) {
    const lead = (apt as any).leads;
    if (!lead?.phone_e164 || lead.opted_out || !lead.sms_consent) continue;
    await fetch(`${APP_URL}/api/agents/send-message`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
      body: JSON.stringify({ org_id: apt.org_id, lead_id: lead.id, channel: 'sms', message: `Quick reminder: your appointment is in ~1 hour. See you soon!`, sender_type: 'system' }) });
    await db.from('appointments').update({ reminder_sent_1h: true }).eq('id', apt.id);
    sent++;
  }

  return new Response(JSON.stringify({ sent }));
});
