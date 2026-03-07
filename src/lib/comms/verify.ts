import { createHmac, timingSafeEqual as tse } from 'crypto';

export function verifyTwilioSignature(url: string, params: URLSearchParams, signature: string): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false;
  const sorted = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b)).reduce((acc, [k, v]) => acc + k + v, '');
  const expected = createHmac('sha1', authToken).update(url + sorted).digest('base64');
  try { return tse(Buffer.from(expected), Buffer.from(signature)); } catch { return false; }
}

export function verifyResendSignature(body: string, signature: string): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  try { return tse(Buffer.from(expected), Buffer.from(signature)); } catch { return false; }
}
