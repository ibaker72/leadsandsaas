import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { randomBytes } from 'crypto';

/**
 * Auth callback handler.
 *
 * Supabase redirects here after email confirmation, password reset, or OAuth.
 *
 * CRITICAL FIX: For email-confirmed signups, the bootstrap (org creation) cannot
 * happen during signup because there is no session until confirmation. The signup
 * form stores company_name and full_name in user_metadata. After code exchange,
 * we detect first-time users (no org membership) and bootstrap here.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/overview';
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle error redirects from Supabase (e.g., expired link)
  if (errorParam) {
    const errorUrl = new URL('/login', origin);
    errorUrl.searchParams.set('error', errorDescription || errorParam);
    return NextResponse.redirect(errorUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error.message);
      const errorUrl = new URL('/login', origin);
      errorUrl.searchParams.set('error', 'Your link has expired. Please try again.');
      return NextResponse.redirect(errorUrl);
    }

    // Auto-bootstrap for email-confirmed signups
    const user = sessionData?.user;
    if (user) {
      try {
        const admin = createAdminClient();

        const { data: existingMembership } = await admin
          .from('organization_members')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        // No membership = first-time email-confirmed signup
        if (!existingMembership) {
          const meta = user.user_metadata || {};
          const companyName = meta.company_name || meta.full_name || 'My Organization';
          const fullName = meta.full_name || '';
          const vertical = meta.vertical || 'general';

          const baseSlug = companyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          let slug = baseSlug || `org-${Date.now()}`;
          const { data: existingSlug } = await admin.from('organizations').select('id').eq('slug', slug).maybeSingle();
          if (existingSlug) slug = `${slug}-${Date.now().toString(36)}`;

          const captureKey = randomBytes(16).toString('hex');
          const { data: org, error: orgError } = await admin
            .from('organizations')
            .insert({
              name: companyName.trim(),
              slug,
              vertical,
              plan: 'trial',
              trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              capture_key: captureKey,
            })
            .select('id')
            .single();

          if (orgError || !org) {
            console.error('Callback bootstrap - org creation failed:', orgError);
          } else {
            const orgId = org.id as string;
            const { error: memberError } = await admin.from('organization_members').insert({
              org_id: orgId, user_id: user.id, role: 'owner', is_active: true,
            });

            if (memberError) {
              await admin.from('organizations').delete().eq('id', orgId);
              console.error('Callback bootstrap - membership failed:', memberError);
            } else {
              await admin.from('user_profiles').upsert({ id: user.id, full_name: fullName.trim() });
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { error: plErr } = await (admin as any).rpc('create_default_pipeline', { p_org_id: orgId });
              if (plErr) console.error('Callback bootstrap - pipeline failed (non-fatal):', plErr);
              await admin.auth.admin.updateUserById(user.id, {
                app_metadata: { org_id: orgId, role: 'owner' },
              }).catch((e: unknown) => console.error('Callback bootstrap - JWT claim failed (non-fatal):', e));

              console.log('Callback bootstrap complete for user:', user.id, 'org:', orgId);
              return NextResponse.redirect(new URL('/onboarding', origin));
            }
          }
        }
      } catch (err) {
        console.error('Callback bootstrap error (non-fatal):', err);
      }
    }

    const redirectUrl = new URL(next, origin);
    return NextResponse.redirect(redirectUrl);
  }

  // No code present — redirect to login
  return NextResponse.redirect(new URL('/login', origin));
}
