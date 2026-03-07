'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// StatCard — responsive text sizing
// ---------------------------------------------------------------------------
interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  accentColor?: string;
  delay?: number;
}

export function StatCard({ label, value, change, icon, accentColor = 'var(--accent)', delay = 0 }: StatCardProps) {
  const pos = change && change > 0;
  const neg = change && change < 0;

  return (
    <div
      className="rounded-xl p-4 md:p-5 card-hover animate-fade-in opacity-0"
      style={{
        background: '#fff',
        border: '1px solid #e8eaef',
        boxShadow: 'var(--shadow-sm)',
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards',
      }}
    >
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div
          className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${accentColor}14`, color: accentColor }}
        >
          {icon}
        </div>
        {change !== undefined && (
          <div
            className="flex items-center gap-1 text-[11px] md:text-[12px] font-semibold px-1.5 md:px-2 py-0.5 md:py-1 rounded-md badge-inline"
            style={{
              background: pos ? 'var(--success-soft)' : neg ? 'var(--danger-soft)' : 'var(--bg-surface-secondary)',
              color: pos ? 'var(--success)' : neg ? 'var(--danger)' : 'var(--text-dark-secondary)',
            }}
          >
            {pos ? <TrendingUp size={11} /> : neg ? <TrendingDown size={11} /> : <Minus size={11} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div
        className="text-[22px] md:text-[28px] font-bold tracking-tight leading-none mb-1"
        style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi, sans-serif' }}
      >
        {value}
      </div>
      <div className="text-[12px] md:text-[13px] font-medium" style={{ color: 'var(--text-dark-secondary)' }}>
        {label}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

const BADGE: Record<BadgeVariant, { bg: string; color: string }> = {
  default: { bg: 'var(--accent-soft)', color: 'var(--accent)' },
  success: { bg: 'var(--success-soft)', color: 'var(--success)' },
  warning: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
  danger: { bg: 'var(--danger-soft)', color: 'var(--danger)' },
  info: { bg: 'var(--info-soft)', color: 'var(--info)' },
  muted: { bg: 'var(--bg-surface-secondary)', color: 'var(--text-dark-secondary)' },
};

export function Badge({ children, variant = 'default', dot = false }: { children: ReactNode; variant?: BadgeVariant; dot?: boolean }) {
  const s = BADGE[variant];
  return (
    <span
      className="badge-inline inline-flex items-center gap-1.5 text-[10.5px] md:text-[11.5px] font-semibold px-2 md:px-2.5 py-0.5 md:py-1 rounded-md uppercase tracking-wide whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />}
      {children}
    </span>
  );
}

export const LEAD_STATUS_VARIANT: Record<string, BadgeVariant> = {
  new: 'info', contacted: 'default', qualified: 'success', nurturing: 'warning',
  converted: 'success', lost: 'danger', unresponsive: 'muted',
};

export const AGENT_STATUS_VARIANT: Record<string, BadgeVariant> = {
  active: 'success', paused: 'warning', draft: 'muted',
};

// ---------------------------------------------------------------------------
// Button — proper touch target sizing
// ---------------------------------------------------------------------------
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const BTN_STYLES: Record<BtnVariant, string> = {
  primary: 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:bg-[#b45309] text-[#0b0e14] shadow-sm',
  secondary: 'bg-white hover:bg-[var(--bg-surface-secondary)] active:bg-gray-200 text-[var(--text-dark)] border border-[#e5e7eb]',
  ghost: 'bg-transparent hover:bg-[var(--bg-surface-secondary)] active:bg-gray-200 text-[var(--text-dark-secondary)]',
  danger: 'bg-[var(--danger-soft)] hover:bg-red-100 active:bg-red-200 text-[var(--danger)]',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: {
  children: ReactNode;
  variant?: BtnVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const sz = {
    sm: 'px-3 py-2 text-[12.5px] min-h-[36px]',
    md: 'px-4 py-2.5 text-[13.5px] min-h-[40px]',
    lg: 'px-6 py-3 text-[14px] min-h-[44px]',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 select-none ${BTN_STYLES[variant]} ${sz[size]} ${className}`}
      style={{ fontFamily: 'Satoshi, sans-serif' }}
      {...props}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------
export function Card({ children, className = '', padding = true }: { children: ReactNode; className?: string; padding?: boolean }) {
  return (
    <div
      className={`rounded-xl ${padding ? 'p-4 md:p-6' : ''} ${className}`}
      style={{ background: '#fff', border: '1px solid #e8eaef', boxShadow: 'var(--shadow-sm)' }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------
export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 px-6 md:px-8 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--bg-surface-secondary)', color: 'var(--text-dark-secondary)' }}>{icon}</div>
      <h3 className="text-[15px] md:text-[16px] font-bold mb-1.5" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>{title}</h3>
      <p className="text-[13px] md:text-[13.5px] max-w-sm mb-5" style={{ color: 'var(--text-dark-secondary)' }}>{description}</p>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton components
// ---------------------------------------------------------------------------
export function SkeletonCard() {
  return <div className="skeleton rounded-xl h-[120px] md:h-[140px]" />;
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="skeleton w-10 h-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
