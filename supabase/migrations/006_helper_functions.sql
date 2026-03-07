-- ============================================================================
-- 006: Helper functions
-- All SECURITY DEFINER functions are hardened with:
--   SET search_path = public, pg_temp
--   REVOKE ALL FROM PUBLIC
--   Explicit GRANT to appropriate roles
-- ============================================================================

-- updated_at trigger function (safe, no SECURITY DEFINER needed)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Message count incrementer (trigger function, no SECURITY DEFINER needed)
CREATE OR REPLACE FUNCTION public.increment_message_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.conversations SET
    message_count = message_count + 1,
    last_message_at = NEW.created_at,
    last_inbound_at = CASE WHEN NEW.direction = 'inbound' THEN NEW.created_at ELSE last_inbound_at END,
    last_outbound_at = CASE WHEN NEW.direction = 'outbound' THEN NEW.created_at ELSE last_outbound_at END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- Default pipeline creation (SECURITY DEFINER — called by server-side bootstrap)
CREATE OR REPLACE FUNCTION public.create_default_pipeline(p_org_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.pipeline_stages (org_id, name, position, color, is_win_stage, is_loss_stage) VALUES
    (p_org_id, 'New Lead',      0, '#6366f1', false, false),
    (p_org_id, 'Contacted',     1, '#8b5cf6', false, false),
    (p_org_id, 'Qualified',     2, '#a855f7', false, false),
    (p_org_id, 'Proposal Sent', 3, '#d946ef', false, false),
    (p_org_id, 'Negotiation',   4, '#ec4899', false, false),
    (p_org_id, 'Won',           5, '#22c55e', true,  false),
    (p_org_id, 'Lost',          6, '#ef4444', false, true);
END;
$$;

-- Restrict to service role only (admin client)
REVOKE ALL ON FUNCTION public.create_default_pipeline(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_default_pipeline(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.create_default_pipeline(UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_default_pipeline(UUID) TO service_role;

-- Usage increment (SECURITY DEFINER — called by service-role edge functions)
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_org_id UUID, p_period_start DATE, p_period_end DATE,
  p_ai_tokens_input BIGINT DEFAULT 0, p_ai_tokens_output BIGINT DEFAULT 0, p_ai_requests INT DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.usage_records (org_id, period_start, period_end, ai_tokens_input, ai_tokens_output, ai_requests)
  VALUES (p_org_id, p_period_start, p_period_end, p_ai_tokens_input, p_ai_tokens_output, p_ai_requests)
  ON CONFLICT (org_id, period_start) DO UPDATE SET
    ai_tokens_input = public.usage_records.ai_tokens_input + EXCLUDED.ai_tokens_input,
    ai_tokens_output = public.usage_records.ai_tokens_output + EXCLUDED.ai_tokens_output,
    ai_requests = public.usage_records.ai_requests + EXCLUDED.ai_requests,
    updated_at = NOW();
END;
$$;

REVOKE ALL ON FUNCTION public.increment_usage(UUID, DATE, DATE, BIGINT, BIGINT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_usage(UUID, DATE, DATE, BIGINT, BIGINT, INT) FROM anon;
REVOKE ALL ON FUNCTION public.increment_usage(UUID, DATE, DATE, BIGINT, BIGINT, INT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage(UUID, DATE, DATE, BIGINT, BIGINT, INT) TO service_role;

-- Daily usage increment (SECURITY DEFINER — hardened with allowlist)
CREATE OR REPLACE FUNCTION public.increment_daily_usage(p_org_id UUID, p_date DATE, p_field TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- SECURITY: whitelist allowed field names to prevent injection
  IF p_field NOT IN ('conversations', 'messages', 'appointments', 'leads_created', 'leads_converted') THEN
    RAISE EXCEPTION 'Invalid field name: %', p_field;
  END IF;

  INSERT INTO public.usage_daily (org_id, date) VALUES (p_org_id, p_date)
  ON CONFLICT (org_id, date) DO NOTHING;

  EXECUTE format('UPDATE public.usage_daily SET %I = %I + 1 WHERE org_id = $1 AND date = $2', p_field, p_field)
  USING p_org_id, p_date;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_daily_usage(UUID, DATE, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_daily_usage(UUID, DATE, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.increment_daily_usage(UUID, DATE, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_daily_usage(UUID, DATE, TEXT) TO service_role;

-- Dashboard stats (read-only, safe for authenticated users via membership check)
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_org_id UUID)
RETURNS TABLE (total_leads BIGINT, active_conversations BIGINT, appointments_today BIGINT, conversion_rate NUMERIC)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- SECURITY: verify caller has membership in this org
  IF NOT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE org_id = p_org_id AND user_id = auth.uid() AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY SELECT
    (SELECT COUNT(*) FROM public.leads WHERE org_id = p_org_id),
    (SELECT COUNT(*) FROM public.conversations WHERE org_id = p_org_id AND is_active = true),
    (SELECT COUNT(*) FROM public.appointments WHERE org_id = p_org_id AND DATE(starts_at) = CURRENT_DATE AND status IN ('scheduled','confirmed')),
    COALESCE(
      (SELECT COUNT(*) FILTER (WHERE status = 'converted')::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0) * 100 FROM public.leads WHERE org_id = p_org_id),
      0
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_dashboard_stats(UUID) TO authenticated;
