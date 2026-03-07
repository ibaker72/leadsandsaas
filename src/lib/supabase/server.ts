import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/db/database.types';

/**
 * Creates a Supabase client for Server Components and Server Actions.
 * Uses the anon key and respects RLS via the user's session cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Cannot set cookies in Server Components — only in Server Actions and Route Handlers.
            // This is expected and safe to ignore.
          }
        },
      },
    }
  );
}

/**
 * Get the authenticated user (verified server-side, not from JWT cache).
 * Returns null if not authenticated.
 */
export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Get the org_id from the user's JWT claims.
 * NOTE: This is a convenience hint for UI display, NOT for security.
 * All data access must go through RLS (membership-based), not this value.
 */
export async function getOrgIdHint(): Promise<string | null> {
  const user = await getUser();
  return (user?.app_metadata?.org_id as string) ?? null;
}
