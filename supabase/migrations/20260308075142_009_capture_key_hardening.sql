-- 009: capture_key hardening for public lead capture

ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS capture_key TEXT UNIQUE;

UPDATE public.organizations
SET capture_key = replace(gen_random_uuid()::text, '-', '')
WHERE capture_key IS NULL;

ALTER TABLE public.organizations
ALTER COLUMN capture_key SET DEFAULT replace(gen_random_uuid()::text, '-', '');

CREATE INDEX IF NOT EXISTS idx_organizations_capture_key
ON public.organizations (capture_key);