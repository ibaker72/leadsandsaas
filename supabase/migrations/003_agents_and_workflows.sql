-- ============================================================================
-- 003: Agents, knowledge base, templates, workflows
-- ============================================================================

CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, description TEXT,
  vertical public.vertical_type NOT NULL DEFAULT 'general',
  status public.agent_status NOT NULL DEFAULT 'draft',
  system_prompt_override TEXT,
  personality JSONB NOT NULL DEFAULT '{"tone":"professional_friendly","urgency_level":"medium","empathy_level":"high","formality":"business_casual","language":"en"}'::jsonb,
  rules JSONB NOT NULL DEFAULT '{"can_book_appointments":true,"can_offer_discounts":false,"max_discount_pct":0,"escalation_triggers":["angry","legal_threat","competitor_mention"],"required_qualification_fields":["service_needed","timeline","budget_range"],"follow_up_cadence_hours":[1,24,72,168],"max_follow_ups":5}'::jsonb,
  channels JSONB NOT NULL DEFAULT '{"sms":{"enabled":true,"twilio_number":null},"email":{"enabled":true,"from_address":null,"from_name":null},"voice":{"enabled":false},"web_chat":{"enabled":false}}'::jsonb,
  stats JSONB NOT NULL DEFAULT '{"total_conversations":0,"total_appointments_booked":0,"total_leads_converted":0,"avg_response_time_seconds":0,"avg_messages_to_conversion":0}'::jsonb,
  model_config JSONB NOT NULL DEFAULT '{"model":"claude-sonnet-4-20250514","max_tokens":1024,"temperature":0.7}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_agents_org ON public.agents(org_id, status);

CREATE TABLE public.agent_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL, content TEXT NOT NULL, content_type TEXT NOT NULL DEFAULT 'text',
  metadata JSONB DEFAULT '{}', is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.agent_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical public.vertical_type NOT NULL, name TEXT NOT NULL, description TEXT,
  system_prompt TEXT NOT NULL, personality JSONB NOT NULL, rules JSONB NOT NULL,
  sample_knowledge JSONB DEFAULT '[]', is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.workflow_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, trigger_event TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true,
  steps JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflow_sequences(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL,
  current_step INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running',
  next_run_at TIMESTAMPTZ, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_wf_exec_run ON public.workflow_executions(next_run_at) WHERE status = 'running';
