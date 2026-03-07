-- ============================================================================
-- 001: Extensions and Enums
-- No tables, no functions, no policies — just prerequisites
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TYPE public.org_plan AS ENUM ('starter','growth','scale','enterprise','trial');
CREATE TYPE public.member_role AS ENUM ('owner','admin','agent','viewer');
CREATE TYPE public.lead_status AS ENUM ('new','contacted','qualified','nurturing','converted','lost','unresponsive');
CREATE TYPE public.lead_source AS ENUM ('web_form','sms_inbound','email_inbound','phone_inbound','manual','api','zapier','referral');
CREATE TYPE public.channel_type AS ENUM ('sms','email','voice','web_chat','whatsapp');
CREATE TYPE public.message_direction AS ENUM ('inbound','outbound');
CREATE TYPE public.message_sender_type AS ENUM ('lead','ai_agent','human_agent','system');
CREATE TYPE public.agent_status AS ENUM ('active','paused','draft');
CREATE TYPE public.appointment_status AS ENUM ('scheduled','confirmed','completed','cancelled','no_show','rescheduled');
CREATE TYPE public.event_status AS ENUM ('pending','processing','completed','failed','dead_letter');
CREATE TYPE public.vertical_type AS ENUM ('hvac','roofing','plumbing','electrical','med_spa','dental','legal','real_estate','insurance','auto_repair','landscaping','cleaning','general');
