import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient as createAdminSupabase } from '@/lib/supabase/admin';
import { DomainEventEmitter } from '@/lib/events/emitter';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Validation — capture_key is a 32-char hex string, NOT a UUID
// ---------------------------------------------------------------------------
const schema = z.object({
  capture_key: z.string().min(16).max(64),
  agent_id: z.string().uuid().optional(),
  first_name: z.string().max(100).optional(), last_name: z.string().max(100).optional(),
  email: z.string().email().optional(), phone: z.string().max(20).optional(),
  service_needed: z.string().max(500).optional(), message: z.string().max(2000).optional(),
  sms_consent: z.boolean().optional().default(false), email_consent: z.boolean().optional().default(false),
  utm_source: z.string().max(200).optional(), utm_medium: z.string().max(200).optional(), utm_campaign: z.string().max(200).optional(),
  referrer: z.string().max(2000).optional(), landing_page: z.string().max(2000).optional(),
}).refine(d => d.email || d.phone, { message: 'Email or phone required' });

type CaptureInput = {
  capture_key: string;
  agent_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  service_needed?: string;
  message?: string;
  sms_consent: boolean;
  email_consent: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  landing_page?: string;
};

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: cors }); }

// ---------------------------------------------------------------------------
// Lightweight in-memory rate limiter (per IP, sliding window)
// ---------------------------------------------------------------------------
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX = 10;           // max requests per window per IP
const ipHits = new Map<string, number[]>();

// Periodic cleanup every 5 minutes to avoid memory growth
let lastCleanup = Date.now();
function cleanupHits() {
  const now = Date.now();
  if (now - lastCleanup < 300_000) return;
  lastCleanup = now;
  const cutoff = now - RATE_WINDOW_MS;
  for (const [ip, hits] of ipHits.entries()) {
    const valid = hits.filter(t => t > cutoff);
    if (valid.length === 0) ipHits.delete(ip);
    else ipHits.set(ip, valid);
  }
}

function isRateLimited(ip: string): boolean {
  cleanupHits();
  const now = Date.now();
  const cutoff = now - RATE_WINDOW_MS;
  const hits = (ipHits.get(ip) ?? []).filter(t => t > cutoff);
  hits.push(now);
  ipHits.set(ip, hits);
  return hits.length > RATE_MAX;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function hasStringId(value: unknown): value is { id: string } {
  if (!value || typeof value !== 'object') return false;
  return typeof (value as { id?: unknown }).id === 'string';
}

function normalizePhone(p: string): string | null {
  let c = p.replace(/[^\d+]/g, '');
  if (c.length === 10) c = '+1' + c;
  else if (c.length === 11 && c.startsWith('1')) c = '+' + c;
  else if (!c.startsWith('+')) c = '+' + c;
  return /^\+[1-9]\d{1,14}$/.test(c) ? c : null;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: cors });
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 422, headers: cors });
    const input = parsed.data as CaptureInput;
    const db = createAdminSupabase();

    // Look up org by capture_key (NOT by internal UUID)
    const { data: org } = await db.from('organizations').select('id, plan, settings').eq('capture_key', input.capture_key).single();
    if (!hasStringId(org)) return NextResponse.json({ error: 'Invalid capture key' }, { status: 404, headers: cors });
    const orgId = org.id;

    const phoneE164 = input.phone ? normalizePhone(input.phone) : null;
    // Dedup
    if (phoneE164) { const { data } = await db.from('leads').select('id').eq('org_id', orgId).eq('phone_e164', phoneE164).maybeSingle(); if (hasStringId(data)) return NextResponse.json({ success: true, lead_id: data.id, existing: true }, { headers: cors }); }
    if (input.email) { const { data } = await db.from('leads').select('id').eq('org_id', orgId).eq('email', input.email).maybeSingle(); if (hasStringId(data)) return NextResponse.json({ success: true, lead_id: data.id, existing: true }, { headers: cors }); }

    // Auto-assign agent
    let agentId = input.agent_id;
    if (!agentId) { const { data: a } = await db.from('agents').select('id').eq('org_id', orgId).eq('status', 'active').limit(1).maybeSingle(); if (hasStringId(a)) agentId = a.id; }

    const { data: lead, error } = await db.from('leads').insert({
      org_id: orgId, agent_id: agentId, first_name: input.first_name, last_name: input.last_name, email: input.email, phone: input.phone, phone_e164: phoneE164,
      source: 'web_form', sms_consent: input.sms_consent, sms_consent_at: input.sms_consent ? new Date().toISOString() : null, email_consent: input.email_consent, email_consent_at: input.email_consent ? new Date().toISOString() : null,
      qualification: { service_needed: input.service_needed || null, timeline: null, budget_range: null, location: null, property_type: null, urgency: null, decision_maker: null, notes: input.message ? [input.message] : [] },
      source_metadata: { utm_source: input.utm_source, utm_medium: input.utm_medium, utm_campaign: input.utm_campaign, referrer: input.referrer, landing_page: input.landing_page },
    }).select('id').single();
    if (error) throw error;
    if (!hasStringId(lead)) throw new Error('Lead insert did not return an id');

    await new DomainEventEmitter(db).emit('lead.created', 'lead', lead.id, { source: 'web_form', agent_id: agentId }, orgId);

    // Auto-create pipeline entry in first stage
    const { data: firstStage } = await db
      .from('pipeline_stages')
      .select('id')
      .eq('org_id', orgId)
      .order('position', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (hasStringId(firstStage)) {
      await db.from('lead_pipeline_entries').insert({
        org_id: orgId,
        lead_id: lead.id,
        stage_id: firstStage.id,
      });
      await db.from('pipeline_transitions').insert({
        org_id: orgId,
        lead_id: lead.id,
        from_stage_id: null,
        to_stage_id: firstStage.id,
        triggered_by: 'system:lead_capture',
      });
    }

    // Auto-create conversation thread
    const channel = phoneE164 ? 'sms' : input.email ? 'email' : 'web_chat';
    await db.from('conversations').insert({
      org_id: orgId,
      lead_id: lead.id,
      agent_id: agentId || null,
      channel,
      is_active: true,
    });

    return NextResponse.json({ success: true, lead_id: lead.id }, { status: 201, headers: cors });
  } catch (e) { console.error('Capture error:', e); return NextResponse.json({ error: 'Internal error' }, { status: 500, headers: cors }); }
}
