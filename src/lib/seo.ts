import type { Metadata } from 'next'
import { Locale } from './locale-utils'

export const SITE_NAME = 'Sector Hungaricus'
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://sectorhungaricus.com'

const DEFAULT_OG_IMAGE = '/uploads/sh-logo.png'
const OG_LOCALE: Record<Locale, string> = { hu: 'hu_HU', en: 'en_US' }

// path: clean route without locale prefix, leading+trailing slash (e.g. '/', '/about/', '/kill-team/what-is-kill-team/')
function localizedUrl(locale: Locale, path: string): string {
  return `${BASE_URL}/${locale}${path}`
}

interface BuildPageMetadataArgs {
  locale: Locale
  path: string
  title: string
  description?: string
  image?: string // relative path under site root; defaults to the logo
}

export function buildPageMetadata({ locale, path, title, description, image }: BuildPageMetadataArgs): Metadata {
  const canonical = localizedUrl(locale, path)
  const ogImage = `${BASE_URL}${image || DEFAULT_OG_IMAGE}`

  return {
    title,
    ...(description ? { description } : {}),
    alternates: {
      canonical,
      languages: {
        'hu-HU': localizedUrl('hu', path),
        'en-US': localizedUrl('en', path),
        'x-default': localizedUrl('hu', path),
      },
    },
    openGraph: {
      title,
      ...(description ? { description } : {}),
      url: canonical,
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      type: 'website',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      ...(description ? { description } : {}),
      images: [ogImage],
    },
  }
}

// Final <title>: an explicit metaTitle wins; otherwise join the page parts with the brand name.
export function composeTitle(metaTitle: string | undefined, ...parts: (string | undefined)[]): string {
  if (metaTitle) return metaTitle
  return [...parts, SITE_NAME].filter(Boolean).join(' — ')
}
