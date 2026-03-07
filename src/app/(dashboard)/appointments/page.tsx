import { TopBar } from '@/components/dashboard/sidebar';
import { Card, EmptyState, Button } from '@/components/ui/primitives';
import { Calendar, Plus } from 'lucide-react';
export default function AppointmentsPage() {
  return (
    <>
      <TopBar title="Appointments" subtitle="Manage scheduled appointments" />
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <Card>
          <EmptyState
            icon={<Calendar size={24} />}
            title="No appointments yet"
            description="When your AI agents book appointments, they appear here with reminders and calendar sync."
            action={<Button variant="primary" size="md"><Plus size={15}/> Add Appointment</Button>}
          />
        </Card>
      </div>
    </>
  );
}
