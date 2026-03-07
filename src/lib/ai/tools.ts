import type Anthropic from '@anthropic-ai/sdk';

export type AgentToolName = 'send_reply' | 'book_appointment' | 'update_pipeline_stage' | 'update_lead_info' | 'score_lead' | 'escalate_to_human' | 'schedule_follow_up' | 'add_note' | 'tag_lead';

export const AGENT_TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: 'send_reply',
    description: 'Send a reply message to the lead. ALWAYS use this tool to respond. Write naturally — shorter for SMS, more detailed for email.',
    input_schema: { type: 'object' as const, properties: { message: { type: 'string', description: 'The message to send. SMS: keep under 320 chars. Email: can be longer.' }, channel: { type: 'string', enum: ['sms', 'email'] } }, required: ['message'] },
  },
  {
    name: 'book_appointment',
    description: 'Book an appointment. Only when lead explicitly agrees to a time or you are suggesting available slots.',
    input_schema: { type: 'object' as const, properties: { datetime: { type: 'string', description: 'ISO 8601 datetime' }, service_type: { type: 'string' }, duration_minutes: { type: 'number' } }, required: ['datetime', 'service_type'] },
  },
  {
    name: 'update_pipeline_stage',
    description: 'Move lead to a different pipeline stage when qualification status changes.',
    input_schema: { type: 'object' as const, properties: { stage_id: { type: 'string' }, reason: { type: 'string' } }, required: ['stage_id', 'reason'] },
  },
  {
    name: 'update_lead_info',
    description: 'Update lead qualification data extracted from conversation.',
    input_schema: { type: 'object' as const, properties: { fields: { type: 'object', description: 'Keys: service_needed, timeline, budget_range, location, property_type, urgency, decision_maker', additionalProperties: { type: 'string' } } }, required: ['fields'] },
  },
  {
    name: 'score_lead',
    description: 'Update lead score 0-100 based on conversation signals.',
    input_schema: { type: 'object' as const, properties: { score: { type: 'number', minimum: 0, maximum: 100 }, reason: { type: 'string' } }, required: ['score', 'reason'] },
  },
  {
    name: 'escalate_to_human',
    description: 'Transfer to human agent when lead is angry, asks for a person, or situation is too complex.',
    input_schema: { type: 'object' as const, properties: { reason: { type: 'string' }, urgency: { type: 'string', enum: ['low', 'medium', 'high'] } }, required: ['reason', 'urgency'] },
  },
  {
    name: 'schedule_follow_up',
    description: 'Schedule a follow-up message to send later.',
    input_schema: { type: 'object' as const, properties: { delay_hours: { type: 'number' }, message: { type: 'string' }, channel: { type: 'string', enum: ['sms', 'email'] } }, required: ['delay_hours', 'message'] },
  },
  {
    name: 'add_note',
    description: 'Add internal note to lead record visible to human team.',
    input_schema: { type: 'object' as const, properties: { content: { type: 'string' } }, required: ['content'] },
  },
  {
    name: 'tag_lead',
    description: 'Add tags to lead for categorization.',
    input_schema: { type: 'object' as const, properties: { tags: { type: 'array', items: { type: 'string' } } }, required: ['tags'] },
  },
];
