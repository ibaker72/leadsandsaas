import { createClient } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/update-password',
  '/features',
  '/pricing',
  '/industries',
  '/about',
  '/privacy',
  '/terms',
  '/api/auth/callback',
  '/api/auth/signup',
  '/api/leads/capture',
  '/api/webhooks',
];

function isPublicRoute(path: string): boolean {
  if (path === '/') return true;
  return PUBLIC_ROUTES.some((route) => path.startsWith(route));
}

function isAuthPage(path: string): boolean {
  return ['/login', '/signup', '/forgot-password'].some((p) => path.startsWith(p));
}

function isDashboardRoute(path: string): boolean {
  const dashboardPaths = ['/overview', '/agents', '/leads', '/conversations', '/appointments', '/pipelines', '/settings', '/billing', '/onboarding'];
  return dashboardPaths.some((p) => path.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const path = request.nextUrl.pathname;

  const { data: { user } } = await supabase.auth.getUser();

  // Allow all public routes
  if (isPublicRoute(path)) {
    if (user && isAuthPage(path)) {
      return NextResponse.redirect(new URL('/overview', request.url));
    }
    return response;
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const url = new URL('/login', request.url);
    if (isDashboardRoute(path)) {
      url.searchParams.set('next', path);
    }
    return NextResponse.redirect(url);
  }

  // Trial expiration check for dashboard routes
  if (isDashboardRoute(path) && path !== '/dashboard/upgrade' && path !== '/billing') {
    const { data: membership } = await supabase
      .from('organization_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle() as { data: { org_id: string } | null };

    if (membership?.org_id) {
      const { data: org } = await supabase
        .from('organizations')
        .select('plan, trial_ends_at, stripe_subscription_id')
        .eq('id', membership.org_id)
        .single() as { data: { plan: string; trial_ends_at: string | null; stripe_subscription_id: string | null } | null };

      if (org) {
        const isTrial = org.plan === 'trial';
        const trialExpired = isTrial && org.trial_ends_at && new Date(org.trial_ends_at) < new Date();
        const hasNoSubscription = !org.stripe_subscription_id;

        if (trialExpired && hasNoSubscription) {
          return NextResponse.redirect(new URL('/dashboard/upgrade', request.url));
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|widget.js|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
