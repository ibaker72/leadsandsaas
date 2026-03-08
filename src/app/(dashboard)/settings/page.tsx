'use client';
import { useState } from 'react';
import { TopBar } from '@/components/dashboard/sidebar';
import { Card, Button, Badge, Modal, ComingSoonContent } from '@/components/ui/primitives';
import { Copy, Check, Code, Phone, Mail, Webhook, Globe, Shield, Bell } from 'lucide-react';

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const code = '<script\n  src="https://leadsandsaas.com/widget.js"\n  data-org="YOUR_ORG_ID"\n  data-agent="YOUR_AGENT_ID"\n  data-color="#f59e0b"\n  data-position="bottom-right"\n  data-vertical="hvac">\n</script>';
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false), 2000); };

  const integrations = [
    { id: 'twilio', name: 'Twilio SMS', desc: 'Send and receive SMS messages', icon: Phone, status: 'Not connected' },
    { id: 'email', name: 'Email (Resend)', desc: 'Automated email campaigns', icon: Mail, status: 'Not connected' },
    { id: 'webhooks', name: 'Webhooks', desc: 'Send events to external services', icon: Webhook, status: 'Not connected' },
    { id: 'domain', name: 'Custom Domain', desc: 'Use your own domain for the widget', icon: Globe, status: 'Not configured' },
  ];

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
            <pre className="p-3 md:p-4 text-[11px] md:text-[13px] leading-relaxed overflow-x-auto" style={{ color:'var(--text-primary)', fontFamily:'monospace' }}><code>{code}</code></pre>
          </div>
          <h4 className="text-[13px] md:text-[14px] font-bold mb-3" style={{ color:'var(--text-dark)', fontFamily:'Satoshi' }}>Configuration</h4>
          <div className="rounded-lg overflow-x-auto" style={{ border:'1px solid #e8eaef' }}>
            <table className="w-full min-w-[400px] text-[12px] md:text-[13px]">
              <thead><tr style={{ background:'#f8f9fb' }}><th className="text-left px-3 md:px-4 py-2.5 text-[10px] md:text-[11.5px] font-bold uppercase" style={{ color:'var(--text-dark-secondary)' }}>Attribute</th><th className="text-left px-3 md:px-4 py-2.5 text-[10px] md:text-[11.5px] font-bold uppercase" style={{ color:'var(--text-dark-secondary)' }}>Description</th></tr></thead>
              <tbody>{[{a:'data-org',d:'Organization ID (required)'},{a:'data-agent',d:'Agent ID (optional)'},{a:'data-color',d:'Brand color hex'},{a:'data-position',d:'bottom-right / bottom-left'},{a:'data-vertical',d:'hvac, roofing, med_spa, dental, general'}].map(({a,d})=><tr key={a} style={{ borderTop:'1px solid #f0f2f5' }}><td className="px-3 md:px-4 py-2.5 font-mono text-[11px] md:text-[12.5px] whitespace-nowrap" style={{ color:'var(--accent)' }}>{a}</td><td className="px-3 md:px-4 py-2.5" style={{ color:'var(--text-dark)' }}>{d}</td></tr>)}</tbody>
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
            {integrations.map((int) => (
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
                  <Badge variant="muted">{int.status}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => setModal(int.name)}>Configure</Button>
                </div>
              </div>
            ))}
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
            <Button variant="secondary" size="sm" className="w-full" onClick={() => setModal('Security Settings')}>Manage Security</Button>
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
            <Button variant="secondary" size="sm" className="w-full" onClick={() => setModal('Notification Preferences')}>Manage Notifications</Button>
          </Card>
        </div>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal || 'Settings'}>
        <ComingSoonContent
          feature={modal || 'Configuration'}
          description="This configuration panel will be available in the next update. All settings will be persisted to your organization profile."
        />
        <Button variant="primary" size="md" className="w-full mt-4" onClick={() => setModal(null)}>Got it</Button>
      </Modal>
    </>
  );
}
