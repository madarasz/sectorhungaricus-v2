import type { MetadataRoute } from 'next'
import { getAllContent } from '@/lib/markdown'
import { SubpageContent } from '@/types/content'
import { BASE_URL } from '@/lib/seo'

const LOCALES = ['hu', 'en'] as const

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ['/', '/about/', '/calendar/']

  // Subpage slugs are duplicated across locales, so reading one locale is enough.
  const subpages = (await getAllContent('subpages', 'en')) as SubpageContent[]
  const subpagePaths = Array.from(
    new Set(
      subpages
        .filter((s) => s?.data.game && s?.data.slug)
        .map((s) => `/${s.data.game}/${s.data.slug}/`)
    )
  )

  const paths = [...staticPaths, ...subpagePaths]

  return paths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}${path}`,
      changeFrequency: 'weekly' as const,
      priority: path === '/' ? 1 : 0.7,
      alternates: {
        languages: {
          'hu-HU': `${BASE_URL}/hu${path}`,
          'en-US': `${BASE_URL}/en${path}`,
        },
      },
    }))
  )
}
