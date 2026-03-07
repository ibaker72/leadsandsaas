-- ============================================================================
-- 008: Auth helpers
--
-- ARCHITECTURE DECISION:
-- The old set_user_org_claim() SECURITY DEFINER function is REMOVED.
-- JWT claims are now set via the admin auth API in the server-side
-- signup route handler (/api/auth/signup). This eliminates the privilege
-- escalation risk where any authenticated user could call set_user_org_claim
-- to hijack any account into any organization.
--
-- The on_member_created trigger is also removed because:
-- 1. It modified auth.users which is fragile
-- 2. The admin client handles claim updates during bootstrap
-- 3. JWT claims are a convenience hint, not a security boundary
--
-- What remains: a trigger to auto-create user profiles on signup.
-- ============================================================================

-- Auto-create a user profile when a new auth user is created
-- This runs as a Supabase Auth hook (if configured) or can be called manually
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Wire to auth.users insert (Supabase supports this trigger)
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Restrict the function itself
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
