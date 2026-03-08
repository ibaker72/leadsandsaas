'use client';
import { useState } from 'react';
import { TopBar } from '@/components/dashboard/sidebar';
import { Badge, Button, Card, AGENT_STATUS_VARIANT, LiveIndicator, Modal, FormField, FormInput, FormSelect, FormTextarea, FormToggle } from '@/components/ui/primitives';
import { Bot, Plus, Play, Pause, Settings, MessageSquare, Calendar, TrendingUp, Clock, Zap, Phone, Mail, BookOpen, CheckCircle } from 'lucide-react';

type AgentStatus = 'active' | 'draft' | 'paused';

interface Agent {
  id: string;
  name: string;
  desc: string;
  vertical: string;
  status: AgentStatus;
  sms: boolean;
  email: boolean;
  kb: number;
  convos: number;
  booked: number;
  converted: number;
  time: string;
  rate: number;
  last: string;
}

const INITIAL_AGENTS: Agent[] = [
  { id:'1', name:'HVAC Sales Pro', desc:'AC/heating inquiries, qualifies leads, books service calls.', vertical:'hvac', status:'active', sms:true, email:true, kb:8, convos:156, booked:34, converted:18, time:'28s', rate:11.5, last:'2m ago' },
  { id:'2', name:'Roofing Lead Closer', desc:'Storm damage, insurance claims, inspection scheduling.', vertical:'roofing', status:'active', sms:true, email:true, kb:12, convos:89, booked:22, converted:11, time:'32s', rate:12.4, last:'5m ago' },
  { id:'3', name:'Med Spa Concierge', desc:'Warm consultative approach for treatment inquiries.', vertical:'med_spa', status:'active', sms:true, email:true, kb:15, convos:203, booked:67, converted:41, time:'24s', rate:20.2, last:'1m ago' },
  { id:'4', name:'Dental Intake Bot', desc:'New patient inquiries, insurance, cleaning scheduling.', vertical:'dental', status:'draft', sms:false, email:true, kb:3, convos:0, booked:0, converted:0, time:'-', rate:0, last:'Never' },
];

const VERTICALS = [
  { value: 'hvac', label: 'HVAC' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'med_spa', label: 'Med Spa' },
  { value: 'dental', label: 'Dental' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'legal', label: 'Legal' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'auto_repair', label: 'Auto Repair' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'general', label: 'General' },
];

const VC: Record<string,string> = { hvac:'#3b82f6', roofing:'#f97316', med_spa:'#d946ef', dental:'#06b6d4', plumbing:'#10b981', electrical:'#eab308', legal:'#6366f1', real_estate:'#ec4899', auto_repair:'#f43f5e', landscaping:'#22c55e', cleaning:'#14b8a6', general:'#8b5cf6' };

function Mini({ icon, value, label }: { icon: React.ReactNode; value: string|number; label: string }) {
  const isZero = value === 0 || value === '-';
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: isZero ? '#f0f2f5' : 'var(--accent-soft)', color: isZero ? 'var(--text-dark-secondary)' : 'var(--accent)' }}>{icon}</div>
      <div>
        <div className="text-[13px] md:text-[14px] font-bold tabular-nums" style={{ color: isZero ? 'var(--text-dark-secondary)' : 'var(--text-dark)', fontFamily:'Satoshi' }}>{value}</div>
        <div className="text-[10px] md:text-[11px]" style={{ color:'var(--text-dark-secondary)' }}>{label}</div>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [modal, setModal] = useState<'create' | 'configure' | null>(null);
  const [configureAgentId, setConfigureAgentId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Create form state
  const [createName, setCreateName] = useState('');
  const [createVertical, setCreateVertical] = useState('general');
  const [createDesc, setCreateDesc] = useState('');
  const [createSms, setCreateSms] = useState(true);
  const [createEmail, setCreateEmail] = useState(true);
  const [createStatus, setCreateStatus] = useState<AgentStatus>('draft');
  const [createGreeting, setCreateGreeting] = useState('');

  // Configure form state
  const [configName, setConfigName] = useState('');
  const [configVertical, setConfigVertical] = useState('');
  const [configDesc, setConfigDesc] = useState('');
  const [configSms, setConfigSms] = useState(false);
  const [configEmail, setConfigEmail] = useState(false);
  const [configDelay, setConfigDelay] = useState(5);
  const [configMaxFollowups, setConfigMaxFollowups] = useState(3);

  function resetCreateForm() {
    setCreateName('');
    setCreateVertical('general');
    setCreateDesc('');
    setCreateSms(true);
    setCreateEmail(true);
    setCreateStatus('draft');
    setCreateGreeting('');
  }

  function handleCreateSubmit() {
    const newAgent: Agent = {
      id: String(Date.now()),
      name: createName || 'Untitled Agent',
      desc: createDesc || 'No description provided.',
      vertical: createVertical,
      status: createStatus,
      sms: createSms,
      email: createEmail,
      kb: 0,
      convos: 0,
      booked: 0,
      converted: 0,
      time: '-',
      rate: 0,
      last: 'Never',
    };
    setAgents(prev => [...prev, newAgent]);
    setModal(null);
    resetCreateForm();
    showToast(`Agent "${newAgent.name}" created successfully`);
  }

  function openConfigure(agent: Agent) {
    setConfigureAgentId(agent.id);
    setConfigName(agent.name);
    setConfigVertical(agent.vertical);
    setConfigDesc(agent.desc);
    setConfigSms(agent.sms);
    setConfigEmail(agent.email);
    setConfigDelay(5);
    setConfigMaxFollowups(3);
    setModal('configure');
  }

  function handleConfigureSubmit() {
    if (!configureAgentId) return;
    setAgents(prev => prev.map(a =>
      a.id === configureAgentId
        ? { ...a, name: configName, vertical: configVertical, desc: configDesc, sms: configSms, email: configEmail }
        : a
    ));
    setModal(null);
    setConfigureAgentId(null);
    showToast('Agent configuration saved');
  }

  function toggleAgentStatus(agentId: string) {
    setAgents(prev => prev.map(a => {
      if (a.id !== agentId) return a;
      const newStatus: AgentStatus = a.status === 'active' ? 'paused' : 'active';
      return { ...a, status: newStatus };
    }));
  }

  function showToast(message: string) {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 2500);
  }

  const activeCount = agents.filter(a => a.status === 'active').length;

  return (
    <>
      <TopBar title="Agents" subtitle={`${agents.length} agents · ${activeCount} active`} />
      <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-4 md:space-y-5">
        <div className="flex items-center justify-end">
          <Button variant="primary" size="md" onClick={() => { resetCreateForm(); setModal('create'); }}><Plus size={15}/> New Agent</Button>
        </div>
        {agents.map(a => {
          const vc = VC[a.vertical]||'#8b5cf6';
          return (
            <Card key={a.id} padding={false} className="group animate-fade-in overflow-hidden">
              <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${vc}, ${vc}88)` }}/>
              <div className="p-4 md:p-5 pb-3 md:pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background:`${vc}14`, color:vc }}><Bot size={20}/></div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[15px] md:text-[16px] font-bold" style={{ color:'var(--text-dark)', fontFamily:'Satoshi' }}>{a.name}</h3>
                        <Badge variant={AGENT_STATUS_VARIANT[a.status]} dot>{a.status}</Badge>
                        {a.status === 'active' && <LiveIndicator />}
                      </div>
                      <p className="text-[12px] md:text-[12.5px] mt-1 line-clamp-2" style={{ color:'var(--text-dark-secondary)' }}>{a.desc}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {a.status==='active'
                      ? <Button variant="ghost" size="sm" onClick={() => toggleAgentStatus(a.id)}><Pause size={13}/> Pause</Button>
                      : (a.status==='draft' || a.status==='paused')
                      ? <Button variant="primary" size="sm" onClick={() => toggleAgentStatus(a.id)}><Play size={13}/> Activate</Button>
                      : null}
                    <Button variant="ghost" size="sm" onClick={() => openConfigure(a)}><Settings size={14}/></Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-3">
                  {a.sms&&<span className="flex items-center gap-1 text-[10px] md:text-[11px] font-medium px-1.5 md:px-2 py-0.5 rounded-md badge-inline" style={{ background:'#f0f2f5', color:'var(--text-dark-secondary)' }}><Phone size={9}/> SMS</span>}
                  {a.email&&<span className="flex items-center gap-1 text-[10px] md:text-[11px] font-medium px-1.5 md:px-2 py-0.5 rounded-md badge-inline" style={{ background:'#f0f2f5', color:'var(--text-dark-secondary)' }}><Mail size={9}/> Email</span>}
                  <span className="flex items-center gap-1 text-[10px] md:text-[11px] font-medium px-1.5 md:px-2 py-0.5 rounded-md badge-inline" style={{ background:'#f0f2f5', color:'var(--text-dark-secondary)' }}><BookOpen size={9}/> {a.kb} KB</span>
                  <span className="text-[10px] md:text-[11px] ml-auto hidden sm:block" style={{ color:'var(--text-dark-secondary)' }}>Active {a.last}</span>
                </div>
              </div>
              <div className="px-4 md:px-5 py-3 md:py-4 grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4" style={{ borderTop:'1px solid #f0f2f5' }}>
                <Mini icon={<MessageSquare size={13}/>} value={a.convos} label="Convos"/>
                <Mini icon={<Calendar size={13}/>} value={a.booked} label="Booked"/>
                <Mini icon={<TrendingUp size={13}/>} value={a.converted} label="Converted"/>
                <Mini icon={<Clock size={13}/>} value={a.time} label="Avg Resp."/>
                <Mini icon={<Zap size={13}/>} value={`${a.rate}%`} label="Conv Rate"/>
              </div>
              {/* Mobile action row */}
              <div className="md:hidden px-4 py-3 flex gap-2" style={{ borderTop:'1px solid #f0f2f5' }}>
                {a.status==='active'
                  ? <Button variant="ghost" size="sm" className="flex-1" onClick={() => toggleAgentStatus(a.id)}><Pause size={13}/> Pause</Button>
                  : (a.status==='draft' || a.status==='paused')
                  ? <Button variant="primary" size="sm" className="flex-1" onClick={() => toggleAgentStatus(a.id)}><Play size={13}/> Activate</Button>
                  : null}
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => openConfigure(a)}><Settings size={13}/> Configure</Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Agent Modal */}
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Create New Agent" size="lg">
        <div className="space-y-4">
          <FormField label="Agent Name" required>
            <FormInput placeholder="e.g. HVAC Sales Pro" value={createName} onChange={e => setCreateName(e.target.value)} />
          </FormField>
          <FormField label="Industry / Vertical" required>
            <FormSelect value={createVertical} onChange={e => setCreateVertical(e.target.value)}>
              {VERTICALS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="Description">
            <FormTextarea rows={2} placeholder="What does this agent do?" value={createDesc} onChange={e => setCreateDesc(e.target.value)} />
          </FormField>
          <FormField label="Channels">
            <div className="flex items-center gap-6 pt-1">
              <FormToggle checked={createSms} onChange={setCreateSms} label="SMS" />
              <FormToggle checked={createEmail} onChange={setCreateEmail} label="Email" />
            </div>
          </FormField>
          <FormField label="Status">
            <FormSelect value={createStatus} onChange={e => setCreateStatus(e.target.value as AgentStatus)}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </FormSelect>
          </FormField>
          <FormField label="Greeting Message">
            <FormTextarea rows={3} placeholder="Hi! Thanks for reaching out. How can I help you today?" value={createGreeting} onChange={e => setCreateGreeting(e.target.value)} />
          </FormField>
          <div className="flex items-center gap-3 pt-2">
            <Button variant="primary" size="md" className="flex-1" onClick={handleCreateSubmit}>Create Agent</Button>
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Configure Agent Modal */}
      <Modal open={modal === 'configure'} onClose={() => { setModal(null); setConfigureAgentId(null); }} title="Agent Configuration" size="lg">
        <div className="space-y-4">
          <FormField label="Agent Name" required>
            <FormInput value={configName} onChange={e => setConfigName(e.target.value)} />
          </FormField>
          <FormField label="Industry / Vertical" required>
            <FormSelect value={configVertical} onChange={e => setConfigVertical(e.target.value)}>
              {VERTICALS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="Description">
            <FormTextarea rows={2} value={configDesc} onChange={e => setConfigDesc(e.target.value)} />
          </FormField>
          <FormField label="Channels">
            <div className="flex items-center gap-6 pt-1">
              <FormToggle checked={configSms} onChange={setConfigSms} label="SMS" />
              <FormToggle checked={configEmail} onChange={setConfigEmail} label="Email" />
            </div>
          </FormField>
          <FormField label="Response Delay" hint={`Agent will wait ${configDelay} second${configDelay !== 1 ? 's' : ''} before responding`}>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={30}
                value={configDelay}
                onChange={e => setConfigDelay(Number(e.target.value))}
                className="flex-1 accent-[var(--accent)]"
              />
              <span className="text-[13px] font-bold tabular-nums w-12 text-right" style={{ color: 'var(--text-dark)' }}>{configDelay}s</span>
            </div>
          </FormField>
          <FormField label="Max Follow-ups" hint="Maximum number of follow-up messages before stopping">
            <FormInput type="number" min={0} max={20} value={configMaxFollowups} onChange={e => setConfigMaxFollowups(Number(e.target.value))} />
          </FormField>
          <div className="flex items-center gap-3 pt-2">
            <Button variant="primary" size="md" className="flex-1" onClick={handleConfigureSubmit}>Save Changes</Button>
            <Button variant="secondary" size="md" className="flex-1" onClick={() => { setModal(null); setConfigureAgentId(null); }}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Success Toast */}
      {successToast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-semibold animate-fade-in"
          style={{ background: '#0b0e14', color: '#fff', boxShadow: '0 10px 40px -8px rgba(0,0,0,0.3)' }}
        >
          <CheckCircle size={16} style={{ color: 'var(--accent)' }} />
          {successToast}
        </div>
      )}
    </>
  );
}
