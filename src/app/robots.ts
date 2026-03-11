import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://leadsandsaas.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/features', '/pricing', '/industries', '/about', '/terms', '/privacy'],
        disallow: ['/dashboard/', '/overview', '/agents', '/leads', '/conversations', '/appointments', '/pipelines', '/settings', '/billing', '/onboarding', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
