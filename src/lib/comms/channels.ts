import type { ChannelType } from '@/lib/types/domain';
import { Ok, Err, type Result, tryCatch } from '@/lib/errors';
import { AppError } from '@/lib/errors';

export interface SendMessageInput { to: string; from: string; body: string; bodyHtml?: string; subject?: string; fromName?: string; metadata?: Record<string, string>; }
export interface SendResult { externalId: string; status: string; costCents: number; segments?: number; }
export interface ChannelAdapter { send(input: SendMessageInput): Promise<Result<SendResult>>; validateRecipient(r: string): boolean; }

export class TwilioSmsAdapter implements ChannelAdapter {
  private sid = process.env.TWILIO_ACCOUNT_SID!;
  private token = process.env.TWILIO_AUTH_TOKEN!;

  async send(input: SendMessageInput): Promise<Result<SendResult>> {
    return tryCatch(async () => {
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.sid}/Messages.json`, {
        method: 'POST',
        headers: { Authorization: `Basic ${Buffer.from(`${this.sid}:${this.token}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ To: input.to, From: input.from, Body: input.body, StatusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/status`, ...(input.metadata || {}) }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(`Twilio ${e.code}: ${e.message}`); }
      const data = await res.json();
      const segments = Math.ceil(input.body.length / 160);
      return { externalId: data.sid, status: data.status, costCents: segments, segments };
    }, (e) => AppError.externalService('Twilio', (e as Error).message, e));
  }
  validateRecipient(phone: string) { return /^\+[1-9]\d{1,14}$/.test(phone); }
}

export class ResendEmailAdapter implements ChannelAdapter {
  private apiKey = process.env.RESEND_API_KEY!;

  async send(input: SendMessageInput): Promise<Result<SendResult>> {
    return tryCatch(async () => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: input.fromName ? `${input.fromName} <${input.from}>` : input.from,
          to: input.to, subject: input.subject || 'Following up on your inquiry',
          html: input.bodyHtml || input.body.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join(''),
          text: input.body,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(`Resend: ${e.message || JSON.stringify(e)}`); }
      const data = await res.json();
      return { externalId: data.id, status: 'sent', costCents: 0 };
    }, (e) => AppError.externalService('Resend', (e as Error).message, e));
  }
  validateRecipient(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
}

const adapters: Partial<Record<ChannelType, ChannelAdapter>> = {};
export function getChannelAdapter(channel: ChannelType): ChannelAdapter {
  if (!adapters[channel]) {
    switch (channel) {
      case 'sms': adapters[channel] = new TwilioSmsAdapter(); break;
      case 'email': adapters[channel] = new ResendEmailAdapter(); break;
      default: throw new Error(`Unsupported channel: ${channel}`);
    }
  }
  return adapters[channel]!;
}
