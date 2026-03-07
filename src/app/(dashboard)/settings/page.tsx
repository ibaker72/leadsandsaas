'use client';
import { useState } from 'react';
import { TopBar } from '@/components/dashboard/sidebar';
import { Card, Button } from '@/components/ui/primitives';
import { Copy, Check, Code } from 'lucide-react';

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const code = '<script\n  src="https://leadsandsaas.com/widget.js"\n  data-org="YOUR_ORG_ID"\n  data-agent="YOUR_AGENT_ID"\n  data-color="#f59e0b"\n  data-position="bottom-right"\n  data-vertical="hvac">\n</script>';
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false), 2000); };
  return (
    <>
      <TopBar title="Settings" subtitle="Widget & Integrations" />
      <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-4xl">
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
              <button onClick={copy} className="flex items-center gap-1.5 text-[11px] md:text-[12px] font-medium px-2.5 py-1 rounded-md" style={{ color:copied?'var(--success)':'var(--text-secondary)', background:'var(--sidebar-hover)' }}>{copied?<><Check size={12}/> Copied</>:<><Copy size={12}/> Copy</>}</button>
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
      </div>
    </>
  );
}
