import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'LeadsAndSaaS — AI Sales Agents for Service Businesses',
    template: '%s | LeadsAndSaaS',
  },
  description: 'Capture more leads, respond instantly with AI, and book more appointments. Built for HVAC, roofing, dental, and service businesses.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://leadsandsaas.com'),
  openGraph: {
    type: 'website',
    siteName: 'LeadsAndSaaS',
    title: 'LeadsAndSaaS — AI Sales Agents for Service Businesses',
    description: 'Capture more leads, respond instantly with AI, and book more appointments.',
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/logos/leadsandsaas-icon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'LeadsAndSaaS',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'AI-powered sales agent platform for service businesses.',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '29',
    highPrice: '149',
    priceCurrency: 'USD',
    offerCount: '3',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-surface)]">{children}</body>
    </html>
  );
}
