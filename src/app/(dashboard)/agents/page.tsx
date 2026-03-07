'use client';
import { TopBar } from '@/components/dashboard/sidebar';
import { Badge, Button, Card, AGENT_STATUS_VARIANT } from '@/components/ui/primitives';
import { Bot, Plus, Play, Pause, Settings, MessageSquare, Calendar, TrendingUp, Clock, Zap, Phone, Mail, BookOpen } from 'lucide-react';

const AGENTS = [
  { id:'1', name:'HVAC Sales Pro', desc:'AC/heating inquiries, qualifies leads, books service calls.', vertical:'hvac', status:'active' as const, sms:true, email:true, kb:8, convos:156, booked:34, converted:18, time:'28s', rate:11.5, last:'2m ago' },
  { id:'2', name:'Roofing Lead Closer', desc:'Storm damage, insurance claims, inspection scheduling.', vertical:'roofing', status:'active' as const, sms:true, email:true, kb:12, convos:89, booked:22, converted:11, time:'32s', rate:12.4, last:'5m ago' },
  { id:'3', name:'Med Spa Concierge', desc:'Warm consultative approach for treatment inquiries.', vertical:'med_spa', status:'active' as const, sms:true, email:true, kb:15, convos:203, booked:67, converted:41, time:'24s', rate:20.2, last:'1m ago' },
  { id:'4', name:'Dental Intake Bot', desc:'New patient inquiries, insurance, cleaning scheduling.', vertical:'dental', status:'draft' as const, sms:false, email:true, kb:3, convos:0, booked:0, converted:0, time:'-', rate:0, last:'Never' },
];
const VC: Record<string,string> = { hvac:'#3b82f6', roofing:'#f97316', med_spa:'#d946ef', dental:'#06b6d4' };

function Mini({ icon, value, label }: { icon: React.ReactNode; value: string|number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:'#f0f2f5', color:'var(--text-dark-secondary)' }}>{icon}</div>
      <div>
        <div className="text-[13px] md:text-[14px] font-bold tabular-nums" style={{ color:'var(--text-dark)', fontFamily:'Satoshi' }}>{value}</div>
        <div className="text-[10px] md:text-[11px]" style={{ color:'var(--text-dark-secondary)' }}>{label}</div>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  return (
    <>
      <TopBar title="Agents" subtitle={`${AGENTS.length} agents · ${AGENTS.filter(a=>a.status==='active').length} active`} />
      <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-4 md:space-y-5">
        <div className="flex items-center justify-end">
          <Button variant="primary" size="md"><Plus size={15}/> New Agent</Button>
        </div>
        {AGENTS.map(a => {
          const vc = VC[a.vertical]||'#8b5cf6';
          return (
            <Card key={a.id} padding={false} className="group animate-fade-in overflow-hidden">
              <div className="h-1" style={{ background:vc }}/>
              <div className="p-4 md:p-5 pb-3 md:pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background:`${vc}14`, color:vc }}><Bot size={20}/></div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[15px] md:text-[16px] font-bold" style={{ color:'var(--text-dark)', fontFamily:'Satoshi' }}>{a.name}</h3>
                        <Badge variant={AGENT_STATUS_VARIANT[a.status]} dot>{a.status}</Badge>
                      </div>
                      <p className="text-[12px] md:text-[12.5px] mt-1 line-clamp-2" style={{ color:'var(--text-dark-secondary)' }}>{a.desc}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {a.status==='active'?<Button variant="ghost" size="sm"><Pause size={13}/> Pause</Button>:a.status==='draft'?<Button variant="primary" size="sm"><Play size={13}/> Activate</Button>:null}
                    <Button variant="ghost" size="sm"><Settings size={14}/></Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-3">
                  {a.sms&&<span className="flex items-center gap-1 text-[10px] md:text-[11px] font-medium px-1.5 md:px-2 py-0.5 rounded-md badge-inline" style={{ background:'#f0f2f5', color:'var(--text-dark-secondary)' }}><Phone size={9}/> SMS</span>}
                  {a.email&&<span className="flex items-center gap-1 text-[10px] md:text-[11px] font-medium px-1.5 md:px-2 py-0.5 rounded-md badge-inline" style={{ background:'#f0f2f5', color:'var(--text-dark-secondary)' }}><Mail size={9}/> Email</span>}
                  <span className="flex items-center gap-1 text-[10px] md:text-[11px] font-medium px-1.5 md:px-2 py-0.5 rounded-md badge-inline" style={{ background:'#f0f2f5', color:'var(--text-dark-secondary)' }}><BookOpen size={9}/> {a.kb} KB</span>
                  <span className="text-[10px] md:text-[11px] ml-auto hidden sm:block" style={{ color:'var(--text-dark-secondary)' }}>Active {a.last}</span>
                </div>
              </div>
              {/* Stats — 3-col on mobile, 5-col on desktop */}
              <div className="px-4 md:px-5 py-3 md:py-4 grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4" style={{ borderTop:'1px solid #f0f2f5' }}>
                <Mini icon={<MessageSquare size={13}/>} value={a.convos} label="Convos"/>
                <Mini icon={<Calendar size={13}/>} value={a.booked} label="Booked"/>
                <Mini icon={<TrendingUp size={13}/>} value={a.converted} label="Converted"/>
                <Mini icon={<Clock size={13}/>} value={a.time} label="Avg Resp."/>
                <Mini icon={<Zap size={13}/>} value={`${a.rate}%`} label="Conv Rate"/>
              </div>
              {/* Mobile action row */}
              <div className="md:hidden px-4 py-3 flex gap-2" style={{ borderTop:'1px solid #f0f2f5' }}>
                {a.status==='active'?<Button variant="ghost" size="sm" className="flex-1"><Pause size={13}/> Pause</Button>:a.status==='draft'?<Button variant="primary" size="sm" className="flex-1"><Play size={13}/> Activate</Button>:null}
                <Button variant="secondary" size="sm" className="flex-1"><Settings size={13}/> Configure</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
