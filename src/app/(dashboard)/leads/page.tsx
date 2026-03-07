'use client';

import { useState } from 'react';
import { TopBar } from '@/components/dashboard/sidebar';
import { Badge, Button, Card, LEAD_STATUS_VARIANT } from '@/components/ui/primitives';
import { Search, Download, Plus, ChevronLeft, ChevronRight, MoreHorizontal, Mail, Bot } from 'lucide-react';

const LEADS = [
  { id: '1', name: 'Sarah Mitchell', email: 'sarah@email.com', status: 'contacted', score: 72, agent: 'HVAC Sales Pro', lastContact: '2m ago' },
  { id: '2', name: 'Marcus Johnson', email: 'marcus.j@gmail.com', status: 'qualified', score: 88, agent: 'Roofing Lead Closer', lastContact: '8m ago' },
  { id: '3', name: 'David Chen', email: 'dchen@outlook.com', status: 'new', score: 45, agent: 'Med Spa Concierge', lastContact: '15m ago' },
  { id: '4', name: 'Lisa Rodriguez', email: 'lisa.r@email.com', status: 'nurturing', score: 55, agent: 'HVAC Sales Pro', lastContact: '22m ago' },
  { id: '5', name: 'James Wilson', email: 'jwilson@email.com', status: 'contacted', score: 67, agent: 'Roofing Lead Closer', lastContact: '34m ago' },
  { id: '6', name: 'Robert Brown', email: 'rbrown@email.com', status: 'converted', score: 95, agent: 'HVAC Sales Pro', lastContact: '3h ago' },
  { id: '7', name: 'Jennifer Taylor', email: 'jtaylor@email.com', status: 'lost', score: 30, agent: 'Roofing Lead Closer', lastContact: '2d ago' },
  { id: '8', name: 'Amanda White', email: 'awhite@email.com', status: 'unresponsive', score: 20, agent: 'HVAC Sales Pro', lastContact: '5d ago' },
];

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--accent)' : score >= 25 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 md:w-12 h-1.5 rounded-full overflow-hidden" style={{ background: '#e8eaef' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[12px] font-semibold tabular-nums" style={{ color }}>{score}</span>
    </div>
  );
}

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const filtered = LEADS.filter((l) => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (search) return l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  return (
    <>
      <TopBar title="Leads" subtitle={`${LEADS.length} total leads`} />
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
            <Button variant="secondary" size="sm" className="flex-1 sm:flex-none"><Download size={14} /> Export</Button>
            <Button variant="primary" size="sm" className="flex-1 sm:flex-none"><Plus size={14} /> Add Lead</Button>
          </div>
        </div>

        {/* Table — horizontal scroll wrapper on mobile */}
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
                  <tr key={l.id} className="hover:bg-gray-50 cursor-pointer transition-colors" style={{ borderBottom: '1px solid #f0f2f5' }}>
                    <td className="py-3 px-3 md:px-4">
                      <div className="text-[13px] md:text-[13.5px] font-semibold" style={{ color: 'var(--text-dark)' }}>{l.name}</div>
                      <div className="text-[11px] md:text-[12px] flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-dark-secondary)' }}><Mail size={10} />{l.email}</div>
                    </td>
                    <td className="py-3 px-3 md:px-4"><Badge variant={LEAD_STATUS_VARIANT[l.status] || 'muted'} dot>{l.status}</Badge></td>
                    <td className="py-3 px-3 md:px-4"><ScoreBar score={l.score} /></td>
                    <td className="py-3 px-3 md:px-4">
                      <div className="flex items-center gap-1.5"><Bot size={12} style={{ color: 'var(--accent)' }} /><span className="text-[12px] md:text-[12.5px] font-medium truncate" style={{ color: 'var(--text-dark)' }}>{l.agent}</span></div>
                    </td>
                    <td className="py-3 px-3 md:px-4"><span className="text-[12px] md:text-[12.5px] whitespace-nowrap" style={{ color: 'var(--text-dark-secondary)' }}>{l.lastContact}</span></td>
                    <td className="py-3 px-3 md:px-4">
                      <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-100 btn-icon-sm">
                        <MoreHorizontal size={15} style={{ color: 'var(--text-dark-secondary)' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-3 md:px-5 py-3 md:py-4" style={{ borderTop: '1px solid #e8eaef' }}>
            <span className="text-[11px] md:text-[12.5px]" style={{ color: 'var(--text-dark-secondary)' }}>
              {filtered.length} of {LEADS.length}
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
    </>
  );
}
