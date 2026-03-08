import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

// ---------------------------------------------------------------------------
// Secret-field definitions per provider
// ---------------------------------------------------------------------------
const SECRET_FIELDS: Record<string, string[]> = {
  twilio: ['authToken'],
  resend: ['apiKey'],
  webhooks: ['secret'],
};

/** Mask a secret value → "••••last4" or boolean indicator */
function maskSecret(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) return null;
  if (value.length <= 4) return '••••';
  return '••••' + value.slice(-4);
}

/** Return a safe view of a provider config — secrets replaced with masked hints */
function maskProvider(provider: string, config: Record<string, unknown>): Record<string, unknown> {
  const secretKeys = SECRET_FIELDS[provider] ?? [];
  const masked: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(config)) {
    if (secretKeys.includes(k)) {
      // Replace raw secret with masked indicator + boolean flag
      masked[k] = maskSecret(v);
      masked[`has_${k}`] = typeof v === 'string' && v.length > 0;
    } else {
      masked[k] = v;
    }
  }
  return masked;
}

// ---------------------------------------------------------------------------
// GET — return integration config with secrets masked
// ---------------------------------------------------------------------------
export const GET = withAuth(async (_req: NextRequest, ctx) => {
  try {
    const admin = createAdminClient();

    const { data: org, error } = await admin
      .from('organizations')
      .select('settings, capture_key')
      .eq('id', ctx.orgId)
      .single();

    if (error || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    const settings = (org.settings as Record<string, unknown>) ?? {};
    const integrations = (settings.integrations as Record<string, unknown>) ?? {};

    const twilio = (integrations.twilio as Record<string, unknown>) ?? {};
    const resend = (integrations.resend as Record<string, unknown>) ?? {};
    const webhooks = (integrations.webhooks as Record<string, unknown>) ?? {};

    return NextResponse.json({
      integrations: {
        twilio: maskProvider('twilio', twilio),
        resend: maskProvider('resend', resend),
        webhooks: maskProvider('webhooks', webhooks),
      },
      capture_key: (org as Record<string, unknown>).capture_key ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, { requiredRole: 'admin' });

// ---------------------------------------------------------------------------
// POST — merge config safely; empty-string secret fields are ignored (not wiped)
// ---------------------------------------------------------------------------
export const POST = withAuth(async (req: NextRequest, ctx) => {
  try {
    const { provider, config } = await req.json();

    const validProviders = ['twilio', 'resend', 'webhooks'];
    if (!provider || !validProviders.includes(provider)) {
      return NextResponse.json(
        { error: 'provider must be one of: twilio, resend, webhooks' },
        { status: 400 }
      );
    }

    if (!config || typeof config !== 'object') {
      return NextResponse.json(
        { error: 'config must be an object' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Read current settings
    const { data: org, error: readError } = await admin
      .from('organizations')
      .select('settings')
      .eq('id', ctx.orgId)
      .single();

    if (readError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    const settings = (org.settings as Record<string, unknown>) ?? {};
    const integrations = (settings.integrations as Record<string, unknown>) ?? {};
    const existing = (integrations[provider] as Record<string, unknown>) ?? {};

    // Deep-merge: start with existing, layer incoming on top.
    // Secret fields that arrive as empty string are skipped (preserves existing).
    const secretKeys = SECRET_FIELDS[provider] ?? [];
    const merged: Record<string, unknown> = { ...existing };
    for (const [k, v] of Object.entries(config as Record<string, unknown>)) {
      // Skip masked placeholder values that the UI might echo back
      if (typeof v === 'string' && v.startsWith('••••')) continue;
      // Skip empty-string secret fields — prevents accidental wipe
      if (secretKeys.includes(k) && v === '') continue;
      merged[k] = v;
    }

    const updatedSettings = {
      ...settings,
      integrations: {
        ...integrations,
        [provider]: merged,
      },
    };

    const { error: updateError } = await admin
      .from('organizations')
      .update({ settings: updatedSettings })
      .eq('id', ctx.orgId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update integration settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, { requiredRole: 'admin' });
