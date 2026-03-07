-- ============================================================================
-- 007: RLS Policies and Triggers
--
-- ARCHITECTURE DECISION: All org-scoped access is controlled via
-- organization_members + auth.uid(). JWT claims are NOT used for security.
--
-- Pattern for org-scoped tables:
--   USING (org_id IN (
--     SELECT om.org_id FROM public.organization_members om
--     WHERE om.user_id = auth.uid() AND om.is_active = true
--   ))
--
-- This subquery is fast with idx_members_user and cached per-statement.
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_pipeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ORGANIZATIONS
-- Users can read orgs they are members of. No direct insert/update via client.
-- (Bootstrap uses admin client which bypasses RLS.)
-- ============================================================================

CREATE POLICY "org_select" ON public.organizations
  FOR SELECT USING (
    id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
  );

-- Owners/admins can update their org
CREATE POLICY "org_update" ON public.organizations
  FOR UPDATE USING (
    id IN (
      SELECT om.org_id FROM public.organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true AND om.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    id IN (
      SELECT om.org_id FROM public.organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true AND om.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- ORGANIZATION MEMBERS
-- Members can read other members in their orgs. Admins+ can manage.
-- ============================================================================

CREATE POLICY "members_select" ON public.organization_members
  FOR SELECT USING (
    org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
  );

CREATE POLICY "members_insert" ON public.organization_members
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT om.org_id FROM public.organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "members_update" ON public.organization_members
  FOR UPDATE USING (
    org_id IN (
      SELECT om.org_id FROM public.organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true AND om.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT om.org_id FROM public.organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true AND om.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- USER PROFILES
-- ============================================================================

CREATE POLICY "profiles_select_own" ON public.user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_select_org" ON public.user_profiles
  FOR SELECT USING (
    id IN (
      SELECT om2.user_id FROM public.organization_members om1
      JOIN public.organization_members om2 ON om1.org_id = om2.org_id
      WHERE om1.user_id = auth.uid() AND om1.is_active = true AND om2.is_active = true
    )
  );

CREATE POLICY "profiles_upsert_own" ON public.user_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.user_profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- STANDARD ORG-SCOPED PATTERN
-- Used for: agents, knowledge base, workflows, leads, conversations,
-- messages, appointments, pipeline stages, entries, transitions
-- ============================================================================

-- Helper: reusable membership check expression
-- (Postgres evaluates this once per statement, then caches)

-- AGENTS
CREATE POLICY "agents_select" ON public.agents FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);
CREATE POLICY "agents_insert" ON public.agents FOR INSERT WITH CHECK (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true AND om.role IN ('owner','admin','agent'))
);
CREATE POLICY "agents_update" ON public.agents FOR UPDATE
  USING (org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true AND om.role IN ('owner','admin','agent')))
  WITH CHECK (org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true AND om.role IN ('owner','admin','agent')));
CREATE POLICY "agents_delete" ON public.agents FOR DELETE USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true AND om.role IN ('owner','admin'))
);

-- KNOWLEDGE BASE (same pattern)
CREATE POLICY "kb_select" ON public.agent_knowledge_base FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);
CREATE POLICY "kb_write" ON public.agent_knowledge_base FOR INSERT WITH CHECK (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true AND om.role IN ('owner','admin','agent'))
);
CREATE POLICY "kb_update" ON public.agent_knowledge_base FOR UPDATE
  USING (org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true AND om.role IN ('owner','admin','agent')))
  WITH CHECK (org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true AND om.role IN ('owner','admin','agent')));

-- TEMPLATES (public read only)
CREATE POLICY "templates_read" ON public.agent_templates FOR SELECT USING (is_public = true);

-- WORKFLOWS
CREATE POLICY "wf_select" ON public.workflow_sequences FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);
CREATE POLICY "wf_write" ON public.workflow_sequences FOR INSERT WITH CHECK (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true AND om.role IN ('owner','admin'))
);

CREATE POLICY "wfe_select" ON public.workflow_executions FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);

-- LEADS, CONVERSATIONS, MESSAGES, APPOINTMENTS (read/write for org members)
CREATE POLICY "leads_select" ON public.leads FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);
CREATE POLICY "leads_write" ON public.leads FOR INSERT WITH CHECK (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);
CREATE POLICY "leads_update" ON public.leads FOR UPDATE
  USING (org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true))
  WITH CHECK (org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true));

CREATE POLICY "convos_select" ON public.conversations FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);
CREATE POLICY "convos_write" ON public.conversations FOR INSERT WITH CHECK (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);
CREATE POLICY "convos_update" ON public.conversations FOR UPDATE
  USING (org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true))
  WITH CHECK (org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true));

CREATE POLICY "msgs_select" ON public.messages FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);
CREATE POLICY "msgs_write" ON public.messages FOR INSERT WITH CHECK (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);

CREATE POLICY "appts_select" ON public.appointments FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);
CREATE POLICY "appts_write" ON public.appointments FOR INSERT WITH CHECK (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);
CREATE POLICY "appts_update" ON public.appointments FOR UPDATE
  USING (org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true))
  WITH CHECK (org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true));

-- PIPELINE
CREATE POLICY "stages_select" ON public.pipeline_stages FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);
CREATE POLICY "stages_write" ON public.pipeline_stages FOR INSERT WITH CHECK (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true AND om.role IN ('owner','admin'))
);

CREATE POLICY "lpe_select" ON public.lead_pipeline_entries FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);
CREATE POLICY "lpe_write" ON public.lead_pipeline_entries FOR INSERT WITH CHECK (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);
CREATE POLICY "lpe_update" ON public.lead_pipeline_entries FOR UPDATE
  USING (org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true))
  WITH CHECK (org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true));

CREATE POLICY "pt_select" ON public.pipeline_transitions FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);
CREATE POLICY "pt_write" ON public.pipeline_transitions FOR INSERT WITH CHECK (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);

-- ============================================================================
-- DOMAIN EVENTS — read-only for users, service role writes
-- ============================================================================

CREATE POLICY "events_select" ON public.domain_events FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);
-- No INSERT/UPDATE/DELETE for authenticated — only service_role writes events

-- ============================================================================
-- USAGE — read-only for org members
-- ============================================================================

CREATE POLICY "usage_select" ON public.usage_records FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);

CREATE POLICY "usage_d_select" ON public.usage_daily FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);

-- ============================================================================
-- AUDIT LOG — read-only
-- ============================================================================

CREATE POLICY "audit_select" ON public.audit_log FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);

-- ============================================================================
-- WEBHOOKS — org admins can manage
-- ============================================================================

CREATE POLICY "wh_select" ON public.webhook_endpoints FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);
CREATE POLICY "wh_write" ON public.webhook_endpoints FOR INSERT WITH CHECK (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true AND om.role IN ('owner','admin'))
);
CREATE POLICY "wh_update" ON public.webhook_endpoints FOR UPDATE
  USING (org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true AND om.role IN ('owner','admin')))
  WITH CHECK (org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true AND om.role IN ('owner','admin')));

CREATE POLICY "whd_select" ON public.webhook_deliveries FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM public.organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true)
);

-- ============================================================================
-- NOTIFICATIONS — user's own only
-- ============================================================================

CREATE POLICY "notif_select" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notif_update" ON public.notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER trg_orgs_upd BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_members_upd BEFORE UPDATE ON public.organization_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_profiles_upd BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_agents_upd BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_kb_upd BEFORE UPDATE ON public.agent_knowledge_base FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_leads_upd BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_convos_upd BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_appts_upd BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_msg_count AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.increment_message_count();
