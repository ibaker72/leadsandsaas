# LeadSaaS

AI Sales Agent Platform — AI agents that handle the full sales cycle for service businesses.

## Quick Start

```bash
npm install
cp .env.example .env.local  # fill in your API keys
npx supabase db push         # run database migrations
npm run db:types             # generate TypeScript types
npm run dev                  # start development server
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full documentation.

## Tech Stack

Next.js 15 · Supabase · Anthropic Claude · Twilio · Resend · Stripe · Sentry
