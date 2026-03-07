-- ============================================================================
-- 002: Organizations, members, profiles
-- ============================================================================

CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  vertical public.vertical_type NOT NULL DEFAULT 'general',
  plan public.org_plan NOT NULL DEFAULT 'trial',
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  settings JSONB NOT NULL DEFAULT '{"timezone":"America/New_York","business_hours":{"start":"09:00","end":"17:00","days":[1,2,3,4,5]},"quiet_hours":{"start":"21:00","end":"08:00"},"auto_assign_agent":true,"default_response_delay_seconds":30,"max_follow_ups":5}'::jsonb,
  limits JSONB NOT NULL DEFAULT '{"max_agents":1,"max_conversations_monthly":500,"max_users":1,"max_knowledge_base_mb":50}'::jsonb,
  metadata JSONB DEFAULT '{}',
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orgs_slug ON public.organizations(slug);
CREATE INDEX idx_orgs_stripe ON public.organizations(stripe_customer_id);

CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.member_role NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

CREATE INDEX idx_members_user ON public.organization_members(user_id, is_active);
CREATE INDEX idx_members_org ON public.organization_members(org_id);

CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  notification_preferences JSONB NOT NULL DEFAULT '{"email_notifications":true,"sms_notifications":false,"escalation_alerts":true,"daily_digest":true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
