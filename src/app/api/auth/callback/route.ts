import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth callback handler.
 *
 * Supabase redirects here after:
 * - Email confirmation (signup)
 * - Password reset email link click
 * - OAuth callbacks (future)
 *
 * The URL contains a `code` parameter that must be exchanged for a session.
 * The `next` parameter controls where to redirect after exchange.
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
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error.message);
      const errorUrl = new URL('/login', origin);
      errorUrl.searchParams.set('error', 'Your link has expired. Please try again.');
      return NextResponse.redirect(errorUrl);
    }

    // Successful code exchange — redirect to destination
    const redirectUrl = new URL(next, origin);
    return NextResponse.redirect(redirectUrl);
  }

  // No code present — redirect to login
  return NextResponse.redirect(new URL('/login', origin));
}
