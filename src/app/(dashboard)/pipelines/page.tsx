'use client';
import { useState, useEffect } from 'react';
import { TopBar } from '@/components/dashboard/sidebar';
import { Button, Card, Modal, FormField, FormInput, FormSelect, FormTextarea } from '@/components/ui/primitives';
import { Plus, MoreHorizontal, Phone, Mail, Bot, ArrowRight, TrendingUp, CheckCircle, ChevronRight, DollarSign, Clock, Users, ChevronLeft } from 'lucide-react';

type PipelineLead = {
  id: string;
  name: string;
  val: number;
  svc: string;
  days: number;
  ch: 'sms' | 'email';
  agent: string;
  nextAction: string;
  score: number;
  entry_id?: string;
};

type Stage = {
  id: string;
  name: string;
  color: string;
  leads: PipelineLead[];
};

export default function PipelinePage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentOptions, setAgentOptions] = useState<{id: string; name: string}[]>([]);
  const [modal, setModal] = useState<'add' | 'card' | null>(null);
  const [selectedLead, setSelectedLead] = useState<PipelineLead | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Edit form state
  const [editStage, setEditStage] = useState('');
  const [editVal, setEditVal] = useState('');
  const [editAgent, setEditAgent] = useState('');
  const [editNextAction, setEditNextAction] = useState('');

  // Add form state
  const [addName, setAddName] = useState('');
  const [addSvc, setAddSvc] = useState('');
  const [addVal, setAddVal] = useState('');
  const [addCh, setAddCh] = useState<'sms' | 'email'>('sms');
  const [addAgent, setAddAgent] = useState('');
  const [addStage, setAddStage] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/pipeline/stages').then(r => r.json()),
      fetch('/api/agents').then(r => r.json()),
    ]).then(([pipelineData, agentsData]) => {
      const agentMap = new Map<string, string>();
      const opts: {id: string; name: string}[] = [];
      (agentsData.agents || []).forEach((a: Record<string, unknown>) => {
        agentMap.set(a.id as string, a.name as string);
        opts.push({ id: a.id as string, name: a.name as string });
      });
      setAgentOptions(opts);

      if (pipelineData.stages && pipelineData.stages.length > 0) {
        const mapped = pipelineData.stages.map((s: Record<string, unknown>) => ({
          id: s.id as string,
          name: (s.name as string) || 'Stage',
          color: (s.color as string) || '#6366f1',
          leads: ((s.entries as Record<string, unknown>[]) || []).map((e: Record<string, unknown>) => ({
            id: (e.lead_id as string) || (e.id as string),
            name: (e.lead_name as string) || 'Unknown',
            val: Number(e.estimated_value) || 0,
            svc: (e.lead_service as string) || '',
            days: e.entered_at ? Math.floor((Date.now() - new Date(e.entered_at as string).getTime()) / 86400000) : 0,
            ch: ((e.lead_source as string) || '').includes('sms') ? 'sms' as const : 'email' as const,
            agent: e.lead_agent_id ? (agentMap.get(e.lead_agent_id as string) || 'Unassigned') : 'Unassigned',
            nextAction: (e.notes as string) || 'Follow up',
            score: Number(e.lead_score) || 0,
            entry_id: e.id as string,
          })),
        }));
        setStages(mapped);
        setAddStage(mapped[0]?.id || '');
      }
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = stages.reduce((s,st)=>s+st.leads.reduce((a,l)=>a+l.val,0),0);
  const count = stages.reduce((s,st)=>s+st.leads.length,0);

  function showToast(message: string) {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 2500);
  }

  function openEditModal(lead: PipelineLead, stageId: string) {
    setSelectedLead(lead);
    setSelectedStageId(stageId);
    setEditStage(stageId);
    setEditVal(String(lead.val));
    setEditAgent(lead.agent);
    setEditNextAction(lead.nextAction);
    setModal('card');
  }

  function openAddModal(stageId?: string) {
    setAddName('');
    setAddSvc('');
    setAddVal('');
    setAddCh('sms');
    setAddAgent(agentOptions[0]?.id || '');
    setAddStage(stageId || stages[0]?.id || '');
    setModal('add');
  }

  /** Quick-move: move selected lead to a specific stage via both local state and API */
  function quickMoveToStage(targetStageId: string) {
    if (!selectedLead || !selectedStageId || targetStageId === selectedStageId) return;

    const updatedLead = { ...selectedLead };
    setStages(prev => {
      const next = prev.map(st => ({
        ...st,
        leads: st.id === selectedStageId ? st.leads.filter(l => l.id !== selectedLead.id) : st.leads,
      }));
      return next.map(st => st.id === targetStageId ? { ...st, leads: [...st.leads, updatedLead] } : st);
    });

    const targetStageName = stages.find(s => s.id === targetStageId)?.name || '';
    showToast(`Moved ${selectedLead.name} to ${targetStageName}`);

    fetch('/api/pipeline/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: selectedLead.id, entry_id: selectedLead.entry_id, stage_id: targetStageId, estimated_value: selectedLead.val, notes: selectedLead.nextAction }),
    }).catch(() => {});

    setSelectedStageId(targetStageId);
    setEditStage(targetStageId);
  }

  function handleSaveEdit() {
    if (!selectedLead || !selectedStageId) return;
    const newVal = parseInt(editVal, 10) || selectedLead.val;
    const updatedLead: PipelineLead = {
      ...selectedLead,
      val: newVal,
      agent: editAgent,
      nextAction: editNextAction,
    };

    setStages(prev => {
      const next = prev.map(st => ({
        ...st,
        leads: st.id === selectedStageId
          ? st.leads.filter(l => l.id !== selectedLead.id)
          : st.leads,
      }));
      return next.map(st =>
        st.id === editStage
          ? { ...st, leads: [...st.leads, updatedLead] }
          : st
      );
    });

    const targetStageName = stages.find(s => s.id === editStage)?.name || editStage;
    if (editStage !== selectedStageId) {
      showToast(`Moved ${selectedLead.name} to ${targetStageName}`);
    } else {
      showToast(`Updated ${selectedLead.name}`);
    }

    fetch('/api/pipeline/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: selectedLead.id, entry_id: selectedLead.entry_id, stage_id: editStage, estimated_value: newVal, notes: editNextAction }),
    }).catch(() => {});

    setModal(null);
    setSelectedLead(null);
    setSelectedStageId(null);
  }

  async function handleAddDeal() {
    if (!addName.trim()) return;
    const tempId = `temp_${Date.now()}`;
    const agentName = agentOptions.find(a => a.id === addAgent)?.name || 'Unassigned';
    const newLead: PipelineLead = {
      id: tempId,
      name: addName.trim(),
      svc: addSvc.trim(),
      val: parseInt(addVal, 10) || 0,
      days: 0,
      ch: addCh,
      agent: agentName,
      nextAction: 'Initial outreach',
      score: 20,
    };

    setStages(prev => prev.map(st =>
      st.id === addStage ? { ...st, leads: [...st.leads, newLead] } : st
    ));

    const targetStageName = stages.find(s => s.id === addStage)?.name || addStage;
    showToast(`Added ${newLead.name} to ${targetStageName}`);
    setModal(null);

    const nameParts = addName.trim().split(' ');
    const leadRes = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(' ') || null,
        source: 'manual',
        status: 'new',
        agent_id: addAgent || null,
      }),
    }).catch(() => null);

    if (leadRes) {
      const leadData = await leadRes.json();
      if (leadData.lead) {
        const realLeadId = leadData.lead.id as string;
        setStages(prev => prev.map(st => ({
          ...st,
          leads: st.leads.map(l => l.id === tempId ? { ...l, id: realLeadId } : l),
        })));

        if (addStage !== stages[0]?.id) {
          fetch('/api/pipeline/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lead_id: realLeadId,
              stage_id: addStage,
              estimated_value: parseInt(addVal, 10) || 0,
              notes: 'Initial outreach',
            }),
          }).catch(() => {});
        }
      }
    }
  }

  // Get next/prev stage for quick-move buttons
  const currentStageIdx = selectedStageId ? stages.findIndex(s => s.id === selectedStageId) : -1;
  const prevStage = currentStageIdx > 0 ? stages[currentStageIdx - 1] : null;
  const nextStage = currentStageIdx >= 0 && currentStageIdx < stages.length - 1 ? stages[currentStageIdx + 1] : null;

  return (
    <>
      <TopBar title="Pipeline" subtitle={`${count} deals · $${total.toLocaleString()} total value`} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header bar with stats + add button */}
        {!loading && stages.length > 0 && (
          <div className="shrink-0 px-3 md:px-6 pt-3 md:pt-5 pb-2 md:pb-3">
            <div className="flex items-center justify-between mb-3">
              {/* Summary stats */}
              <div className="flex items-center gap-3 md:gap-5">
                <div className="flex items-center gap-1.5">
                  <DollarSign size={14} style={{ color: 'var(--accent)' }} />
                  <span className="text-[13px] md:text-[15px] font-bold tabular-nums" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>${total.toLocaleString()}</span>
                  <span className="text-[10px] md:text-[11px] hidden sm:inline" style={{ color: 'var(--text-dark-secondary)' }}>pipeline</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={13} style={{ color: 'var(--text-dark-secondary)' }} />
                  <span className="text-[12px] md:text-[13px] font-semibold" style={{ color: 'var(--text-dark)' }}>{count}</span>
                  <span className="text-[10px] md:text-[11px] hidden sm:inline" style={{ color: 'var(--text-dark-secondary)' }}>deals</span>
                </div>
              </div>
              <Button variant="primary" size="md" onClick={() => openAddModal()}>
                <Plus size={14} /> Add Deal
              </Button>
            </div>

            {/* Funnel summary — horizontal with conversion arrows */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
              {stages.map((st, i) => {
                const sv = st.leads.reduce((a,l)=>a+l.val,0);
                return (
                  <div key={st.id} className="flex items-center shrink-0">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: `${st.color}10` }}>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: st.color }} />
                      <span className="text-[10px] md:text-[11px] font-bold whitespace-nowrap" style={{ color: st.color }}>{st.name}</span>
                      <span className="text-[10px] md:text-[11px] font-semibold tabular-nums" style={{ color: 'var(--text-dark-secondary)' }}>
                        {st.leads.length}
                      </span>
                      <span className="text-[9px] md:text-[10px] tabular-nums hidden sm:inline" style={{ color: 'var(--text-dark-secondary)' }}>
                        ${sv.toLocaleString()}
                      </span>
                    </div>
                    {i < stages.length - 1 && (
                      <ChevronRight size={12} className="shrink-0 mx-0.5" style={{ color: '#d1d5db' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex-1 p-3 md:p-6 overflow-x-auto">
            <div className="flex gap-4 min-w-max">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-[280px] shrink-0 rounded-xl animate-pulse" style={{ background: '#f8f9fb', border: '1px solid #e8eaef' }}>
                  <div className="h-1.5 rounded-t-xl" style={{ background: '#e2e5eb' }} />
                  <div className="p-4 space-y-3">
                    <div className="h-4 rounded" style={{ background: '#e8eaef' }} />
                    <div className="h-20 rounded" style={{ background: '#f0f2f5' }} />
                    <div className="h-20 rounded" style={{ background: '#f0f2f5' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && stages.length === 0 && (
          <div className="flex-1 p-3 md:p-6">
            <Card className="animate-fade-in">
              <div className="text-center py-12">
                <TrendingUp size={40} style={{ color: '#e2e5eb' }} className="mx-auto mb-3" />
                <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-dark)' }}>No pipeline stages</p>
                <p className="text-[13px] mb-4" style={{ color: 'var(--text-dark-secondary)' }}>Pipeline stages will be created automatically. Try refreshing the page.</p>
                <Button variant="primary" size="md" onClick={() => window.location.reload()}>Refresh</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Kanban board */}
        {!loading && stages.length > 0 && (
          <div className="flex-1 overflow-x-auto px-3 md:px-6 pb-4">
            <div className="flex gap-3 md:gap-4 h-full" style={{ minWidth: `${stages.length * 276}px` }}>
              {stages.map(st => {
                const sv = st.leads.reduce((a,l)=>a+l.val,0);
                return (
                  <div key={st.id} className="w-[260px] md:w-[280px] shrink-0 flex flex-col rounded-xl overflow-hidden" style={{ background:'#f8f9fb', border:'1px solid #e8eaef', maxHeight:'calc(100vh - 240px)' }}>
                    <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${st.color}, ${st.color}66)` }} />
                    <div className="p-3 md:p-3.5 shrink-0" style={{ borderBottom: '1px solid #e8eaef' }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background:st.color }}/>
                          <span className="text-[12px] md:text-[13px] font-bold" style={{ color:'var(--text-dark)', fontFamily:'Satoshi' }}>{st.name}</span>
                          <span className="text-[10px] md:text-[11px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background:'#e8eaef', color:'var(--text-dark-secondary)' }}>{st.leads.length}</span>
                        </div>
                        <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-200 transition-colors" onClick={() => openAddModal(st.id)} title="Add deal to this stage">
                          <Plus size={14} style={{ color:'var(--text-dark-secondary)' }}/>
                        </button>
                      </div>
                      <div className="text-[13px] md:text-[14px] font-bold tabular-nums" style={{ color: st.color }}>${sv.toLocaleString()}</div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-2 md:px-2.5 py-2 md:py-2.5">
                      {st.leads.length === 0 && (
                        <button
                          className="w-full text-center py-8 rounded-lg border-2 border-dashed transition-colors hover:border-gray-300 hover:bg-white/50"
                          style={{ borderColor: '#e2e5eb', color: 'var(--text-dark-secondary)' }}
                          onClick={() => openAddModal(st.id)}
                        >
                          <Plus size={18} className="mx-auto mb-1.5" style={{ color: '#c9cdd5' }} />
                          <p className="text-[11px] font-medium">Add a deal</p>
                        </button>
                      )}
                      {st.leads.map(l => {
                        const urgencyColor = l.days >= 5 ? 'var(--danger)' : l.days >= 3 ? 'var(--warning)' : 'var(--text-dark-secondary)';
                        const scoreColor = l.score >= 75 ? 'var(--success)' : l.score >= 50 ? 'var(--accent)' : 'var(--warning)';
                        return (
                        <div
                          key={l.id}
                          className="rounded-lg mb-2 md:mb-2.5 cursor-pointer active:scale-[0.98] transition-transform group overflow-hidden"
                          style={{ background:'#fff', border:'1px solid #e8eaef', boxShadow:'var(--shadow-sm)' }}
                          onClick={() => openEditModal(l, st.id)}
                        >
                          <div className="h-[2px]" style={{ background: st.color, opacity: Math.min(l.val / 15000, 1) * 0.6 + 0.4 }} />
                          <div className="p-3 md:p-3.5">
                            <div className="flex items-start justify-between mb-1.5">
                              <div className="min-w-0">
                                <span className="text-[12.5px] md:text-[13px] font-semibold block truncate" style={{ color:'var(--text-dark)' }}>{l.name}</span>
                                <span className="text-[10.5px] md:text-[11px] block truncate" style={{ color:'var(--text-dark-secondary)' }}>{l.svc || 'Service TBD'}</span>
                              </div>
                              <button className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2 w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); openEditModal(l, st.id); }}>
                                <MoreHorizontal size={14} style={{ color:'var(--text-dark-secondary)' }}/>
                              </button>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[15px] md:text-[16px] font-bold tabular-nums" style={{ color:'var(--text-dark)', fontFamily:'Satoshi' }}>${l.val.toLocaleString()}</span>
                              <span className="text-[10px] md:text-[11px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1" style={{ color: urgencyColor, background: l.days >= 3 ? `${urgencyColor}14` : '#f5f6f8' }}>
                                <Clock size={9} className="shrink-0" />{l.days}d
                              </span>
                            </div>
                            {/* Score bar */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#e8eaef' }}>
                                <div className="h-full rounded-full transition-all" style={{ width: `${l.score}%`, background: scoreColor }} />
                              </div>
                              <span className="text-[10px] font-bold tabular-nums" style={{ color: scoreColor }}>{l.score}</span>
                            </div>
                            {/* Next action */}
                            <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] px-2 py-1.5 rounded-md" style={{ background:'#f5f6f8', color:'var(--text-dark-secondary)' }}>
                              <ArrowRight size={9} className="shrink-0" />
                              <span className="truncate">{l.nextAction}</span>
                            </div>
                            {/* Agent + channel */}
                            <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #f0f2f5' }}>
                              <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-dark-secondary)' }}>
                                <Bot size={10} style={{ color: 'var(--accent)' }} />
                                <span className="truncate max-w-[100px]">{l.agent}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-dark-secondary)' }}>
                                {l.ch==='sms'?<Phone size={9}/>:<Mail size={9}/>}
                                <span className="uppercase">{l.ch}</span>
                              </div>
                            </div>
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
        )}
      </div>

      {/* Add to Pipeline modal */}
      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Add Deal to Pipeline">
        <div className="space-y-4">
          <FormField label="Lead Name" required>
            <FormInput placeholder="e.g. Sarah Mitchell" value={addName} onChange={e => setAddName(e.target.value)} autoFocus />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Service Type">
              <FormInput placeholder="e.g. AC Repair" value={addSvc} onChange={e => setAddSvc(e.target.value)} />
            </FormField>
            <FormField label="Deal Value">
              <FormInput type="number" placeholder="0" value={addVal} onChange={e => setAddVal(e.target.value)} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Channel">
              <FormSelect value={addCh} onChange={e => setAddCh(e.target.value as 'sms' | 'email')}>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </FormSelect>
            </FormField>
            <FormField label="Agent">
              <FormSelect value={addAgent} onChange={e => setAddAgent(e.target.value)}>
                <option value="">Unassigned</option>
                {agentOptions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </FormSelect>
            </FormField>
          </div>
          <FormField label="Stage">
            <FormSelect value={addStage} onChange={e => setAddStage(e.target.value)}>
              {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </FormSelect>
          </FormField>
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="primary" size="md" className="flex-1" onClick={handleAddDeal} disabled={!addName.trim()}>Add Deal</Button>
          </div>
        </div>
      </Modal>

      {/* Deal detail modal with quick-move buttons */}
      <Modal open={modal === 'card' && !!selectedLead} onClose={() => { setModal(null); setSelectedLead(null); setSelectedStageId(null); }} title={selectedLead?.name || 'Deal Details'}>
        {selectedLead && (
          <div className="space-y-4">
            {/* Quick-move stage buttons */}
            <div className="flex items-center gap-2">
              {prevStage && (
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] md:text-[12px] font-semibold transition-colors hover:opacity-80"
                  style={{ background: `${prevStage.color}14`, color: prevStage.color, border: `1px solid ${prevStage.color}30` }}
                  onClick={() => quickMoveToStage(prevStage.id)}
                >
                  <ChevronLeft size={12} /> {prevStage.name}
                </button>
              )}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] md:text-[12px] font-bold" style={{ background: stages[currentStageIdx]?.color ? `${stages[currentStageIdx].color}14` : '#f5f6f8', color: stages[currentStageIdx]?.color || 'var(--text-dark)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: stages[currentStageIdx]?.color }} />
                {stages[currentStageIdx]?.name || 'Unknown'}
              </div>
              {nextStage && (
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] md:text-[12px] font-semibold transition-colors hover:opacity-80"
                  style={{ background: `${nextStage.color}14`, color: nextStage.color, border: `1px solid ${nextStage.color}30` }}
                  onClick={() => quickMoveToStage(nextStage.id)}
                >
                  {nextStage.name} <ChevronRight size={12} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg p-2.5" style={{ background: '#f8f9fb' }}>
                <div className="text-[10px] mb-0.5" style={{ color: 'var(--text-dark-secondary)' }}>Value</div>
                <div className="text-[16px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>${selectedLead.val.toLocaleString()}</div>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: '#f8f9fb' }}>
                <div className="text-[10px] mb-0.5" style={{ color: 'var(--text-dark-secondary)' }}>Score</div>
                <div className="text-[16px] font-bold" style={{ color: selectedLead.score >= 75 ? 'var(--success)' : 'var(--accent)', fontFamily: 'Satoshi' }}>{selectedLead.score}</div>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: '#f8f9fb' }}>
                <div className="text-[10px] mb-0.5" style={{ color: 'var(--text-dark-secondary)' }}>In Stage</div>
                <div className="text-[16px] font-bold" style={{ color: selectedLead.days >= 5 ? 'var(--danger)' : 'var(--text-dark)', fontFamily: 'Satoshi' }}>{selectedLead.days}d</div>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { l: 'Service', v: selectedLead.svc || 'TBD' },
                { l: 'Channel', v: selectedLead.ch.toUpperCase() },
                { l: 'Agent', v: selectedLead.agent },
              ].map(({ l, v }) => (
                <div key={l} className="flex justify-between py-1.5" style={{ borderBottom: '1px solid #f0f2f5' }}>
                  <span className="text-[12px]" style={{ color: 'var(--text-dark-secondary)' }}>{l}</span>
                  <span className="text-[12px] font-medium" style={{ color: 'var(--text-dark)' }}>{v}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-1">
              <FormField label="Move to Stage">
                <FormSelect value={editStage} onChange={e => setEditStage(e.target.value)}>
                  {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </FormSelect>
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Deal Value">
                  <FormInput type="number" value={editVal} onChange={e => setEditVal(e.target.value)} />
                </FormField>
                <FormField label="Agent">
                  <FormSelect value={editAgent} onChange={e => setEditAgent(e.target.value)}>
                    <option value="">Unassigned</option>
                    {agentOptions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </FormSelect>
                </FormField>
              </div>
              <FormField label="Next Action">
                <FormInput value={editNextAction} onChange={e => setEditNextAction(e.target.value)} placeholder="e.g. Send proposal, Schedule call" />
              </FormField>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" size="md" className="flex-1" onClick={() => { setModal(null); setSelectedLead(null); setSelectedStageId(null); }}>Cancel</Button>
              <Button variant="primary" size="md" className="flex-1" onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        )}
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
