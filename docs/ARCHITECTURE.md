# LeadSaaS — AI Sales Agent Platform Architecture

## Stack
- **Frontend**: Next.js 15 (App Router, Server Components)
- **Database**: Supabase (Postgres + RLS + Realtime)
- **AI Engine**: Anthropic Claude (tool_use for structured actions)
- **SMS/Voice**: Twilio
- **Email**: Resend
- **Payments**: Stripe (subscription + usage metering)
- **Monitoring**: Sentry
- **Integrations**: Zapier webhooks

## Domain Model
Organization → Users (RBAC) → Agents (AI) → Leads → Conversations → Messages → Appointments → Pipeline

## Key Patterns
1. **Multi-tenancy via RLS** — every table has org_id, enforced at DB level
2. **AI Agent Loop**: Inbound → Channel Adapter → Agent Router → Context Builder → LLM (Claude tool_use) → Action Parser → Action Executor → Response Dispatcher
3. **Layered Prompts**: Base behavior → Vertical knowledge → Business KB → Conversation context → Available actions
4. **Event-Driven Architecture**: Transactional outbox pattern via domain_events table
5. **Result-based Error Handling**: No thrown exceptions in business logic

## Billing Tiers
- Starter ($29/mo): 1 agent, 500 convos, 1 user
- Growth ($79/mo): 3 agents, 2,500 convos, 5 users
- Scale ($149/mo): unlimited agents, unlimited convos, unlimited users
- See `src/lib/billing/pricing-config.ts` for the single source of truth.

## Getting Started
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill values
3. `npx supabase db push` (run migrations)
4. `npm run db:types` (generate TypeScript types)
5. `npm run dev`
6. Set Twilio webhook to `YOUR_URL/api/webhooks/twilio`
7. Set Stripe webhook to `YOUR_URL/api/webhooks/stripe`
8. Deploy edge functions: `supabase functions deploy process-events run-follow-ups send-reminders`
