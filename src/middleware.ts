import { createClient } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/update-password',
  '/api/auth/callback',
  '/api/auth/signup',     // authenticated but handles its own auth check
  '/privacy',
  '/terms',
  '/api/leads/capture',
  '/api/webhooks',
];

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route) => path.startsWith(route));
}

function isAuthPage(path: string): boolean {
  return ['/login', '/signup', '/forgot-password'].some((p) => path.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const path = request.nextUrl.pathname;

  // Always allow public routes through (to refresh cookies/session)
  const { data: { user } } = await supabase.auth.getUser();

  // Allow all public routes
  if (isPublicRoute(path)) {
    // Redirect authenticated users away from login/signup (but not from update-password)
    if (user && isAuthPage(path)) {
      return NextResponse.redirect(new URL('/overview', request.url));
    }
    return response;
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const url = new URL('/login', request.url);
    // Preserve the intended destination
    if (path !== '/') {
      url.searchParams.set('next', path);
    }
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - widget.js (embeddable widget)
     * - Public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|widget.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
