'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Bot, Users, MessageSquare, Calendar, GitBranch,
  Settings, CreditCard, Zap, Bell, HelpCircle, Menu, X, ChevronLeft,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Sidebar context — shared between Sidebar and TopBar
// ---------------------------------------------------------------------------

const SidebarContext = createContext<{
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}>({ mobileOpen: false, setMobileOpen: () => {} });

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Prevent body scroll when mobile sidebar open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <SidebarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Nav items
// ---------------------------------------------------------------------------

interface NavItem { label: string; href: string; icon: React.ComponentType<{ size?: number }>; }

const NAV_MAIN: NavItem[] = [
  { label: 'Overview', href: '/overview', icon: LayoutDashboard },
  { label: 'Agents', href: '/agents', icon: Bot },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Conversations', href: '/conversations', icon: MessageSquare },
  { label: 'Appointments', href: '/appointments', icon: Calendar },
  { label: 'Pipeline', href: '/pipelines', icon: GitBranch },
];

const NAV_BOTTOM: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Billing', href: '/billing', icon: CreditCard },
];

// ---------------------------------------------------------------------------
// Nav link component
// ---------------------------------------------------------------------------

function NavLink({ item, collapsed = false }: { item: NavItem; collapsed?: boolean }) {
  const pathname = usePathname();
  const active = pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative group"
      style={{
        background: active ? 'var(--sidebar-active)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      }}
    >
      {active && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
          style={{ background: 'var(--accent)' }}
        />
      )}
      <item.icon size={20} />
      {!collapsed && (
        <span className="text-[13.5px] font-medium truncate">{item.label}</span>
      )}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Sidebar inner content (shared between desktop and mobile)
// ---------------------------------------------------------------------------

function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center justify-between h-16 px-5 shrink-0"
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-glow)' }}
          >
            <Zap size={18} color="#0b0e14" strokeWidth={2.5} />
          </div>
          <span
            className="text-[15px] font-bold tracking-tight"
            style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi' }}
          >
            LeadSaaS
          </span>
        </div>
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center md:hidden"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_MAIN.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-4 space-y-1" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        {NAV_BOTTOM.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Desktop sidebar (hidden on mobile)
// ---------------------------------------------------------------------------

export function Sidebar() {
  const { mobileOpen, setMobileOpen } = useContext(SidebarContext);

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-screen flex-col z-40"
        style={{
          width: 'var(--sidebar-w)',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile: overlay + drawer */}
      {mobileOpen && (
        <>
          <div
            className="mobile-overlay md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="sidebar-drawer fixed left-0 top-0 h-screen flex flex-col z-50 md:hidden"
            style={{
              width: '280px',
              maxWidth: '85vw',
              background: 'var(--sidebar-bg)',
            }}
          >
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// TopBar — responsive with hamburger on mobile
// ---------------------------------------------------------------------------

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { setMobileOpen } = useContext(SidebarContext);

  return (
    <header
      className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-30 gap-4"
      style={{
        background: 'rgba(248, 249, 251, 0.88)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 rounded-lg flex items-center justify-center md:hidden shrink-0"
          style={{ color: 'var(--text-dark)' }}
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h1
            className="text-[18px] md:text-[22px] font-bold tracking-tight truncate"
            style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12px] md:text-[13px] mt-0.5 truncate hidden sm:block" style={{ color: 'var(--text-dark-secondary)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <button
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors relative hover:bg-gray-100"
          style={{ color: 'var(--text-dark-secondary)' }}
        >
          <Bell size={18} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full status-dot-active"
            style={{ background: 'var(--danger)' }}
          />
        </button>
        <button
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hidden sm:flex hover:bg-gray-100"
          style={{ color: 'var(--text-dark-secondary)' }}
        >
          <HelpCircle size={18} />
        </button>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-bold"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
        >
          JD
        </div>
      </div>
    </header>
  );
}
