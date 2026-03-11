'use client';

import { useRouter } from 'next/navigation';
import { Zap, ArrowRight } from 'lucide-react';
import { getPlanDisplayName, getPlanPrice, getUpgradePlan } from '@/lib/entitlements';

interface UpgradePromptProps {
  currentPlan: string;
  feature: string;
  description: string;
}

export function UpgradePrompt({ currentPlan, feature, description }: UpgradePromptProps) {
  const router = useRouter();
  const upgradeTo = getUpgradePlan(currentPlan);

  if (!upgradeTo) return null;

  return (
    <div className="rounded-xl p-5 border" style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent)' }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent)', color: '#0b0e14' }}>
          <Zap size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-bold mb-1" style={{ color: 'var(--text-dark)', fontFamily: 'Satoshi' }}>
            {feature}
          </h4>
          <p className="text-[13px] mb-3" style={{ color: 'var(--text-dark-secondary)' }}>
            {description} Available on the {getPlanDisplayName(upgradeTo)} plan (${getPlanPrice(upgradeTo)}/mo).
          </p>
          <button
            onClick={() => router.push('/billing')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all hover:opacity-90"
            style={{ background: 'var(--accent)', color: '#0b0e14' }}
          >
            Upgrade to {getPlanDisplayName(upgradeTo)} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
