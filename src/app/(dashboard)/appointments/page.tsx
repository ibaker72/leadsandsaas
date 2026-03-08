'use client';

import { useState } from 'react';
import { TopBar } from '@/components/dashboard/sidebar';
import { Card, EmptyState, Button, Modal, ComingSoonContent } from '@/components/ui/primitives';
import { Calendar, Plus } from 'lucide-react';

export default function AppointmentsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <TopBar title="Appointments" subtitle="Manage scheduled appointments" />
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <Card>
          <EmptyState
            icon={<Calendar size={24} />}
            title="No appointments yet"
            description="When your AI agents book appointments, they appear here with reminders and calendar sync."
            action={<Button variant="primary" size="md" onClick={() => setShowModal(true)}><Plus size={15}/> Add Appointment</Button>}
          />
        </Card>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Appointment">
        <ComingSoonContent
          feature="Appointment Scheduling"
          description="Manual appointment creation with calendar integration (Google Calendar, Outlook) is coming soon. AI agents will also auto-book appointments from conversations."
        />
        <Button variant="primary" size="md" className="w-full mt-4" onClick={() => setShowModal(false)}>Got it</Button>
      </Modal>
    </>
  );
}
