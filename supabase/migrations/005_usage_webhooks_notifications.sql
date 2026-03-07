-- ============================================================================
-- 005: Domain events, usage tracking, audit, webhooks, notifications
-- ============================================================================

CREATE TABLE public.domain_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, aggregate_type TEXT NOT NULL, aggregate_id UUID NOT NULL,
  payload JSONB NOT NULL, status public.event_status NOT NULL DEFAULT 'pending',
  retry_count INT NOT NULL DEFAULT 0, max_retries INT NOT NULL DEFAULT 3,
  error_message TEXT, processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_events_pending ON public.domain_events(status, created_at) WHERE status IN ('pending','failed');

CREATE TABLE public.usage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL, period_end DATE NOT NULL,
  conversations_count INT NOT NULL DEFAULT 0, messages_inbound INT NOT NULL DEFAULT 0, messages_outbound INT NOT NULL DEFAULT 0,
  ai_tokens_input BIGINT NOT NULL DEFAULT 0, ai_tokens_output BIGINT NOT NULL DEFAULT 0, ai_requests INT NOT NULL DEFAULT 0,
  sms_segments_sent INT NOT NULL DEFAULT 0, email_sends INT NOT NULL DEFAULT 0,
  total_cost_cents INT NOT NULL DEFAULT 0, stripe_reported BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, period_start)
);

CREATE TABLE public.usage_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  conversations INT NOT NULL DEFAULT 0, messages INT NOT NULL DEFAULT 0,
  appointments INT NOT NULL DEFAULT 0, leads_created INT NOT NULL DEFAULT 0, leads_converted INT NOT NULL DEFAULT 0,
  ai_tokens BIGINT NOT NULL DEFAULT 0, cost_cents INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, date)
);

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES public.organizations(id),
  user_id UUID REFERENCES auth.users(id),
  actor_type TEXT NOT NULL, action TEXT NOT NULL, resource_type TEXT NOT NULL, resource_id UUID,
  changes JSONB, ip_address INET, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL, secret TEXT NOT NULL, events TEXT[] NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  endpoint_id UUID NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.domain_events(id),
  event_type TEXT NOT NULL, payload JSONB NOT NULL,
  response_status INT, response_body TEXT, attempt INT NOT NULL DEFAULT 1,
  delivered_at TIMESTAMPTZ, next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id),
  type TEXT NOT NULL, title TEXT NOT NULL, body TEXT,
  data JSONB DEFAULT '{}', read BOOLEAN NOT NULL DEFAULT false, read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notif_user ON public.notifications(user_id, read, created_at DESC);
