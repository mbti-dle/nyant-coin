import { MetadataRoute } from 'next'

import { SITE_URL } from '@/constants/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/game/', '/waiting/', '/result/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
