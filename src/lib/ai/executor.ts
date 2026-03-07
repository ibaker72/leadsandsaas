import type { SupabaseClient } from '@supabase/supabase-js';
import type { Agent, Lead, Conversation, ChannelType } from '@/lib/types/domain';
import type { AgentAction, AgentResponse } from './engine';
import { getChannelAdapter } from '@/lib/comms/channels';
import { DomainEventEmitter } from '@/lib/events/emitter';
import { Ok, type Result, tryCatch } from '@/lib/errors';

export interface ExecutionContext { db: SupabaseClient; agent: Agent; lead: Lead; conversation: Conversation; orgId: string; }
export interface ExecutionResult { actionsExecuted: number; actionsFailed: number; messagesSent: number; errors: Array<{ action: string; error: string }>; }

export class ActionExecutor {
  private events: DomainEventEmitter;
  constructor(private ctx: ExecutionContext) { this.events = new DomainEventEmitter(ctx.db); }

  async executeAll(response: AgentResponse): Promise<Result<ExecutionResult>> {
    const result: ExecutionResult = { actionsExecuted: 0, actionsFailed: 0, messagesSent: 0, errors: [] };
    for (const action of response.actions) {
      try {
        await this.exec(action);
        result.actionsExecuted++;
        if (action.type === 'send_reply') result.messagesSent++;
      } catch (e) {
        result.actionsFailed++;
        result.errors.push({ action: action.type, error: (e as Error).message });
      }
    }
    await this.trackUsage(response);
    return Ok(result);
  }

  private async exec(action: AgentAction): Promise<void> {
    switch (action.type) {
      case 'send_reply': {
        const channel = action.channel as ChannelType;
        const adapter = getChannelAdapter(channel);
        const to = channel === 'sms' ? this.ctx.lead.phone_e164! : this.ctx.lead.email!;
        const from = channel === 'sms' ? this.ctx.agent.channels.sms.twilio_number! : this.ctx.agent.channels.email.from_address!;
        const sendResult = await adapter.send({ to, from, body: action.message, fromName: channel === 'email' ? this.ctx.agent.channels.email.from_name ?? this.ctx.agent.name : undefined, metadata: { org_id: this.ctx.orgId, lead_id: this.ctx.lead.id } });
        if (!sendResult.ok) throw sendResult.error;
        await this.ctx.db.from('messages').insert({ org_id: this.ctx.orgId, conversation_id: this.ctx.conversation.id, lead_id: this.ctx.lead.id, direction: 'outbound', sender_type: 'ai_agent', sender_id: this.ctx.agent.id, channel, body: action.message, status: sendResult.value.status, external_id: sendResult.value.externalId, cost_cents: sendResult.value.costCents });
        await this.ctx.db.from('leads').update({ last_contacted_at: new Date().toISOString(), ...(!this.ctx.lead.first_contacted_at && { first_contacted_at: new Date().toISOString(), status: 'contacted' }) }).eq('id', this.ctx.lead.id);
        await this.events.emit('message.sent', 'message', this.ctx.conversation.id, { channel, lead_id: this.ctx.lead.id }, this.ctx.orgId);
        break;
      }
      case 'book_appointment': {
        const duration = action.duration_minutes ?? 60;
        const startsAt = new Date(action.datetime);
        const endsAt = new Date(startsAt.getTime() + duration * 60000);
        const { data } = await this.ctx.db.from('appointments').insert({ org_id: this.ctx.orgId, lead_id: this.ctx.lead.id, agent_id: this.ctx.agent.id, conversation_id: this.ctx.conversation.id, title: `${action.service_type} - ${this.ctx.lead.first_name || 'Lead'}`, service_type: action.service_type, starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString(), timezone: this.ctx.agent.channels.sms.twilio_number ? 'America/New_York' : 'America/New_York' }).select('id').single();
        if (data) await this.events.emit('appointment.booked', 'appointment', data.id, { lead_id: this.ctx.lead.id, service_type: action.service_type, starts_at: startsAt.toISOString() }, this.ctx.orgId);
        break;
      }
      case 'update_pipeline_stage': {
        await this.ctx.db.from('lead_pipeline_entries').upsert({ org_id: this.ctx.orgId, lead_id: this.ctx.lead.id, stage_id: action.stage_id, entered_at: new Date().toISOString() }, { onConflict: 'lead_id' });
        await this.ctx.db.from('pipeline_transitions').insert({ org_id: this.ctx.orgId, lead_id: this.ctx.lead.id, to_stage_id: action.stage_id, triggered_by: `ai_agent:${this.ctx.agent.id}`, reason: action.reason });
        await this.events.emit('pipeline.stage_changed', 'lead', this.ctx.lead.id, { stage_id: action.stage_id, reason: action.reason }, this.ctx.orgId);
        break;
      }
      case 'update_lead_qualification': {
        const updated = { ...this.ctx.lead.qualification, ...action.fields };
        await this.ctx.db.from('leads').update({ qualification: updated }).eq('id', this.ctx.lead.id);
        break;
      }
      case 'update_lead_score':
        await this.ctx.db.from('leads').update({ score: action.score }).eq('id', this.ctx.lead.id);
        break;
      case 'escalate_to_human':
        await this.ctx.db.from('conversations').update({ is_human_takeover: true }).eq('id', this.ctx.conversation.id);
        await this.events.emit('conversation.escalated', 'conversation', this.ctx.conversation.id, { reason: action.reason, urgency: action.urgency, lead_id: this.ctx.lead.id }, this.ctx.orgId);
        break;
      case 'schedule_follow_up': {
        const runAt = new Date(Date.now() + action.delay_hours * 3600000);
        await this.ctx.db.from('workflow_executions').insert({ workflow_id: null, org_id: this.ctx.orgId, lead_id: this.ctx.lead.id, current_step: 0, status: 'running', next_run_at: runAt.toISOString(), metadata: { type: 'ai_scheduled_follow_up', message: action.message, channel: action.channel, agent_id: this.ctx.agent.id, conversation_id: this.ctx.conversation.id } });
        break;
      }
      case 'add_note':
        await this.ctx.db.from('messages').insert({ org_id: this.ctx.orgId, conversation_id: this.ctx.conversation.id, lead_id: this.ctx.lead.id, direction: 'outbound', sender_type: 'system', sender_id: this.ctx.agent.id, channel: this.ctx.conversation.channel, body: `[AI Note] ${action.content}`, status: 'delivered' });
        break;
      case 'tag_lead': {
        const newTags = [...new Set([...(this.ctx.lead.tags || []), ...action.tags])];
        await this.ctx.db.from('leads').update({ tags: newTags }).eq('id', this.ctx.lead.id);
        break;
      }
    }
  }

  private async trackUsage(response: AgentResponse): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    await this.ctx.db.rpc('increment_usage', { p_org_id: this.ctx.orgId, p_period_start: periodStart, p_period_end: periodEnd, p_ai_tokens_input: response.usage.input_tokens, p_ai_tokens_output: response.usage.output_tokens, p_ai_requests: 1 });
  }
}
