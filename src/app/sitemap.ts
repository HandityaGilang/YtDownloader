import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.ytxdownloader.biz.id'; 

  return [
    {
      url: `${baseUrl}/`,
      lastModified: '2026-03-17',
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];
}
