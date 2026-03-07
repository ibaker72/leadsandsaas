import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient as createAdminSupabase } from '@/lib/supabase/admin';
import { DomainEventEmitter } from '@/lib/events/emitter';
import { z } from 'zod';

const schema = z.object({
  org_key: z.string().uuid(), agent_id: z.string().uuid().optional(),
  first_name: z.string().max(100).optional(), last_name: z.string().max(100).optional(),
  email: z.string().email().optional(), phone: z.string().max(20).optional(),
  service_needed: z.string().max(500).optional(), message: z.string().max(2000).optional(),
  sms_consent: z.boolean().optional().default(false), email_consent: z.boolean().optional().default(false),
  utm_source: z.string().optional(), utm_medium: z.string().optional(), utm_campaign: z.string().optional(),
  referrer: z.string().optional(), landing_page: z.string().optional(),
}).refine(d => d.email || d.phone, { message: 'Email or phone required' });

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: cors }); }

function normalizePhone(p: string): string | null {
  let c = p.replace(/[^\d+]/g, '');
  if (c.length === 10) c = '+1' + c;
  else if (c.length === 11 && c.startsWith('1')) c = '+' + c;
  else if (!c.startsWith('+')) c = '+' + c;
  return /^\+[1-9]\d{1,14}$/.test(c) ? c : null;
}

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 422, headers: cors });
    const input = parsed.data;
    const db = createAdminSupabase();
    const { data: org } = await db.from('organizations').select('id, plan, settings').eq('id', input.org_key).single();
    if (!org) return NextResponse.json({ error: 'Invalid organization' }, { status: 404, headers: cors });

    const phoneE164 = input.phone ? normalizePhone(input.phone) : null;
    // Dedup
    if (phoneE164) { const { data } = await db.from('leads').select('id').eq('org_id', org.id).eq('phone_e164', phoneE164).maybeSingle(); if (data) return NextResponse.json({ success: true, lead_id: data.id, existing: true }, { headers: cors }); }
    if (input.email) { const { data } = await db.from('leads').select('id').eq('org_id', org.id).eq('email', input.email).maybeSingle(); if (data) return NextResponse.json({ success: true, lead_id: data.id, existing: true }, { headers: cors }); }

    // Auto-assign agent
    let agentId = input.agent_id;
    if (!agentId) { const { data: a } = await db.from('agents').select('id').eq('org_id', org.id).eq('status', 'active').limit(1).maybeSingle(); agentId = a?.id; }

    const { data: lead, error } = await db.from('leads').insert({
      org_id: org.id, agent_id: agentId, first_name: input.first_name, last_name: input.last_name, email: input.email, phone: input.phone, phone_e164: phoneE164,
      source: 'web_form', sms_consent: input.sms_consent, sms_consent_at: input.sms_consent ? new Date().toISOString() : null, email_consent: input.email_consent, email_consent_at: input.email_consent ? new Date().toISOString() : null,
      qualification: { service_needed: input.service_needed || null, timeline: null, budget_range: null, location: null, property_type: null, urgency: null, decision_maker: null, notes: input.message ? [input.message] : [] },
      source_metadata: { utm_source: input.utm_source, utm_medium: input.utm_medium, utm_campaign: input.utm_campaign, referrer: input.referrer, landing_page: input.landing_page },
    }).select('id').single();
    if (error) throw error;

    await new DomainEventEmitter(db).emit('lead.created', 'lead', lead.id, { source: 'web_form', agent_id: agentId }, org.id);
    return NextResponse.json({ success: true, lead_id: lead.id }, { status: 201, headers: cors });
  } catch (e) { console.error('Capture error:', e); return NextResponse.json({ error: 'Internal error' }, { status: 500, headers: cors }); }
}
