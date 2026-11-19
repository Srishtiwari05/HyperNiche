import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/messages', '/applications', '/profile'],
      },
    ],
    sitemap: 'https://hyperniche.in/sitemap.xml',
  };
}

