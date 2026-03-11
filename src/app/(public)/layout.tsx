import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                <Zap size={20} color="#0b0e14" strokeWidth={2.5} />
              </div>
              <span className="text-[18px] font-bold tracking-tight" style={{ fontFamily: 'Satoshi' }}>LeadSaaS</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
              <Link href="/pricing" className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
              <Link href="/industries" className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors">Industries</Link>
              <Link href="/about" className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors">About</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:inline-flex text-[14px] font-semibold text-gray-700 hover:text-gray-900 transition-colors px-4 py-2">
                Sign In
              </Link>
              <Link href="/signup" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all hover:opacity-90" style={{ background: 'var(--accent)', color: '#0b0e14' }}>
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {children}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                  <Zap size={16} color="#0b0e14" strokeWidth={2.5} />
                </div>
                <span className="text-[16px] font-bold tracking-tight" style={{ fontFamily: 'Satoshi' }}>LeadSaaS</span>
              </Link>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-4">AI sales agents for service businesses. Capture leads, automate conversations, book appointments.</p>
              <a href="mailto:support@leadsandsaas.com" className="text-[13px] font-medium" style={{ color: 'var(--accent)' }}>support@leadsandsaas.com</a>
            </div>
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/features" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link></li>
                <li><Link href="/industries" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors">Industries</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors">About</Link></li>
                <li><Link href="/login" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link></li>
                <li><Link href="/signup" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors">Start Free Trial</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/terms" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-10 pt-8 text-center">
            <p className="text-[13px] text-gray-400">&copy; {new Date().getFullYear()} LeadSaaS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
