import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env: ${key}`);
  return val;
}

const SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_ANON_KEY = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient<any>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(c: { name: string; value: string; options?: CookieOptions }[]) {
        try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
      },
    },
  });
}

export async function createRouteHandlerSupabase() {
  const cookieStore = await cookies();
  return createServerClient<any>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(c: { name: string; value: string; options?: CookieOptions }[]) {
        c.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
}

let adminClient: SupabaseClient<any> | null = null;
export function createAdminSupabase(): SupabaseClient<any> {
  if (adminClient) return adminClient;
  adminClient = createClient<any>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}

export async function getSession() {
  const supabase = await createServerSupabase();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;
  return session;
}

export async function getOrgId(): Promise<string | null> {
  const session = await getSession();
  return (session?.user?.app_metadata?.org_id as string) ?? null;
}
