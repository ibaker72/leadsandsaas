/**
 * Safe app URL helper for Stripe redirects and external links.
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_APP_URL (explicit, preferred)
 *  2. VERCEL_URL (auto-set on Vercel preview/production)
 *  3. localhost:3000 fallback (dev only)
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

/** Build an absolute URL for a given path */
export function absoluteUrl(path: string): string {
  const base = getAppUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
