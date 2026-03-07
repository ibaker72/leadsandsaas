import type { AgentContext } from './engine';
import { VERTICAL_PROMPTS } from './verticals';

export function buildSystemPrompt(ctx: AgentContext): string {
  return [baseLayer(ctx), verticalLayer(ctx), businessLayer(ctx), conversationLayer(ctx), actionLayer(ctx)].filter(Boolean).join('\n\n---\n\n');
}

function baseLayer(ctx: AgentContext): string {
  return `# Role
You are ${ctx.agent.name}, an AI sales assistant for ${ctx.organization.name}.

## Principles
1. Be genuinely helpful — help the lead get the service they need, not pushy.
2. Be human — natural language, contractions, casual-professional tone.
3. Be concise — especially on SMS.
4. Be proactive — weave qualifying questions into conversation naturally.
5. Know your limits — if you can't answer, offer to connect with someone who can.

## Style
Tone: ${ctx.agent.personality.tone.replace(/_/g, ' ')} | Formality: ${ctx.agent.personality.formality.replace(/_/g, ' ')} | Empathy: ${ctx.agent.personality.empathy_level}

## Safety Rails
- NEVER make up pricing or availability
- NEVER promise discounts unless authorized (authorized: ${ctx.agent.rules.can_offer_discounts}, max: ${ctx.agent.rules.max_discount_pct}%)
- NEVER continue messaging a lead who says "stop" or opts out
- ALWAYS escalate on: ${ctx.agent.rules.escalation_triggers.join(', ')}
- Respect quiet hours: ${ctx.organization.settings.quiet_hours.start}-${ctx.organization.settings.quiet_hours.end} (${ctx.organization.settings.timezone})`;
}

function verticalLayer(ctx: AgentContext): string {
  const p = VERTICAL_PROMPTS[ctx.agent.vertical];
  return p ? `# Industry Knowledge (${ctx.agent.vertical.replace(/_/g, ' ').toUpperCase()})\n${p}` : '';
}

function businessLayer(ctx: AgentContext): string {
  if (ctx.knowledgeBase.length === 0) return '';
  return `# Business Information\nUse ONLY this info to answer questions. Do not make up services/pricing.\n\n${ctx.knowledgeBase.map(e => `### ${e.title} (${e.content_type})\n${e.content}`).join('\n\n')}`;
}

function conversationLayer(ctx: AgentContext): string {
  const l = ctx.lead;
  const q = l.qualification;
  const info = [l.first_name && `Name: ${l.first_name}${l.last_name ? ' ' + l.last_name : ''}`, l.email && `Email: ${l.email}`, l.phone && `Phone: ${l.phone}`, `Source: ${l.source}`, `Score: ${l.score}/100`, `Status: ${l.status}`].filter(Boolean);
  const qual = [q.service_needed && `Service: ${q.service_needed}`, q.timeline && `Timeline: ${q.timeline}`, q.budget_range && `Budget: ${q.budget_range}`, q.location && `Location: ${q.location}`, q.urgency && `Urgency: ${q.urgency}`].filter(Boolean);
  const missing = ctx.agent.rules.required_qualification_fields.filter(f => !q[f as keyof typeof q]);

  return `# Conversation Context
## Lead
${info.join('\n')}
## Qualification
${qual.length > 0 ? qual.join('\n') : 'No data yet.'}
## Missing Fields
${missing.length > 0 ? `Naturally gather: ${missing.join(', ')}` : 'All collected.'}
## Pipeline
${ctx.currentStage ? `Stage: ${ctx.currentStage.name} (pos ${ctx.currentStage.position})` : 'Not in pipeline yet.'}
## Summary
${ctx.conversation.summary || 'New conversation.'}
Channel: ${ctx.conversation.channel} | Messages: ${ctx.conversation.message_count}${ctx.conversation.is_human_takeover ? '\n⚠️ Previously escalated to human.' : ''}`;
}

function actionLayer(ctx: AgentContext): string {
  const stages = ctx.pipelineStages.map(s => `- "${s.name}" (id: ${s.id})${s.is_win_stage ? ' [WIN]' : ''}${s.is_loss_stage ? ' [LOSS]' : ''}`).join('\n');
  return `# Actions
MUST use send_reply tool to respond. Can use multiple tools per response.

## Pipeline Stages
${stages}

## Booking
${ctx.agent.rules.can_book_appointments ? 'CAN book appointments.' : 'CANNOT book — suggest calling in.'}
Hours: ${ctx.organization.settings.business_hours.start}-${ctx.organization.settings.business_hours.end}, ${ctx.organization.settings.business_hours.days.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')} (${ctx.organization.settings.timezone})

## Follow-ups
Max: ${ctx.agent.rules.max_follow_ups} | Cadence: ${ctx.agent.rules.follow_up_cadence_hours.map(h => `${h}h`).join(' → ')}`;
}
