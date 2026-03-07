import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient as createAdminSupabase, verifyInternalAuth } from '@/lib/supabase/admin';
import { getChannelAdapter } from '@/lib/comms/channels';
import type { ChannelType, MessageSenderType } from '@/lib/types/domain';

function getStringField(value: unknown, key: string): string | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === 'string' ? candidate : null;
}

function getBooleanField(value: unknown, key: string): boolean {
  if (!value || typeof value !== 'object') return false;
  return (value as Record<string, unknown>)[key] === true;
}

export async function POST(req: NextRequest) {
  if (!verifyInternalAuth(req.headers.get('authorization'))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { org_id, lead_id, conversation_id, channel, message, subject, sender_type = 'system', agent_id } = await req.json();
    const db = createAdminSupabase();
    const { data: lead } = await db.from('leads').select('phone_e164, email, opted_out, sms_consent, email_consent').eq('id', lead_id).single();
    if (!lead || getBooleanField(lead, 'opted_out')) return NextResponse.json({ error: 'Unavailable' }, { status: 400 });
    if (channel === 'sms' && !getBooleanField(lead, 'sms_consent')) return NextResponse.json({ error: 'No SMS consent' }, { status: 400 });

    const fromAddr = channel === 'sms' ? process.env.TWILIO_DEFAULT_NUMBER! : `noreply@${process.env.RESEND_FROM_DOMAIN || 'leadsandsaas.com'}`;
    const to = channel === 'sms' ? getStringField(lead, 'phone_e164') : getStringField(lead, 'email');
    if (!to) return NextResponse.json({ error: 'Lead missing destination address' }, { status: 400 });
    const adapter = getChannelAdapter(channel as ChannelType);
    const result = await adapter.send({ to, from: fromAddr, body: message, subject });
    if (!result.ok) return NextResponse.json({ error: result.error.message }, { status: 502 });

    if (conversation_id) await db.from('messages').insert({ org_id, conversation_id, lead_id, direction: 'outbound', sender_type: sender_type as MessageSenderType, sender_id: agent_id, channel, body: message, status: result.value.status, external_id: result.value.externalId, cost_cents: result.value.costCents });
    return NextResponse.json({ success: true, external_id: result.value.externalId });
  } catch (e) { console.error('Send error:', e); return NextResponse.json({ error: 'Internal error' }, { status: 500 }); }
}
