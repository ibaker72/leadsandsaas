// =============================================================================
// Domain types — single source of truth mirroring Postgres enums/tables
// =============================================================================

export type OrgPlan = 'starter' | 'growth' | 'scale' | 'enterprise' | 'trial';
export type MemberRole = 'owner' | 'admin' | 'agent' | 'viewer';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'nurturing' | 'converted' | 'lost' | 'unresponsive';
export type LeadSource = 'web_form' | 'sms_inbound' | 'email_inbound' | 'phone_inbound' | 'manual' | 'api' | 'zapier' | 'referral';
export type ChannelType = 'sms' | 'email' | 'voice' | 'web_chat' | 'whatsapp';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageSenderType = 'lead' | 'ai_agent' | 'human_agent' | 'system';
export type AgentStatus = 'active' | 'paused' | 'draft';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
export type VerticalType = 'hvac' | 'roofing' | 'plumbing' | 'electrical' | 'med_spa' | 'dental' | 'legal' | 'real_estate' | 'insurance' | 'auto_repair' | 'landscaping' | 'cleaning' | 'general';

export type DomainEventType =
  | 'lead.created' | 'lead.updated' | 'lead.qualified' | 'lead.converted' | 'lead.lost' | 'lead.opted_out'
  | 'message.received' | 'message.sent' | 'message.failed'
  | 'conversation.created' | 'conversation.escalated' | 'conversation.closed'
  | 'appointment.booked' | 'appointment.confirmed' | 'appointment.cancelled' | 'appointment.completed' | 'appointment.no_show'
  | 'pipeline.stage_changed'
  | 'agent.activated' | 'agent.error'
  | 'usage.threshold_reached'
  | 'webhook.delivered';

export interface Timestamps { created_at: string; updated_at: string; }

export interface OrgSettings {
  timezone: string;
  business_hours: { start: string; end: string; days: number[] };
  quiet_hours: { start: string; end: string };
  auto_assign_agent: boolean;
  default_response_delay_seconds: number;
  max_follow_ups: number;
}

export interface OrgLimits {
  max_agents: number;
  max_conversations_monthly: number;
  max_users: number;
  max_knowledge_base_mb: number;
}

export interface Organization extends Timestamps {
  id: string;
  name: string;
  slug: string;
  vertical: VerticalType;
  plan: OrgPlan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  settings: OrgSettings;
  limits: OrgLimits;
  metadata: Record<string, unknown>;
  trial_ends_at: string | null;
}

export interface AgentPersonality { tone: string; urgency_level: string; empathy_level: string; formality: string; language: string; }
export interface AgentRules { can_book_appointments: boolean; can_offer_discounts: boolean; max_discount_pct: number; escalation_triggers: string[]; required_qualification_fields: string[]; follow_up_cadence_hours: number[]; max_follow_ups: number; }
export interface AgentChannelConfig { sms: { enabled: boolean; twilio_number: string | null }; email: { enabled: boolean; from_address: string | null; from_name: string | null }; voice: { enabled: boolean }; web_chat: { enabled: boolean }; }
export interface AgentModelConfig { model: string; max_tokens: number; temperature: number; }
export interface AgentStats { total_conversations: number; total_appointments_booked: number; total_leads_converted: number; avg_response_time_seconds: number; avg_messages_to_conversion: number; }

export interface Agent extends Timestamps {
  id: string; org_id: string; name: string; description: string | null; vertical: VerticalType; status: AgentStatus;
  system_prompt_override: string | null; personality: AgentPersonality; rules: AgentRules; channels: AgentChannelConfig; stats: AgentStats; model_config: AgentModelConfig;
}

export interface KnowledgeBaseEntry extends Timestamps {
  id: string; agent_id: string; org_id: string; title: string; content: string; content_type: 'text' | 'faq' | 'service_catalog' | 'pricing'; metadata: Record<string, unknown>; is_active: boolean;
}

export interface LeadQualification { service_needed: string | null; timeline: string | null; budget_range: string | null; location: string | null; property_type: string | null; urgency: string | null; decision_maker: string | null; notes: string[]; }

export interface Lead extends Timestamps {
  id: string; org_id: string; agent_id: string | null;
  first_name: string | null; last_name: string | null; email: string | null; phone: string | null; phone_e164: string | null;
  status: LeadStatus; source: LeadSource; score: number; qualification: LeadQualification;
  source_metadata: Record<string, unknown>; tags: string[];
  sms_consent: boolean; sms_consent_at: string | null; email_consent: boolean; email_consent_at: string | null;
  opted_out: boolean; opted_out_at: string | null;
  first_contacted_at: string | null; last_contacted_at: string | null; converted_at: string | null;
}

export interface Conversation extends Timestamps {
  id: string; org_id: string; lead_id: string; agent_id: string | null; channel: ChannelType;
  is_active: boolean; is_human_takeover: boolean; human_agent_id: string | null;
  summary: string | null; summary_updated_at: string | null;
  message_count: number; last_message_at: string | null; last_inbound_at: string | null; last_outbound_at: string | null;
  twilio_sid: string | null; thread_metadata: Record<string, unknown>;
}

export interface AIMetadata { model: string; tokens_in: number; tokens_out: number; latency_ms: number; tools_used: string[]; confidence: number; intent_detected: string; sentiment: string; }

export interface Message {
  id: string; org_id: string; conversation_id: string; lead_id: string;
  direction: MessageDirection; sender_type: MessageSenderType; sender_id: string | null;
  channel: ChannelType; body: string; body_html: string | null;
  ai_metadata: Partial<AIMetadata>; status: string; error_message: string | null; external_id: string | null; cost_cents: number; created_at: string;
}

export interface Appointment extends Timestamps {
  id: string; org_id: string; lead_id: string; agent_id: string | null; conversation_id: string | null;
  title: string; description: string | null; service_type: string | null; status: AppointmentStatus;
  starts_at: string; ends_at: string; timezone: string;
  location: string | null; is_virtual: boolean; meeting_url: string | null;
  reminder_sent_24h: boolean; reminder_sent_1h: boolean;
  external_calendar_id: string | null; external_event_id: string | null;
  notes: string | null; cancelled_reason: string | null; metadata: Record<string, unknown>;
}

export interface PipelineStage extends Timestamps {
  id: string; org_id: string; name: string; description: string | null; position: number; color: string; is_win_stage: boolean; is_loss_stage: boolean; auto_actions: Record<string, unknown>;
}

export interface DomainEvent {
  id: string; org_id: string | null; event_type: DomainEventType; aggregate_type: string; aggregate_id: string;
  payload: Record<string, unknown>; status: 'pending' | 'processing' | 'completed' | 'failed' | 'dead_letter';
  retry_count: number; created_at: string;
}
