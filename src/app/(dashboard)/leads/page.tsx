'use client';

import { useState, useRef } from 'react';
import { TopBar } from '@/components/dashboard/sidebar';
import { Badge, Button, Card, LEAD_STATUS_VARIANT, Avatar, Modal, FormField, FormInput, FormSelect, FormTextarea, DropdownMenu } from '@/components/ui/primitives';
import { Search, Download, Plus, ChevronLeft, ChevronRight, MoreHorizontal, Mail, Bot, Eye, Pencil, MessageSquare, ArrowRightCircle, Trash2 } from 'lucide-react';

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  score: number;
  agent: string;
  source?: string;
  notes?: string;
  lastContact: string;
};

const INITIAL_LEADS: Lead[] = [
  { id: '1', name: 'Sarah Mitchell', email: 'sarah@email.com', status: 'contacted', score: 72, agent: 'HVAC Sales Pro', lastContact: '2m ago' },
  { id: '2', name: 'Marcus Johnson', email: 'marcus.j@gmail.com', status: 'qualified', score: 88, agent: 'Roofing Lead Closer', lastContact: '8m ago' },
  { id: '3', name: 'David Chen', email: 'dchen@outlook.com', status: 'new', score: 45, agent: 'Med Spa Concierge', lastContact: '15m ago' },
  { id: '4', name: 'Lisa Rodriguez', email: 'lisa.r@email.com', status: 'nurturing', score: 55, agent: 'HVAC Sales Pro', lastContact: '22m ago' },
  { id: '5', name: 'James Wilson', email: 'jwilson@email.com', status: 'contacted', score: 67, agent: 'Roofing Lead Closer', lastContact: '34m ago' },
  { id: '6', name: 'Robert Brown', email: 'rbrown@email.com', status: 'converted', score: 95, agent: 'HVAC Sales Pro', lastContact: '3h ago' },
  { id: '7', name: 'Jennifer Taylor', email: 'jtaylor@email.com', status: 'lost', score: 30, agent: 'Roofing Lead Closer', lastContact: '2d ago' },
  { id: '8', name: 'Amanda White', email: 'awhite@email.com', status: 'unresponsive', score: 20, agent: 'HVAC Sales Pro', lastContact: '5d ago' },
];

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'nurturing', 'converted', 'lost', 'unresponsive'];
const SOURCE_OPTIONS = ['Web Form', 'Phone Call', 'Referral', 'Social Media', 'Other'];
const AGENT_OPTIONS = ['HVAC Sales Pro', 'Roofing Lead Closer', 'Med Spa Concierge', 'Dental Intake Bot'];

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
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [dropdownLeadId, setDropdownLeadId] = useState<string | null>(null);

  // Add lead form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState('new');
  const [formSource, setFormSource] = useState('Web Form');
  const [formAgent, setFormAgent] = useState(AGENT_OPTIONS[0]);
  const [formNotes, setFormNotes] = useState('');

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
    setFormSource('Web Form');
    setFormAgent(AGENT_OPTIONS[0]);
    setFormNotes('');
  }

  function handleAddLead(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;
    const newLead: Lead = {
      id: String(Date.now()),
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || undefined,
      status: formStatus,
      score: Math.floor(Math.random() * 41) + 30, // 30-70
      agent: formAgent,
      source: formSource,
      notes: formNotes.trim() || undefined,
      lastContact: 'Just now',
    };
    setLeads((prev) => [newLead, ...prev]);
    resetForm();
    setAddModalOpen(false);
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
        {/* Toolbar — stacks on mobile */}
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

        {/* Table */}
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
              {[1, 2, 3].map((p) => (
                <button key={p} className="w-8 h-8 rounded-md flex items-center justify-center text-[12px] font-semibold"
                  style={{ background: p === 1 ? 'var(--text-dark)' : 'transparent', color: p === 1 ? '#fff' : 'var(--text-dark-secondary)' }}>{p}</button>
              ))}
              <button className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100"><ChevronRight size={16} style={{ color: 'var(--text-dark-secondary)' }} /></button>
            </div>
          </div>
        </Card>
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
                {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </FormSelect>
            </FormField>
          </div>
          <FormField label="Assign Agent">
            <FormSelect value={formAgent} onChange={(e) => setFormAgent(e.target.value)}>
              {AGENT_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
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
