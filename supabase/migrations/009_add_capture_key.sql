-- ============================================================================
-- 009: Add capture_key column to organizations
--
-- WHY: The signup bootstrap route and lead capture API both reference
-- capture_key, but the column was missing from the organizations table.
-- This caused every signup to fail with a column-not-found error.
-- ============================================================================

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS capture_key TEXT;

-- Unique index so each org gets a distinct public-facing capture key
CREATE UNIQUE INDEX IF NOT EXISTS idx_orgs_capture_key
  ON public.organizations(capture_key)
  WHERE capture_key IS NOT NULL;

-- Backfill existing orgs that are missing a capture_key
UPDATE public.organizations
SET capture_key = encode(gen_random_bytes(16), 'hex')
WHERE capture_key IS NULL;
