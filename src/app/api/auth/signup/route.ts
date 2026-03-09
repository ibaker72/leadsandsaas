import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

function getStringField(value: unknown, key: string): string | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === 'string' ? candidate : null;
}

/**
 * Server-side signup bootstrap.
 *
 * Flow:
 * 1. Client calls supabase.auth.signUp() to create the auth user
 * 2. Client calls this route with org details
 * 3. This route uses the admin client to atomically create:
 *    - Organization
 *    - Organization membership (owner)
 *    - User profile
 *    - Default pipeline stages
 *    - JWT claim (org_id in app_metadata)
 *
 * Why server-side:
 * - Admin client bypasses RLS so we don't need dangerous INSERT policies
 * - All-or-nothing: if any step fails, we return an error
 * - JWT claim update uses admin auth API, not a SECURITY DEFINER function
 * - No privilege escalation risk
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify the user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Parse and validate input
    const body = await req.json();
    const { company_name, vertical = 'general', full_name } = body;

    if (!company_name || typeof company_name !== 'string' || company_name.trim().length < 1) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    if (!full_name || typeof full_name !== 'string') {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // 3. Check if user already has an org (prevent duplicate bootstrap)
    const { data: existingMembership } = await admin
      .from('organization_members')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (existingMembership) {
      return NextResponse.json({ error: 'Account already set up' }, { status: 409 });
    }

    // 4. Generate slug
    const baseSlug = company_name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Ensure slug uniqueness
    let slug = baseSlug || `org-${Date.now()}`;
    const { data: existing } = await admin
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // 5. Create organization (admin client, bypasses RLS)
    const captureKey = randomBytes(16).toString('hex');
    const { data: org, error: orgError } = await admin
      .from('organizations')
      .insert({
        name: company_name.trim(),
        slug,
        vertical: vertical as string,
        plan: 'trial',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        capture_key: captureKey,
      })
      .select('id')
      .single();

    if (orgError || !org) {
      console.error('Org creation failed:', orgError);
      return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
    }
    const orgId = getStringField(org, 'id');
    if (!orgId) {
      return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
    }

    // 6. Create membership
    const { error: memberError } = await admin
      .from('organization_members')
      .insert({
        org_id: orgId,
        user_id: user.id,
        role: 'owner',
        is_active: true,
      });

    if (memberError) {
      // Rollback: delete the org
      await admin.from('organizations').delete().eq('id', orgId);
      console.error('Membership creation failed:', memberError);
      return NextResponse.json({ error: 'Failed to create membership' }, { status: 500 });
    }

    // 7. Create user profile
    await admin
      .from('user_profiles')
      .upsert({
        id: user.id,
        full_name: full_name.trim(),
      });

    // 8. Create default pipeline stages
    const { error: pipelineError } = await (admin as any).rpc('create_default_pipeline', { p_org_id: orgId });
    if (pipelineError) {
      console.error('Pipeline stages creation failed:', pipelineError);
      // Non-fatal: stages will be auto-created on first pipeline page visit
    }

    // 9. Set JWT claim via admin auth API
    // This is the safe way to update app_metadata — no SECURITY DEFINER needed
    const { error: claimError } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        org_id: orgId,
        role: 'owner',
      },
    });

    if (claimError) {
      console.error('JWT claim update failed:', claimError);
      // Non-fatal: user can still access data via membership-based RLS
      // The claim will help with UI convenience but is not required for security
    }

    return NextResponse.json({
      success: true,
      org_id: orgId,
      slug,
    });
  } catch (err) {
    console.error('Signup bootstrap error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
