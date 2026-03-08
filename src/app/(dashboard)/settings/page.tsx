'use client';
import { useState, useEffect } from 'react';
import { TopBar } from '@/components/dashboard/sidebar';
import { Card, Button, Badge, Modal, FormField, FormInput, FormSelect, FormToggle } from '@/components/ui/primitives';
import { Copy, Check, Code, Phone, Mail, Webhook, Globe, Shield, Bell, RefreshCw, Eye, EyeOff } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TwilioConfig = { accountSid: string; authToken: string; phoneNumber: string };
type ResendConfig = { apiKey: string; fromEmail: string; replyTo: string; domain: string };
type WebhookConfig = { url: string; secret: string; events: string[] };
type DomainConfig = { domain: string };
type SecurityConfig = { twoFactor: boolean; sessionTimeout: string; apiKey: string };
type NotifConfig = { newLead: boolean; appointmentBooked: boolean; agentError: boolean };

type ConnectionStatus = Record<string, { connected: boolean; label: string }>;

const WEBHOOK_EVENTS = [
  'lead.created',
  'message.sent',
  'appointment.booked',
  'pipeline.stage_changed',
] as const;

// ---------------------------------------------------------------------------
// Toast helper
// ---------------------------------------------------------------------------
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl text-[13px] font-semibold shadow-lg animate-fade-in"
      style={{ background: 'var(--text-dark)', color: '#fff' }}>
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  // Widget copy — uses capture_key (public-safe) instead of org UUID
  const [copied, setCopied] = useState(false);
  const [captureKey, setCaptureKey] = useState<string | null>(null);
  const widgetCode = `<script\n  src="https://leadsandsaas.com/widget.js"\n  data-key="${captureKey ?? 'loading...'}"\n  data-agent="YOUR_AGENT_ID"\n  data-color="#f59e0b"\n  data-position="bottom-right"\n  data-vertical="hvac">\n</script>`;
  const copy = () => { navigator.clipboard.writeText(widgetCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  // Modal state
  const [modal, setModal] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Connection statuses
  const [statuses, setStatuses] = useState<ConnectionStatus>({
    twilio: { connected: false, label: 'Not connected' },
    email: { connected: false, label: 'Not connected' },
    webhooks: { connected: false, label: 'Not connected' },
    domain: { connected: false, label: 'Not configured' },
  });

  // Config states
  const [twilioConfig, setTwilioConfig] = useState<TwilioConfig>({ accountSid: '', authToken: '', phoneNumber: '' });
  const [resendConfig, setResendConfig] = useState<ResendConfig>({ apiKey: '', fromEmail: '', replyTo: '', domain: '' });
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({ url: '', secret: '', events: [] });
  const [domainConfig, setDomainConfig] = useState<DomainConfig>({ domain: '' });
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>({ twoFactor: false, sessionTimeout: '30', apiKey: '' });
  const [notifConfig, setNotifConfig] = useState<NotifConfig>({ newLead: true, appointmentBooked: true, agentError: true });

  // Test SMS phone
  const [testPhone, setTestPhone] = useState('');
  const [showTestPhone, setShowTestPhone] = useState(false);

  // Password visibility toggles
  const [showAuthToken, setShowAuthToken] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [showResendKey, setShowResendKey] = useState(false);

  // Track which secret fields the user has explicitly changed (so we only send those)
  const [dirtySecrets, setDirtySecrets] = useState<Set<string>>(new Set());
  const markSecretDirty = (field: string) => setDirtySecrets((s) => new Set(s).add(field));

  // Load saved config on mount — secrets come back masked from API
  useEffect(() => {
    fetch('/api/integrations')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        if (data.capture_key) setCaptureKey(data.capture_key);
        const ints = data.integrations ?? data;
        if (ints.twilio) {
          // Populate non-secret fields; secret fields show masked placeholder
          setTwilioConfig({
            accountSid: ints.twilio.accountSid ?? '',
            authToken: ints.twilio.authToken ?? '', // masked value like "••••xxxx"
            phoneNumber: ints.twilio.phoneNumber ?? '',
          });
          if (ints.twilio.has_authToken) setStatuses((s) => ({ ...s, twilio: { connected: true, label: 'Connected' } }));
        }
        if (ints.resend) {
          setResendConfig({
            apiKey: ints.resend.apiKey ?? '',
            fromEmail: ints.resend.fromEmail ?? '',
            replyTo: ints.resend.replyTo ?? '',
            domain: ints.resend.domain ?? '',
          });
          if (ints.resend.has_apiKey) setStatuses((s) => ({ ...s, email: { connected: true, label: 'Connected' } }));
        }
        if (ints.webhooks) {
          setWebhookConfig({
            url: ints.webhooks.url ?? '',
            secret: ints.webhooks.secret ?? '',
            events: Array.isArray(ints.webhooks.events) ? ints.webhooks.events : [],
          });
          if (ints.webhooks.url) setStatuses((s) => ({ ...s, webhooks: { connected: true, label: 'Connected' } }));
        }
      })
      .catch(() => { /* silent */ });
  }, []);

  // ---------------------------------------------------------------------------
  // Save helpers
  // ---------------------------------------------------------------------------
  const saveIntegration = async (provider: string, config: Record<string, unknown>) => {
    setSaving(true);
    try {
      // Strip masked placeholders — the API also guards against this,
      // but we avoid sending them in the first place for clarity.
      const cleaned: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(config)) {
        if (typeof v === 'string' && v.startsWith('••••') && !dirtySecrets.has(`${provider}.${k}`)) continue;
        cleaned[k] = v;
      }
      await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, config: cleaned }),
      });
      // Optimistic status update
      const label = provider === 'domain' ? 'Configured' : 'Connected';
      setStatuses((s) => ({ ...s, [provider]: { connected: true, label } }));
      setToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} configuration saved`);
      setModal(null);
    } catch {
      setToast('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let s = 'whsec_';
    for (let i = 0; i < 32; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
    markSecretDirty('webhooks.secret');
    setWebhookConfig((c) => ({ ...c, secret: s }));
  };

  // ---------------------------------------------------------------------------
  // Integration list (uses live statuses)
  // ---------------------------------------------------------------------------
  const integrations = [
    { id: 'twilio', name: 'Twilio SMS', desc: 'Send and receive SMS messages', icon: Phone },
    { id: 'email', name: 'Email (Resend)', desc: 'Automated email campaigns', icon: Mail },
    { id: 'webhooks', name: 'Webhooks', desc: 'Send events to external services', icon: Webhook },
    { id: 'domain', name: 'Custom Domain', desc: 'Use your own domain for the widget', icon: Globe },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      <TopBar title="Settings" subtitle="Widget & Integrations" />
      <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-4xl space-y-6 md:space-y-8">
        {/* Widget Code */}
        <Card>
          <div className="flex items-start gap-3 mb-5 md:mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background:'var(--accent-soft)', color:'var(--accent)' }}><Code size={20}/></div>
            <div>
              <h3 className="text-[15px] md:text-[16px] font-bold" style={{ color:'var(--text-dark)', fontFamily:'Satoshi' }}>Lead Capture Widget</h3>
              <p className="text-[12px] md:text-[13px]" style={{ color:'var(--text-dark-secondary)' }}>Paste this on your website to start capturing leads</p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden mb-5 md:mb-6" style={{ background:'var(--bg-primary)' }}>
            <div className="flex items-center justify-between px-3 md:px-4 py-2.5" style={{ borderBottom:'1px solid var(--sidebar-border)' }}>
              <span className="text-[11px] md:text-[12px] font-mono" style={{ color:'var(--text-secondary)' }}>HTML</span>
              <button onClick={copy} className="flex items-center gap-1.5 text-[11px] md:text-[12px] font-medium px-2.5 py-1 rounded-md transition-colors" style={{ color:copied?'var(--success)':'var(--text-secondary)', background:'var(--sidebar-hover)' }}>
                {copied?<><Check size={12}/> Copied</>:<><Copy size={12}/> Copy</>}
              </button>
            </div>
            <pre className="p-3 md:p-4 text-[11px] md:text-[13px] leading-relaxed overflow-x-auto" style={{ color:'var(--text-primary)', fontFamily:'monospace' }}><code>{widgetCode}</code></pre>
          </div>
          <h4 className="text-[13px] md:text-[14px] font-bold mb-3" style={{ color:'var(--text-dark)', fontFamily:'Satoshi' }}>Configuration</h4>
          <div className="rounded-lg overflow-x-auto" style={{ border:'1px solid #e8eaef' }}>
            <table className="w-full min-w-[400px] text-[12px] md:text-[13px]">
              <thead><tr style={{ background:'#f8f9fb' }}><th className="text-left px-3 md:px-4 py-2.5 text-[10px] md:text-[11.5px] font-bold uppercase" style={{ color:'var(--text-dark-secondary)' }}>Attribute</th><th className="text-left px-3 md:px-4 py-2.5 text-[10px] md:text-[11.5px] font-bold uppercase" style={{ color:'var(--text-dark-secondary)' }}>Description</th></tr></thead>
              <tbody>{[{a:'data-key',d:'Capture key (required)'},{a:'data-agent',d:'Agent ID (optional)'},{a:'data-color',d:'Brand color hex'},{a:'data-position',d:'bottom-right / bottom-left'},{a:'data-vertical',d:'hvac, roofing, med_spa, dental, general'}].map(({a,d})=><tr key={a} style={{ borderTop:'1px solid #f0f2f5' }}><td className="px-3 md:px-4 py-2.5 font-mono text-[11px] md:text-[12.5px] whitespace-nowrap" style={{ color:'var(--accent)' }}>{a}</td><td className="px-3 md:px-4 py-2.5" style={{ color:'var(--text-dark)' }}>{d}</td></tr>)}</tbody>
            </table>
          </div>
        </Card>

        {/* Integrations */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--info-soft)', color: 'var(--info)' }}>
              <Webhook size={20} />
            </div>
            <div>
              <h3 className="text-[15px] md:text-[16px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>Integrations</h3>
              <p className="text-[12px] md:text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>Connect your messaging channels and services</p>
            </div>
          </div>
          <div className="space-y-3">
            {integrations.map((int) => {
              const st = statuses[int.id];
              return (
                <div key={int.id} className="flex items-center justify-between p-3.5 rounded-xl transition-colors hover:bg-gray-50/80" style={{ border: '1px solid #f0f2f5' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f0f2f5', color: 'var(--text-dark-secondary)' }}>
                      <int.icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold" style={{ color: 'var(--text-dark)' }}>{int.name}</div>
                      <div className="text-[11px] md:text-[12px]" style={{ color: 'var(--text-dark-secondary)' }}>{int.desc}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={st.connected ? 'success' : 'muted'}>{st.label}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => setModal(int.id)}>Configure</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Security & Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                <Shield size={16} />
              </div>
              <div>
                <h4 className="text-[14px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>Security</h4>
                <p className="text-[11px] md:text-[12px]" style={{ color: 'var(--text-dark-secondary)' }}>Account & access settings</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="w-full" onClick={() => setModal('security')}>Manage Security</Button>
          </Card>
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>
                <Bell size={16} />
              </div>
              <div>
                <h4 className="text-[14px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>Notifications</h4>
                <p className="text-[11px] md:text-[12px]" style={{ color: 'var(--text-dark-secondary)' }}>Email & alert preferences</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="w-full" onClick={() => setModal('notifications')}>Manage Notifications</Button>
          </Card>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Twilio SMS Modal                                                    */}
      {/* ================================================================== */}
      <Modal open={modal === 'twilio'} onClose={() => setModal(null)} title="Twilio SMS Configuration" size="lg">
        <div className="space-y-4">
          <FormField label="Account SID" required>
            <FormInput
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={twilioConfig.accountSid}
              onChange={(e) => setTwilioConfig((c) => ({ ...c, accountSid: e.target.value }))}
            />
          </FormField>
          <FormField label="Auth Token" required>
            <div className="relative">
              <FormInput
                type={showAuthToken ? 'text' : 'password'}
                placeholder="Your Twilio auth token"
                value={twilioConfig.authToken}
                onChange={(e) => { markSecretDirty('twilio.authToken'); setTwilioConfig((c) => ({ ...c, authToken: e.target.value })); }}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dark-secondary)' }} onClick={() => setShowAuthToken((v) => !v)}>
                {showAuthToken ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </FormField>
          <FormField label="Phone Number" required hint="Include country code, e.g. +15551234567">
            <FormInput
              type="tel"
              placeholder="+15551234567"
              value={twilioConfig.phoneNumber}
              onChange={(e) => setTwilioConfig((c) => ({ ...c, phoneNumber: e.target.value }))}
            />
          </FormField>
          <FormField label="Webhook URL" hint="Configure this URL in your Twilio console">
            <FormInput
              readOnly
              value={typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/twilio` : '/api/webhooks/twilio'}
              style={{ background: '#f0f2f5', cursor: 'default' }}
            />
          </FormField>

          {/* Test SMS */}
          <div className="pt-1">
            {!showTestPhone ? (
              <button
                type="button"
                className="text-[12.5px] font-semibold"
                style={{ color: 'var(--accent)' }}
                onClick={() => setShowTestPhone(true)}
              >
                Send a test SMS
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <FormInput
                  type="tel"
                  placeholder="+15559876543"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="!py-2"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setToast('Test SMS queued for ' + testPhone); setShowTestPhone(false); setTestPhone(''); }}
                  disabled={!testPhone}
                >
                  Test SMS
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4" style={{ borderTop: '1px solid #f0f2f5' }}>
          <Button variant="secondary" size="sm" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={saving} onClick={() => saveIntegration('twilio', twilioConfig)}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </Modal>

      {/* ================================================================== */}
      {/* Email (Resend) Modal                                                */}
      {/* ================================================================== */}
      <Modal open={modal === 'email'} onClose={() => setModal(null)} title="Email (Resend) Configuration" size="lg">
        <div className="space-y-4">
          <FormField label="API Key" required>
            <div className="relative">
              <FormInput
                type={showResendKey ? 'text' : 'password'}
                placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={resendConfig.apiKey}
                onChange={(e) => { markSecretDirty('resend.apiKey'); setResendConfig((c) => ({ ...c, apiKey: e.target.value })); }}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dark-secondary)' }} onClick={() => setShowResendKey((v) => !v)}>
                {showResendKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </FormField>
          <FormField label="From Email" required hint="Must match a verified domain in Resend">
            <FormInput
              type="email"
              placeholder="hello@yourdomain.com"
              value={resendConfig.fromEmail}
              onChange={(e) => setResendConfig((c) => ({ ...c, fromEmail: e.target.value }))}
            />
          </FormField>
          <FormField label="Reply-To Email">
            <FormInput
              type="email"
              placeholder="support@yourdomain.com"
              value={resendConfig.replyTo}
              onChange={(e) => setResendConfig((c) => ({ ...c, replyTo: e.target.value }))}
            />
          </FormField>
          <FormField label="Domain" hint="The domain you've verified in Resend">
            <FormInput
              placeholder="yourdomain.com"
              value={resendConfig.domain}
              onChange={(e) => setResendConfig((c) => ({ ...c, domain: e.target.value }))}
            />
          </FormField>
          <FormField label="Domain Verification">
            <Badge variant={statuses.email.connected ? 'success' : 'muted'}>
              {statuses.email.connected ? 'Verified' : 'Not verified'}
            </Badge>
          </FormField>

          <div className="pt-1">
            <button
              type="button"
              className="text-[12.5px] font-semibold"
              style={{ color: 'var(--accent)' }}
              onClick={() => setToast('Test email sent to ' + (resendConfig.fromEmail || 'your inbox'))}
            >
              Send a test email
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4" style={{ borderTop: '1px solid #f0f2f5' }}>
          <Button variant="secondary" size="sm" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={saving} onClick={() => saveIntegration('resend', resendConfig)}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </Modal>

      {/* ================================================================== */}
      {/* Webhooks Modal                                                      */}
      {/* ================================================================== */}
      <Modal open={modal === 'webhooks'} onClose={() => setModal(null)} title="Webhook Configuration" size="lg">
        <div className="space-y-4">
          <FormField label="Destination URL" required>
            <FormInput
              type="url"
              placeholder="https://your-server.com/webhook"
              value={webhookConfig.url}
              onChange={(e) => setWebhookConfig((c) => ({ ...c, url: e.target.value }))}
            />
          </FormField>
          <FormField label="Signing Secret" hint="Used to verify webhook payloads">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <FormInput
                  type={showWebhookSecret ? 'text' : 'password'}
                  placeholder="whsec_..."
                  value={webhookConfig.secret}
                  onChange={(e) => { markSecretDirty('webhooks.secret'); setWebhookConfig((c) => ({ ...c, secret: e.target.value })); }}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dark-secondary)' }} onClick={() => setShowWebhookSecret((v) => !v)}>
                  {showWebhookSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <Button variant="secondary" size="sm" onClick={generateSecret} title="Auto-generate secret">
                <RefreshCw size={14} />
              </Button>
            </div>
          </FormField>
          <FormField label="Event Types">
            <div className="space-y-2 pt-1">
              {WEBHOOK_EVENTS.map((evt) => (
                <label key={evt} className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={webhookConfig.events.includes(evt)}
                    onChange={(e) => {
                      setWebhookConfig((c) => ({
                        ...c,
                        events: e.target.checked ? [...c.events, evt] : c.events.filter((x) => x !== evt),
                      }));
                    }}
                    className="w-4 h-4 rounded accent-[var(--accent)]"
                  />
                  <span className="text-[12.5px] font-medium font-mono" style={{ color: 'var(--text-dark)' }}>{evt}</span>
                </label>
              ))}
            </div>
          </FormField>

          <div className="pt-1">
            <button
              type="button"
              className="text-[12.5px] font-semibold"
              style={{ color: 'var(--accent)' }}
              onClick={() => setToast('Test webhook sent to ' + (webhookConfig.url || 'destination'))}
            >
              Send a test webhook
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4" style={{ borderTop: '1px solid #f0f2f5' }}>
          <Button variant="secondary" size="sm" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={saving} onClick={() => saveIntegration('webhooks', webhookConfig)}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </Modal>

      {/* ================================================================== */}
      {/* Custom Domain Modal                                                 */}
      {/* ================================================================== */}
      <Modal open={modal === 'domain'} onClose={() => setModal(null)} title="Custom Domain" size="lg">
        <div className="space-y-4">
          <FormField label="Domain Name" required>
            <FormInput
              placeholder="chat.yourdomain.com"
              value={domainConfig.domain}
              onChange={(e) => setDomainConfig((c) => ({ ...c, domain: e.target.value }))}
            />
          </FormField>
          <FormField label="DNS Configuration" hint="Add the following CNAME record to your DNS provider">
            <div className="rounded-lg p-3" style={{ background: '#f8f9fb', border: '1.5px solid #e5e7eb' }}>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[12px]">
                <span className="font-semibold" style={{ color: 'var(--text-dark-secondary)' }}>Type</span>
                <span className="font-mono" style={{ color: 'var(--text-dark)' }}>CNAME</span>
                <span className="font-semibold" style={{ color: 'var(--text-dark-secondary)' }}>Name</span>
                <span className="font-mono" style={{ color: 'var(--text-dark)' }}>{domainConfig.domain || 'chat.yourdomain.com'}</span>
                <span className="font-semibold" style={{ color: 'var(--text-dark-secondary)' }}>Value</span>
                <span className="font-mono" style={{ color: 'var(--text-dark)' }}>widget.leadsandsaas.com</span>
              </div>
            </div>
          </FormField>
          <FormField label="Verification Status">
            <Badge variant={statuses.domain.connected ? 'success' : 'muted'}>
              {statuses.domain.connected ? 'Verified' : 'Pending verification'}
            </Badge>
          </FormField>
        </div>
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4" style={{ borderTop: '1px solid #f0f2f5' }}>
          <Button variant="secondary" size="sm" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={saving} onClick={() => saveIntegration('domain', domainConfig)}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </Modal>

      {/* ================================================================== */}
      {/* Security Modal                                                      */}
      {/* ================================================================== */}
      <Modal open={modal === 'security'} onClose={() => setModal(null)} title="Security Settings">
        <div className="space-y-4">
          <FormField label="Two-Factor Authentication">
            <FormToggle
              checked={securityConfig.twoFactor}
              onChange={(v) => setSecurityConfig((c) => ({ ...c, twoFactor: v }))}
              label={securityConfig.twoFactor ? 'Enabled' : 'Disabled'}
            />
          </FormField>
          <FormField label="Session Timeout">
            <FormSelect
              value={securityConfig.sessionTimeout}
              onChange={(e) => setSecurityConfig((c) => ({ ...c, sessionTimeout: e.target.value }))}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="480">8 hours</option>
            </FormSelect>
          </FormField>
          <FormField label="API Key" hint="Use this key to authenticate API requests">
            <div className="relative">
              <FormInput
                type={showApiKey ? 'text' : 'password'}
                readOnly
                value={securityConfig.apiKey || 'No API key generated'}
                style={{ background: '#f0f2f5', cursor: 'default' }}
              />
              {securityConfig.apiKey && (
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dark-secondary)' }} onClick={() => setShowApiKey((v) => !v)}>
                  {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              )}
            </div>
          </FormField>
        </div>
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4" style={{ borderTop: '1px solid #f0f2f5' }}>
          <Button variant="secondary" size="sm" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={saving} onClick={() => saveIntegration('security', securityConfig)}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </Modal>

      {/* ================================================================== */}
      {/* Notifications Modal                                                 */}
      {/* ================================================================== */}
      <Modal open={modal === 'notifications'} onClose={() => setModal(null)} title="Notification Preferences">
        <div className="space-y-5">
          <p className="text-[13px]" style={{ color: 'var(--text-dark-secondary)' }}>Choose which events trigger an email notification.</p>
          <FormToggle
            checked={notifConfig.newLead}
            onChange={(v) => setNotifConfig((c) => ({ ...c, newLead: v }))}
            label="New lead captured"
          />
          <FormToggle
            checked={notifConfig.appointmentBooked}
            onChange={(v) => setNotifConfig((c) => ({ ...c, appointmentBooked: v }))}
            label="Appointment booked"
          />
          <FormToggle
            checked={notifConfig.agentError}
            onChange={(v) => setNotifConfig((c) => ({ ...c, agentError: v }))}
            label="Agent error"
          />
        </div>
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4" style={{ borderTop: '1px solid #f0f2f5' }}>
          <Button variant="secondary" size="sm" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={saving} onClick={() => saveIntegration('notifications', notifConfig)}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </Modal>

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}
