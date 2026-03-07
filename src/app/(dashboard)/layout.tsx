import { Sidebar, SidebarProvider } from '@/components/dashboard/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen" style={{ background: 'var(--bg-surface)' }}>
        <Sidebar />
        {/* Desktop: offset by sidebar width. Mobile: full width */}
        <main className="md:ml-[256px] min-h-screen flex flex-col transition-all duration-300">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
