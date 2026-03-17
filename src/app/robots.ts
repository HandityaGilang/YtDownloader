import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://ytxdownloader.biz.id'; 

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/', // Keep your API routes private from search results
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
