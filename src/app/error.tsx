'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f8f9fb' }}>
      <div className="max-w-md w-full text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'var(--danger-soft, #fef2f2)', color: 'var(--danger, #dc2626)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-[22px] font-bold mb-2" style={{ color: 'var(--text-dark, #111)', fontFamily: 'Satoshi, sans-serif' }}>
          Something went wrong
        </h1>
        <p className="text-[14px] mb-6" style={{ color: 'var(--text-dark-secondary, #666)' }}>
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all"
            style={{ background: 'var(--accent, #f59e0b)', color: '#0b0e14' }}
          >
            Try Again
          </button>
          <a
            href="/overview"
            className="px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all"
            style={{ background: '#f0f2f5', color: 'var(--text-dark, #111)' }}
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
