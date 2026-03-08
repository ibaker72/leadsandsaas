-- 009: capture_key hardening for public lead capture

ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS capture_key TEXT UNIQUE;

UPDATE public.organizations
SET capture_key = encode(gen_random_bytes(16), 'hex')
WHERE capture_key IS NULL;

ALTER TABLE public.organizations
ALTER COLUMN capture_key SET NOT NULL;

ALTER TABLE public.organizations
ALTER COLUMN capture_key SET DEFAULT encode(gen_random_bytes(16), 'hex');

CREATE INDEX IF NOT EXISTS idx_organizations_capture_key
ON public.organizations (capture_key);