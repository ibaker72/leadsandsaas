import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f8f9fb' }}>
      <div className="max-w-md w-full text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'var(--accent-soft, #fef3c7)', color: 'var(--accent, #f59e0b)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h1 className="text-[22px] font-bold mb-2" style={{ color: 'var(--text-dark, #111)', fontFamily: 'Satoshi, sans-serif' }}>
          Page not found
        </h1>
        <p className="text-[14px] mb-6" style={{ color: 'var(--text-dark-secondary, #666)' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/overview"
            className="px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all"
            style={{ background: 'var(--accent, #f59e0b)', color: '#0b0e14' }}
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all"
            style={{ background: '#f0f2f5', color: 'var(--text-dark, #111)' }}
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
