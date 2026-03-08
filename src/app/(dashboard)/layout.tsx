'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, SidebarProvider } from '@/components/dashboard/sidebar';
import { TrialBanner } from '@/components/ui/primitives';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [trialDays, setTrialDays] = useState<number | null>(null);
  const [planType, setPlanType] = useState<string>('trial');

  useEffect(() => {
    // Check trial status from localStorage (set during signup bootstrap or onboarding)
    // In production this would come from the org record via server component
    const stored = localStorage.getItem('ls_trial_ends_at');
    const plan = localStorage.getItem('ls_plan') || 'trial';
    setPlanType(plan);

    if (stored && plan === 'trial') {
      const endsAt = new Date(stored);
      const now = new Date();
      const diff = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      setTrialDays(diff);
    }
  }, []);

  const showTrialBanner = planType === 'trial' && trialDays !== null;

  return (
    <SidebarProvider>
      <div className="min-h-screen" style={{ background: 'var(--bg-surface)' }}>
        <Sidebar />
        {/* Desktop: offset by sidebar width. Mobile: full width */}
        <main className="md:ml-[256px] min-h-screen flex flex-col transition-all duration-300">
          {showTrialBanner && (
            <TrialBanner
              daysLeft={trialDays}
              onUpgrade={() => router.push('/billing')}
            />
          )}
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
