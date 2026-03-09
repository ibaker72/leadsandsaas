'use client';

import { useState, useEffect } from 'react';
import { TopBar } from '@/components/dashboard/sidebar';
import { Badge, Button, Card, EmptyState, Modal, FormField, FormInput, FormSelect, FormTextarea, Avatar } from '@/components/ui/primitives';
import { Calendar, Plus, Clock, User, CheckCircle, X, Bot, ChevronDown, ChevronUp } from 'lucide-react';

type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

type Appointment = {
  id: string;
  title: string;
  client: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  agent: string;
  notes: string;
  lead_id?: string;
  agent_id?: string;
};

const STATUS_VARIANT: Record<AppointmentStatus, 'info' | 'success' | 'danger' | 'warning'> = {
  scheduled: 'info',
  confirmed: 'success',
  completed: 'success',
  cancelled: 'danger',
  no_show: 'warning',
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

function formatDate(date: string): string {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function formatDuration(mins: number): string {
  return DURATION_OPTIONS.find((d) => d.value === mins)?.label || `${mins} min`;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentOptions, setAgentOptions] = useState<{id: string; name: string}[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formService, setFormService] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formDuration, setFormDuration] = useState(60);
  const [formAgent, setFormAgent] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<'scheduled' | 'confirmed'>('scheduled');

  useEffect(() => {
    Promise.all([
      fetch('/api/appointments').then(r => r.json()),
      fetch('/api/agents').then(r => r.json()),
    ]).then(([apptData, agentsData]) => {
      const agentMap = new Map<string, string>();
      const opts: {id: string; name: string}[] = [];
      (agentsData.agents || []).forEach((a: Record<string, unknown>) => {
        agentMap.set(a.id as string, a.name as string);
        opts.push({ id: a.id as string, name: a.name as string });
      });
      setAgentOptions(opts);

      if (apptData.appointments) {
        setAppointments(apptData.appointments.map((a: Record<string, unknown>) => {
          const startsAt = new Date(a.starts_at as string);
          const endsAt = new Date(a.ends_at as string);
          const durationMins = Math.round((endsAt.getTime() - startsAt.getTime()) / 60000);
          return {
            id: a.id as string,
            title: (a.title as string) || 'Appointment',
            client: (a.lead_name as string) || 'Unknown',
            service: (a.service_type as string) || '',
            date: startsAt.toISOString().split('T')[0],
            time: startsAt.toTimeString().slice(0, 5),
            duration: durationMins > 0 ? durationMins : 60,
            status: (a.status as AppointmentStatus) || 'scheduled',
            agent: a.agent_id ? (agentMap.get(a.agent_id as string) || 'Unassigned') : 'Unassigned',
            notes: (a.notes as string) || '',
            lead_id: (a.lead_id as string) || undefined,
            agent_id: (a.agent_id as string) || undefined,
          };
        }));
      }
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setFormTitle('');
    setFormClient('');
    setFormService('');
    setFormDate('');
    setFormTime('');
    setFormDuration(60);
    setFormAgent('');
    setFormNotes('');
    setFormStatus('scheduled');
  }

  function showToast(msg: string) {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !formClient.trim() || !formDate || !formTime) return;

    const startsAt = new Date(formDate + 'T' + formTime).toISOString();
    const endsAt = new Date(new Date(formDate + 'T' + formTime).getTime() + formDuration * 60000).toISOString();
    const agentName = agentOptions.find(a => a.id === formAgent)?.name || 'Unassigned';

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formTitle.trim(),
        service_type: formService.trim(),
        starts_at: startsAt,
        ends_at: endsAt,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        agent_id: formAgent || null,
        notes: formNotes.trim(),
        status: formStatus,
      }),
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json();
      if (data.appointment) {
        const newAppointment: Appointment = {
          id: data.appointment.id as string,
          title: formTitle.trim(),
          client: formClient.trim(),
          service: formService.trim(),
          date: formDate,
          time: formTime,
          duration: formDuration,
          status: formStatus,
          agent: agentName,
          notes: formNotes.trim(),
          agent_id: formAgent || undefined,
        };
        setAppointments((prev) => [newAppointment, ...prev]);
        resetForm();
        setShowModal(false);
        showToast('Appointment created successfully');
      }
    } else {
      const errMsg = res ? await res.json().then(d => d.error || d.message).catch(() => null) : null;
      showToast(errMsg || 'Failed to create appointment. Please try again.');
    }
  }

  function updateStatus(id: string, status: AppointmentStatus) {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    showToast(`Appointment ${STATUS_LABELS[status].toLowerCase()}`);
    fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }

  const sorted = [...appointments].sort((a, b) => {
    const da = a.date + a.time;
    const db = b.date + b.time;
    return da.localeCompare(db);
  });

  return (
    <>
      <TopBar title="Appointments" subtitle={`${appointments.length} scheduled`} />
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        {/* Toast */}
        {successToast && (
          <div
            className="fixed top-4 right-4 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-semibold animate-fade-in"
            style={{ background: 'var(--success)', color: '#fff', boxShadow: '0 10px 40px -8px rgba(0,0,0,0.2)' }}
          >
            <CheckCircle size={16} />
            {successToast}
          </div>
        )}

        {/* Header actions */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h2 className="text-[16px] md:text-[18px] font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi, sans-serif' }}>
              Upcoming Appointments
            </h2>
            <p className="text-[12px] md:text-[13px] mt-0.5" style={{ color: 'var(--text-dark-secondary)' }}>
              Manage and track all scheduled appointments
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus size={15} /> Add Appointment
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-16 rounded" style={{ background: '#f0f2f5' }} />
              </Card>
            ))}
          </div>
        )}

        {/* Appointment list */}
        {!loading && sorted.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Calendar size={24} />}
              title="No appointments yet"
              description="When your AI agents book appointments, they appear here with reminders and calendar sync."
              action={<Button variant="primary" size="md" onClick={() => setShowModal(true)}><Plus size={15} /> Add Appointment</Button>}
            />
          </Card>
        ) : !loading && (
          <div className="space-y-3">
            {sorted.map((appt) => {
              const isExpanded = expandedId === appt.id;
              return (
                <Card key={appt.id} padding={false} className="overflow-hidden">
                  {/* Main row */}
                  <button
                    type="button"
                    className="w-full text-left px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 hover:bg-gray-50/60 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : appt.id)}
                  >
                    <Avatar name={appt.client} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13.5px] md:text-[14px] font-semibold truncate" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi, sans-serif' }}>
                          {appt.title}
                        </span>
                        <Badge variant={STATUS_VARIANT[appt.status]} dot>{STATUS_LABELS[appt.status]}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-[12px] md:text-[12.5px] flex items-center gap-1" style={{ color: 'var(--text-dark-secondary)' }}>
                          <User size={11} /> {appt.client}
                        </span>
                        {appt.service && (
                          <span className="text-[12px] md:text-[12.5px]" style={{ color: 'var(--text-dark-secondary)' }}>
                            {appt.service}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[12.5px] font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-dark)' }}>
                        <Calendar size={12} style={{ color: 'var(--accent)' }} /> {formatDate(appt.date)}
                      </span>
                      <span className="text-[11.5px] flex items-center gap-1" style={{ color: 'var(--text-dark-secondary)' }}>
                        <Clock size={11} /> {formatTime(appt.time)} &middot; {formatDuration(appt.duration)}
                      </span>
                    </div>
                    <div className="shrink-0 ml-1" style={{ color: 'var(--text-dark-secondary)' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {/* Mobile date/time */}
                  <div className="sm:hidden px-4 pb-2 flex items-center gap-3 -mt-1">
                    <span className="text-[11.5px] font-semibold flex items-center gap-1" style={{ color: 'var(--text-dark)' }}>
                      <Calendar size={11} style={{ color: 'var(--accent)' }} /> {formatDate(appt.date)}
                    </span>
                    <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-dark-secondary)' }}>
                      <Clock size={10} /> {formatTime(appt.time)} &middot; {formatDuration(appt.duration)}
                    </span>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-4 md:px-5 pb-4 md:pb-5 animate-fade-in" style={{ borderTop: '1px solid #f0f2f5' }}>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3.5 mb-4">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dark-secondary)' }}>Date</div>
                          <span className="text-[12.5px] font-medium" style={{ color: 'var(--text-dark)' }}>{formatDate(appt.date)}</span>
                        </div>
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dark-secondary)' }}>Time</div>
                          <span className="text-[12.5px] font-medium" style={{ color: 'var(--text-dark)' }}>{formatTime(appt.time)}</span>
                        </div>
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dark-secondary)' }}>Duration</div>
                          <span className="text-[12.5px] font-medium" style={{ color: 'var(--text-dark)' }}>{formatDuration(appt.duration)}</span>
                        </div>
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dark-secondary)' }}>Agent</div>
                          <div className="flex items-center gap-1.5">
                            <Bot size={12} style={{ color: 'var(--accent)' }} />
                            <span className="text-[12.5px] font-medium" style={{ color: 'var(--text-dark)' }}>{appt.agent}</span>
                          </div>
                        </div>
                      </div>
                      {appt.notes && (
                        <div className="mb-4">
                          <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-dark-secondary)' }}>Notes</div>
                          <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--text-dark)' }}>{appt.notes}</p>
                        </div>
                      )}
                      {/* Quick actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {appt.status === 'scheduled' && (
                          <Button variant="primary" size="sm" onClick={() => updateStatus(appt.id, 'confirmed')}>
                            <CheckCircle size={13} /> Confirm
                          </Button>
                        )}
                        {(appt.status === 'scheduled' || appt.status === 'confirmed') && (
                          <Button variant="secondary" size="sm" onClick={() => updateStatus(appt.id, 'completed')}>
                            <CheckCircle size={13} /> Mark Complete
                          </Button>
                        )}
                        {(appt.status === 'scheduled' || appt.status === 'confirmed') && (
                          <Button variant="danger" size="sm" onClick={() => updateStatus(appt.id, 'cancelled')}>
                            <X size={13} /> Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Appointment Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Appointment" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title" required>
            <FormInput placeholder="e.g. AC Inspection" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
          </FormField>
          <FormField label="Lead / Client Name" required>
            <FormInput placeholder="e.g. Sarah Mitchell" value={formClient} onChange={(e) => setFormClient(e.target.value)} required />
          </FormField>
          <FormField label="Service Type">
            <FormInput placeholder="e.g. AC Repair, Full Replacement" value={formService} onChange={(e) => setFormService(e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date" required>
              <FormInput type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} required />
            </FormField>
            <FormField label="Time" required>
              <FormInput type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} required />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Duration">
              <FormSelect value={formDuration} onChange={(e) => setFormDuration(Number(e.target.value))}>
                {DURATION_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </FormSelect>
            </FormField>
            <FormField label="Status">
              <FormSelect value={formStatus} onChange={(e) => setFormStatus(e.target.value as 'scheduled' | 'confirmed')}>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
              </FormSelect>
            </FormField>
          </div>
          <FormField label="Assigned Agent">
            <FormSelect value={formAgent} onChange={(e) => setFormAgent(e.target.value)}>
              <option value="">Select agent</option>
              {agentOptions.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </FormSelect>
          </FormField>
          <FormField label="Notes">
            <FormTextarea placeholder="Any additional notes..." rows={3} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
          </FormField>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="secondary" size="md" className="flex-1" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" size="md" className="flex-1" type="submit">Create Appointment</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
