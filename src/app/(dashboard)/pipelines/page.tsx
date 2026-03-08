'use client';
import { TopBar } from '@/components/dashboard/sidebar';
import { Plus, MoreHorizontal, Phone, Mail } from 'lucide-react';

const STAGES = [
  { id:'new', name:'New Lead', color:'#6366f1', leads:[{id:'l1',name:'Emily Davis',val:350,svc:'HydraFacial',days:0,ch:'email'},{id:'l2',name:'David Chen',val:500,svc:'Botox Consult',days:1,ch:'sms'}] },
  { id:'contacted', name:'Contacted', color:'#8b5cf6', leads:[{id:'l3',name:'Sarah Mitchell',val:4800,svc:'AC Repair',days:0,ch:'sms'},{id:'l4',name:'James Wilson',val:12000,svc:'Roof Inspection',days:1,ch:'sms'}] },
  { id:'qualified', name:'Qualified', color:'#a855f7', leads:[{id:'l5',name:'Marcus Johnson',val:15000,svc:'Full Replacement',days:2,ch:'email'}] },
  { id:'proposal', name:'Proposal Sent', color:'#d946ef', leads:[{id:'l6',name:'Lisa Rodriguez',val:6500,svc:'AC Installation',days:3,ch:'sms'}] },
  { id:'negotiation', name:'Negotiation', color:'#ec4899', leads:[{id:'l7',name:'Robert Brown',val:8200,svc:'Furnace + AC',days:2,ch:'sms'}] },
  { id:'won', name:'Won', color:'#22c55e', leads:[{id:'l8',name:'Jennifer Taylor',val:3400,svc:'AC Repair',days:0,ch:'email'}] },
];

export default function PipelinePage() {
  const total = STAGES.reduce((s,st)=>s+st.leads.reduce((a,l)=>a+l.val,0),0);
  const count = STAGES.reduce((s,st)=>s+st.leads.length,0);
  return (
    <>
      <TopBar title="Pipeline" subtitle={`${count} deals · $${total.toLocaleString()}`} />
      <div className="flex-1 p-3 md:p-6 overflow-x-auto">
        {/* Horizontal scroll — touch-friendly on mobile */}
        <div className="flex gap-3 md:gap-4 min-w-max pb-4 snap-x snap-mandatory md:snap-none">
          {STAGES.map(st => {
            const sv = st.leads.reduce((a,l)=>a+l.val,0);
            return (
              <div key={st.id} className="w-[260px] md:w-[280px] shrink-0 flex flex-col rounded-xl snap-start overflow-hidden" style={{ background:'#f8f9fb', border:'1px solid #e8eaef', maxHeight:'calc(100vh - 140px)' }}>
                {/* Stage color header */}
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${st.color}, ${st.color}66)` }} />
                <div className="p-3 md:p-3.5 shrink-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background:st.color }}/>
                      <span className="text-[12px] md:text-[13px] font-bold" style={{ color:'var(--text-dark)', fontFamily:'Satoshi' }}>{st.name}</span>
                      <span className="text-[10px] md:text-[11px] font-semibold px-1.5 py-0.5 rounded-md badge-inline" style={{ background:'#e8eaef', color:'var(--text-dark-secondary)' }}>{st.leads.length}</span>
                    </div>
                    <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-200 btn-icon-sm"><Plus size={14} style={{ color:'var(--text-dark-secondary)' }}/></button>
                  </div>
                  <div className="text-[12px] md:text-[13px] font-bold tabular-nums" style={{ color: st.color }}>${sv.toLocaleString()}</div>
                </div>
                <div className="flex-1 overflow-y-auto px-2 md:px-2.5 pb-2.5">
                  {st.leads.map(l => {
                    const urgencyColor = l.days >= 5 ? 'var(--danger)' : l.days >= 3 ? 'var(--warning)' : 'var(--text-dark-secondary)';
                    return (
                    <div key={l.id} className="rounded-lg mb-2 md:mb-2.5 cursor-pointer active:scale-[0.98] transition-transform group overflow-hidden" style={{ background:'#fff', border:'1px solid #e8eaef', boxShadow:'var(--shadow-sm)' }}>
                      {/* Value-proportional accent at top */}
                      <div className="h-[2px]" style={{ background: st.color, opacity: Math.min(l.val / 15000, 1) * 0.6 + 0.4 }} />
                      <div className="p-3 md:p-3.5">
                        <div className="flex items-start justify-between mb-1.5 md:mb-2">
                          <span className="text-[12px] md:text-[13px] font-semibold" style={{ color:'var(--text-dark)' }}>{l.name}</span>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity btn-icon-sm"><MoreHorizontal size={14} style={{ color:'var(--text-dark-secondary)' }}/></button>
                        </div>
                        <div className="text-[11px] md:text-[12px] mb-2" style={{ color:'var(--text-dark-secondary)' }}>{l.svc}</div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[14px] md:text-[15px] font-bold tabular-nums" style={{ color:'var(--text-dark)', fontFamily:'Satoshi' }}>${l.val.toLocaleString()}</span>
                          <span className="text-[10px] md:text-[11px] font-semibold px-1.5 py-0.5 rounded-md" style={{ color: urgencyColor, background: l.days >= 3 ? `${urgencyColor}14` : 'transparent' }}>{l.days}d</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] px-2 py-1 rounded-md" style={{ background:'#f5f6f8', color:'var(--text-dark-secondary)' }}>{l.ch==='sms'?<Phone size={9}/>:<Mail size={9}/>}Next action pending</div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
