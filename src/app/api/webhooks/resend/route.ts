import { NextRequest, NextResponse } from 'next/server';
import { verifyResendSignature } from '@/lib/comms/verify';
import { createAdminSupabase } from '@/lib/db/supabase';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('resend-signature') ?? '';
  if (process.env.RESEND_WEBHOOK_SECRET && !verifyResendSignature(body, sig)) return NextResponse.json({ error: 'Invalid' }, { status: 403 });
  try {
    const event = JSON.parse(body);
    const db = createAdminSupabase();
    if (event.type === 'email.delivered' || event.type === 'email.bounced' || event.type === 'email.complained') {
      const status = event.type === 'email.delivered' ? 'delivered' : event.type === 'email.bounced' ? 'bounced' : 'complained';
      await db.from('messages').update({ status }).eq('external_id', event.data?.email_id);
    }
    return NextResponse.json({ received: true });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
