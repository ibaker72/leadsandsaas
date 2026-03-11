function env(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (!val) throw new Error(`Missing env: ${key}`);
  return val;
}

export const config = {
  app: {
    name: 'LeadsAndSaaS',
    url: env('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
    env: env('NODE_ENV', 'development') as 'development' | 'production' | 'test',
    isDev: process.env.NODE_ENV !== 'production',
  },
  supabase: {
    url: env('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: env('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceKey: env('SUPABASE_SERVICE_ROLE_KEY'),
  },
  anthropic: { apiKey: env('ANTHROPIC_API_KEY'), defaultModel: 'claude-sonnet-4-20250514', maxTokens: 1024 },
  stripe: {
    secretKey: env('STRIPE_SECRET_KEY'),
    webhookSecret: env('STRIPE_WEBHOOK_SECRET'),
    publishableKey: env('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  },
  twilio: { accountSid: env('TWILIO_ACCOUNT_SID'), authToken: env('TWILIO_AUTH_TOKEN') },
  resend: { apiKey: env('RESEND_API_KEY'), fromDomain: process.env.RESEND_FROM_DOMAIN ?? 'notifications.leadsandsaas.com' },
  sentry: { dsn: process.env.NEXT_PUBLIC_SENTRY_DSN },
  limits: { maxContextMessages: 20, maxKnowledgeEntries: 100, apiRateLimit: 60, maxWebhookRetries: 3 },
} as const;
