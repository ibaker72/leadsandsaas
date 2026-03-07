import Anthropic from '@anthropic-ai/sdk';
import type { Agent, Lead, Conversation, Message, KnowledgeBaseEntry, Organization, PipelineStage } from '@/lib/types/domain';
import { Ok, Err, type Result, tryCatch } from '@/lib/errors';
import { AppError } from '@/lib/errors';
import { buildSystemPrompt } from './prompts';
import { AGENT_TOOLS, type AgentToolName } from './tools';

export interface AgentContext {
  organization: Organization; agent: Agent; lead: Lead; conversation: Conversation;
  recentMessages: Message[]; knowledgeBase: KnowledgeBaseEntry[]; pipelineStages: PipelineStage[]; currentStage: PipelineStage | null;
}

export type AgentAction =
  | { type: 'send_reply'; message: string; channel: 'sms' | 'email' }
  | { type: 'book_appointment'; datetime: string; service_type: string; duration_minutes?: number }
  | { type: 'update_pipeline_stage'; stage_id: string; reason: string }
  | { type: 'update_lead_qualification'; fields: Record<string, string> }
  | { type: 'update_lead_score'; score: number; reason: string }
  | { type: 'escalate_to_human'; reason: string; urgency: 'low' | 'medium' | 'high' }
  | { type: 'schedule_follow_up'; delay_hours: number; message: string; channel: 'sms' | 'email' }
  | { type: 'add_note'; content: string }
  | { type: 'tag_lead'; tags: string[] };

export interface AgentResponse {
  reply: string | null; replyChannel: 'sms' | 'email' | null; actions: AgentAction[];
  usage: { input_tokens: number; output_tokens: number }; model: string; latencyMs: number;
  toolCalls: Array<{ name: string; input: Record<string, unknown> }>;
}

export class AgentEngine {
  private client: Anthropic;
  constructor(apiKey?: string) { this.client = new Anthropic({ apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY! }); }

  async processMessage(inboundMessage: string, context: AgentContext): Promise<Result<AgentResponse>> {
    const startTime = Date.now();
    if (context.lead.opted_out) return Err(AppError.badRequest('Lead opted out'));

    const systemPrompt = buildSystemPrompt(context);
    const messages: Anthropic.Messages.MessageParam[] = [
      ...context.recentMessages.map(msg => ({ role: (msg.direction === 'inbound' ? 'user' : 'assistant') as 'user' | 'assistant', content: msg.body })),
      { role: 'user' as const, content: inboundMessage },
    ];

    return tryCatch(async () => {
      const response = await this.client.messages.create({
        model: context.agent.model_config.model, max_tokens: context.agent.model_config.max_tokens,
        temperature: context.agent.model_config.temperature, system: systemPrompt, tools: AGENT_TOOLS, messages,
      });

      const actions: AgentAction[] = [];
      const toolCalls: Array<{ name: string; input: Record<string, unknown> }> = [];
      let reply: string | null = null;

      for (const block of response.content) {
        if (block.type === 'tool_use') {
          const name = block.name as AgentToolName;
          const input = block.input as Record<string, unknown>;
          toolCalls.push({ name, input });

          switch (name) {
            case 'send_reply':
              reply = input.message as string;
              actions.push({ type: 'send_reply', message: input.message as string, channel: (input.channel as 'sms' | 'email') ?? context.conversation.channel as 'sms' | 'email' });
              break;
            case 'book_appointment':
              actions.push({ type: 'book_appointment', datetime: input.datetime as string, service_type: input.service_type as string, duration_minutes: input.duration_minutes as number | undefined });
              break;
            case 'update_pipeline_stage':
              actions.push({ type: 'update_pipeline_stage', stage_id: input.stage_id as string, reason: input.reason as string });
              break;
            case 'update_lead_info':
              actions.push({ type: 'update_lead_qualification', fields: input.fields as Record<string, string> });
              break;
            case 'score_lead':
              actions.push({ type: 'update_lead_score', score: input.score as number, reason: input.reason as string });
              break;
            case 'escalate_to_human':
              actions.push({ type: 'escalate_to_human', reason: input.reason as string, urgency: input.urgency as 'low' | 'medium' | 'high' });
              break;
            case 'schedule_follow_up':
              actions.push({ type: 'schedule_follow_up', delay_hours: input.delay_hours as number, message: input.message as string, channel: (input.channel as 'sms' | 'email') ?? 'sms' });
              break;
            case 'add_note':
              actions.push({ type: 'add_note', content: input.content as string });
              break;
            case 'tag_lead':
              actions.push({ type: 'tag_lead', tags: input.tags as string[] });
              break;
          }
        }
      }

      return {
        reply, replyChannel: reply ? ((actions.find(a => a.type === 'send_reply') as Extract<AgentAction, { type: 'send_reply' }>)?.channel ?? null) : null,
        actions, usage: { input_tokens: response.usage.input_tokens, output_tokens: response.usage.output_tokens },
        model: context.agent.model_config.model, latencyMs: Date.now() - startTime, toolCalls,
      };
    }, (e) => AppError.aiError(`Agent inference failed: ${(e as Error).message}`, e));
  }
}

let engine: AgentEngine | null = null;
export function getAgentEngine(): AgentEngine { if (!engine) engine = new AgentEngine(); return engine; }
