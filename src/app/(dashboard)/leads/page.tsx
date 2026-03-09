'use client';

import { useState, useEffect } from 'react';
import { TopBar } from '@/components/dashboard/sidebar';
import { Badge, Button, Card, LEAD_STATUS_VARIANT, Avatar, Modal, FormField, FormInput, FormSelect, FormTextarea, DropdownMenu } from '@/components/ui/primitives';
import { Search, Download, Plus, ChevronLeft, ChevronRight, MoreHorizontal, Mail, Bot, Eye, Pencil, MessageSquare, ArrowRightCircle, Trash2, Users, CheckCircle } from 'lucide-react';

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  score: number;
  agent: string;
  agent_id?: string;
  source?: string;
  notes?: string;
  lastContact: string;
};

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'nurturing', 'converted', 'lost', 'unresponsive'];
const SOURCE_OPTIONS = [
  { value: 'web_form', label: 'Web Form' },
  { value: 'phone_inbound', label: 'Phone Call' },
  { value: 'referral', label: 'Referral' },
  { value: 'manual', label: 'Manual' },
  { value: 'api', label: 'API' },
];

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--accent)' : score >= 25 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-14 md:w-16 h-2 rounded-full overflow-hidden" style={{ background: '#e8eaef' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
      </div>
      <span className="text-[12px] font-bold tabular-nums min-w-[24px]" style={{ color }}>{score}</span>
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentOptions, setAgentOptions] = useState<{id: string; name: string}[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [dropdownLeadId, setDropdownLeadId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // Add lead form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState('new');
  const [formSource, setFormSource] = useState('web_form');
  const [formAgent, setFormAgent] = useState('');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/leads').then(r => r.json()),
      fetch('/api/agents').then(r => r.json()),
    ]).then(([leadsData, agentsData]) => {
      const agentMap = new Map<string, string>();
      const opts: {id: string; name: string}[] = [];
      (agentsData.agents || []).forEach((a: Record<string, unknown>) => {
        agentMap.set(a.id as string, a.name as string);
        opts.push({ id: a.id as string, name: a.name as string });
      });
      setAgentOptions(opts);

      if (leadsData.leads) {
        setLeads(leadsData.leads.map((l: Record<string, unknown>) => ({
          id: l.id as string,
          name: [l.first_name, l.last_name].filter(Boolean).join(' ') || 'Unknown',
          email: (l.email as string) || '',
          phone: (l.phone as string) || undefined,
          status: (l.status as string) || 'new',
          score: Number(l.score) || 0,
          agent: l.agent_id ? (agentMap.get(l.agent_id as string) || 'Unassigned') : 'Unassigned',
          agent_id: (l.agent_id as string) || undefined,
          source: (l.source as string) || undefined,
          lastContact: l.updated_at ? timeAgo(new Date(l.updated_at as string)) : 'Never',
        })));
      }
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = leads.filter((l) => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (search) return l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  function resetForm() {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormStatus('new');
    setFormSource('web_form');
    setFormAgent('');
    setFormNotes('');
  }

  async function handleAddLead(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    const nameParts = formName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName || null,
        email: formEmail.trim(),
        phone: formPhone.trim() || null,
        source: formSource,
        status: formStatus,
        agent_id: formAgent || null,
        notes: formNotes.trim() || null,
      }),
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json();
      if (data.lead) {
        const l = data.lead;
        const agentName = agentOptions.find(a => a.id === l.agent_id)?.name || 'Unassigned';
        setLeads(prev => [{
          id: l.id,
          name: [l.first_name, l.last_name].filter(Boolean).join(' ') || formName.trim(),
          email: l.email || formEmail.trim(),
          phone: l.phone || formPhone.trim() || undefined,
          status: l.status || 'new',
          score: l.score || 0,
          agent: agentName,
          agent_id: l.agent_id,
          source: SOURCE_OPTIONS.find(s => s.value === formSource)?.label || formSource,
          notes: formNotes || undefined,
          lastContact: 'Just now',
        }, ...prev]);
        showToast('Lead added successfully');
      }
      resetForm();
      setAddModalOpen(false);
    } else {
      showToast('Failed to add lead. Please try again.');
    }
  }

  function handleExport() {
    const headers = ['Name', 'Email', 'Status', 'Score', 'Agent', 'Last Contact'];
    const rows = filtered.map((l) => [
      `"${l.name}"`,
      `"${l.email}"`,
      `"${l.status}"`,
      String(l.score),
      `"${l.agent}"`,
      `"${l.lastContact}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDeleteLead(id: string) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setDropdownLeadId(null);
    fetch(`/api/leads/${id}`, { method: 'DELETE' }).catch(() => {});
  }

  function getDropdownItems(lead: Lead) {
    return [
      { label: 'View details', icon: <Eye size={14} />, onClick: () => { setDetailLead(lead); setDropdownLeadId(null); } },
      { label: 'Edit lead', icon: <Pencil size={14} />, onClick: () => {} },
      { label: 'Send message', icon: <MessageSquare size={14} />, onClick: () => {} },
      { label: 'Move to pipeline', icon: <ArrowRightCircle size={14} />, onClick: () => {} },
      { label: 'Delete lead', icon: <Trash2 size={14} />, onClick: () => handleDeleteLead(lead.id), danger: true },
    ];
  }

  return (
    <>
      <TopBar title="Leads" subtitle={`${leads.length} total leads`} />
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative flex-1 sm:flex-none">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dark-secondary)' }} />
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-[220px] md:w-[260px] pl-9 pr-4 py-2.5 rounded-lg text-[13px]" style={{ background: '#f0f2f5', border: 'none', outline: 'none' }} />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg text-[13px] font-medium shrink-0" style={{ background: '#f0f2f5', border: '1px solid #e5e7eb', outline: 'none' }}>
              <option value="all">All</option><option value="new">New</option><option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option><option value="converted">Converted</option><option value="lost">Lost</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="flex-1 sm:flex-none" onClick={handleExport}><Download size={14} /> Export</Button>
            <Button variant="primary" size="sm" className="flex-1 sm:flex-none" onClick={() => { resetForm(); setAddModalOpen(true); }}><Plus size={14} /> Add Lead</Button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <Card className="animate-pulse">
            <div className="h-64 rounded" style={{ background: '#f0f2f5' }} />
          </Card>
        )}

        {/* Empty state */}
        {!loading && leads.length === 0 && (
          <Card className="animate-fade-in">
            <div className="text-center py-12">
              <Users size={40} style={{ color: '#e2e5eb' }} className="mx-auto mb-3" />
              <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-dark)' }}>No leads yet</p>
              <p className="text-[13px] mb-4" style={{ color: 'var(--text-dark-secondary)' }}>Capture your first lead or add one manually.</p>
              <Button variant="primary" size="md" onClick={() => { resetForm(); setAddModalOpen(true); }}><Plus size={14} /> Add Lead</Button>
            </div>
          </Card>
        )}

        {/* Table */}
        {!loading && leads.length > 0 && (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid #e8eaef' }}>
                    {['Lead', 'Status', 'Score', 'Agent', 'Last Contact', ''].map((h) => (
                      <th key={h} className={`text-left py-3 px-3 md:px-4 text-[11px] md:text-[11.5px] font-bold uppercase tracking-wider ${h === '' ? 'w-10' : ''}`}
                        style={{ color: 'var(--text-dark-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50/80 cursor-pointer transition-colors row-hover-accent" style={{ borderBottom: '1px solid #f0f2f5' }}>
                      <td className="py-3 px-3 md:px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={l.name} size="sm" />
                          <div>
                            <div className="text-[13px] md:text-[13.5px] font-semibold" style={{ color: 'var(--text-dark)' }}>{l.name}</div>
                            <div className="text-[11px] md:text-[12px] flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-dark-secondary)' }}><Mail size={10} />{l.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 md:px-4"><Badge variant={LEAD_STATUS_VARIANT[l.status] || 'muted'} dot>{l.status}</Badge></td>
                      <td className="py-3 px-3 md:px-4"><ScoreBar score={l.score} /></td>
                      <td className="py-3 px-3 md:px-4">
                        <div className="flex items-center gap-1.5"><Bot size={12} style={{ color: 'var(--accent)' }} /><span className="text-[12px] md:text-[12.5px] font-medium truncate" style={{ color: 'var(--text-dark)' }}>{l.agent}</span></div>
                      </td>
                      <td className="py-3 px-3 md:px-4"><span className="text-[12px] md:text-[12.5px] whitespace-nowrap" style={{ color: 'var(--text-dark-secondary)' }}>{l.lastContact}</span></td>
                      <td className="py-3 px-3 md:px-4 relative">
                        <button
                          className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-100 btn-icon-sm"
                          onClick={(e) => { e.stopPropagation(); setDropdownLeadId(dropdownLeadId === l.id ? null : l.id); }}
                        >
                          <MoreHorizontal size={15} style={{ color: 'var(--text-dark-secondary)' }} />
                        </button>
                        <DropdownMenu
                          open={dropdownLeadId === l.id}
                          onClose={() => setDropdownLeadId(null)}
                          items={getDropdownItems(l)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-3 md:px-5 py-3 md:py-4" style={{ borderTop: '1px solid #e8eaef' }}>
              <span className="text-[11px] md:text-[12.5px]" style={{ color: 'var(--text-dark-secondary)' }}>
                {filtered.length} of {leads.length}
              </span>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100"><ChevronLeft size={16} style={{ color: 'var(--text-dark-secondary)' }} /></button>
                <button className="w-8 h-8 rounded-md flex items-center justify-center text-[12px] font-semibold"
                  style={{ background: 'var(--text-dark)', color: '#fff' }}>1</button>
                <button className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100"><ChevronRight size={16} style={{ color: 'var(--text-dark-secondary)' }} /></button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Add Lead Modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Lead">
        <form onSubmit={handleAddLead} className="space-y-4">
          <FormField label="Full Name" required>
            <FormInput placeholder="e.g. Jane Smith" value={formName} onChange={(e) => setFormName(e.target.value)} required />
          </FormField>
          <FormField label="Email" required>
            <FormInput type="email" placeholder="e.g. jane@company.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
          </FormField>
          <FormField label="Phone">
            <FormInput type="tel" placeholder="e.g. (555) 123-4567" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Status">
              <FormSelect value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </FormSelect>
            </FormField>
            <FormField label="Source">
              <FormSelect value={formSource} onChange={(e) => setFormSource(e.target.value)}>
                {SOURCE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </FormSelect>
            </FormField>
          </div>
          <FormField label="Assign Agent">
            <FormSelect value={formAgent} onChange={(e) => setFormAgent(e.target.value)}>
              <option value="">Unassigned</option>
              {agentOptions.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="Notes">
            <FormTextarea placeholder="Any additional notes..." rows={3} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
          </FormField>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="secondary" size="md" className="flex-1" type="button" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="md" className="flex-1" type="submit">Add Lead</Button>
          </div>
        </form>
      </Modal>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-semibold animate-fade-in"
          style={{ background: '#0b0e14', color: '#fff', boxShadow: '0 10px 40px -8px rgba(0,0,0,0.3)' }}
        >
          <CheckCircle size={16} style={{ color: 'var(--accent)' }} />
          {toast}
        </div>
      )}

      {/* View Details Modal */}
      <Modal open={!!detailLead} onClose={() => setDetailLead(null)} title={detailLead ? detailLead.name : 'Lead Details'}>
        {detailLead && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid #f0f2f5' }}>
              <Avatar name={detailLead.name} size="md" />
              <div>
                <div className="text-[14px] font-semibold" style={{ color: 'var(--text-dark)' }}>{detailLead.name}</div>
                <div className="text-[12px] flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-dark-secondary)' }}><Mail size={11} />{detailLead.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dark-secondary)' }}>Status</div>
                <Badge variant={LEAD_STATUS_VARIANT[detailLead.status] || 'muted'} dot>{detailLead.status}</Badge>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dark-secondary)' }}>Score</div>
                <ScoreBar score={detailLead.score} />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dark-secondary)' }}>Agent</div>
                <div className="flex items-center gap-1.5">
                  <Bot size={12} style={{ color: 'var(--accent)' }} />
                  <span className="text-[12.5px] font-medium" style={{ color: 'var(--text-dark)' }}>{detailLead.agent}</span>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dark-secondary)' }}>Last Contact</div>
                <span className="text-[12.5px]" style={{ color: 'var(--text-dark)' }}>{detailLead.lastContact}</span>
              </div>
              {detailLead.phone && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dark-secondary)' }}>Phone</div>
                  <span className="text-[12.5px]" style={{ color: 'var(--text-dark)' }}>{detailLead.phone}</span>
                </div>
              )}
              {detailLead.source && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dark-secondary)' }}>Source</div>
                  <span className="text-[12.5px]" style={{ color: 'var(--text-dark)' }}>{detailLead.source}</span>
                </div>
              )}
            </div>
            {detailLead.notes && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dark-secondary)' }}>Notes</div>
                <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--text-dark)' }}>{detailLead.notes}</p>
              </div>
            )}
            <Button variant="secondary" size="md" className="w-full mt-2" onClick={() => setDetailLead(null)}>Close</Button>
          </div>
        )}
      </Modal>
    </>
  );
}
