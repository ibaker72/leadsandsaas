-- ============================================================================
-- 004: Leads, conversations, messages, appointments, pipeline
-- ============================================================================

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  first_name TEXT, last_name TEXT, email TEXT, phone TEXT, phone_e164 TEXT,
  status public.lead_status NOT NULL DEFAULT 'new',
  source public.lead_source NOT NULL DEFAULT 'web_form',
  score INT DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  qualification JSONB NOT NULL DEFAULT '{"service_needed":null,"timeline":null,"budget_range":null,"location":null,"property_type":null,"urgency":null,"decision_maker":null,"notes":[]}'::jsonb,
  source_metadata JSONB DEFAULT '{}', tags TEXT[] DEFAULT '{}',
  sms_consent BOOLEAN NOT NULL DEFAULT false, sms_consent_at TIMESTAMPTZ,
  email_consent BOOLEAN NOT NULL DEFAULT false, email_consent_at TIMESTAMPTZ,
  opted_out BOOLEAN NOT NULL DEFAULT false, opted_out_at TIMESTAMPTZ,
  first_contacted_at TIMESTAMPTZ, last_contacted_at TIMESTAMPTZ, converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_leads_org ON public.leads(org_id, status);
CREATE INDEX idx_leads_phone ON public.leads(phone_e164);
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_tags ON public.leads USING gin(tags);

-- Add FK from workflow_executions now that leads table exists
ALTER TABLE public.workflow_executions
  ADD CONSTRAINT fk_wf_lead FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  channel public.channel_type NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true, is_human_takeover BOOLEAN NOT NULL DEFAULT false,
  human_agent_id UUID REFERENCES auth.users(id),
  summary TEXT, summary_updated_at TIMESTAMPTZ,
  message_count INT NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ, last_inbound_at TIMESTAMPTZ, last_outbound_at TIMESTAMPTZ,
  twilio_sid TEXT, thread_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_convos_org ON public.conversations(org_id, is_active, last_message_at DESC);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  direction public.message_direction NOT NULL,
  sender_type public.message_sender_type NOT NULL,
  sender_id UUID, channel public.channel_type NOT NULL,
  body TEXT NOT NULL, body_html TEXT, ai_metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'sent', error_message TEXT, external_id TEXT, cost_cents INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_msgs_convo ON public.messages(conversation_id, created_at);
CREATE INDEX idx_msgs_external ON public.messages(external_id);

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id),
  conversation_id UUID REFERENCES public.conversations(id),
  title TEXT NOT NULL, description TEXT, service_type TEXT,
  status public.appointment_status NOT NULL DEFAULT 'scheduled',
  starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  location TEXT, is_virtual BOOLEAN NOT NULL DEFAULT false, meeting_url TEXT,
  reminder_sent_24h BOOLEAN NOT NULL DEFAULT false, reminder_sent_1h BOOLEAN NOT NULL DEFAULT false,
  notes TEXT, cancelled_reason TEXT, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_appts_time ON public.appointments(org_id, starts_at);

CREATE TABLE public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, description TEXT, position INT NOT NULL, color TEXT DEFAULT '#6366f1',
  is_win_stage BOOLEAN NOT NULL DEFAULT false, is_loss_stage BOOLEAN NOT NULL DEFAULT false,
  auto_actions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, position)
);

CREATE TABLE public.lead_pipeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE UNIQUE,
  stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE CASCADE,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), estimated_value NUMERIC(12,2), notes TEXT
);

CREATE TABLE public.pipeline_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  from_stage_id UUID REFERENCES public.pipeline_stages(id),
  to_stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id),
  triggered_by TEXT NOT NULL, reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
