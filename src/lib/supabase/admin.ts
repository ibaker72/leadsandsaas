import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/db/database.types';
import { timingSafeEqual } from 'crypto';

/**
 * Service-role admin client. Bypasses RLS.
 * ONLY use on the server side. NEVER expose to the browser.
 */
let adminClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function createAdminClient() {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  adminClient = createSupabaseClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return adminClient;
}

/**
 * Timing-safe comparison for internal API authentication.
 * Use this instead of === for comparing secrets.
 */
export function verifyInternalAuth(authHeader: string | null): boolean {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!authHeader || !serviceKey) return false;

  const token = authHeader.replace('Bearer ', '');

  try {
    const a = Buffer.from(token);
    const b = Buffer.from(serviceKey);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
