import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

export const GET = withAuth(async (_req: NextRequest, ctx) => {
  try {
    const admin = createAdminClient();

    const { data: org, error } = await admin
      .from('organizations')
      .select('settings')
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

    return NextResponse.json({
      integrations: {
        twilio: integrations.twilio ?? {},
        resend: integrations.resend ?? {},
        webhooks: integrations.webhooks ?? {},
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, { requiredRole: 'admin' });

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

    // Merge new config under the provider key
    const updatedSettings = {
      ...settings,
      integrations: {
        ...integrations,
        [provider]: config,
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
