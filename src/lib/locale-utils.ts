export type Locale = 'hu' | 'en'

// Locale prefix of a path, for example "/en" in "/en/kill-team/"
export const LOCALE_PREFIX = /^\/(en|hu)(?=\/|$)/

// Path without its locale prefix, so the language versions of a page have the same path
export function removeLocalePrefix(path: string): string {
  return path.replace(LOCALE_PREFIX, '') || '/'
}

// Locale of the locale prefix of a path, undefined if the path has no locale prefix
export function localePrefixOf(path: string): Locale | undefined {
  return path.match(LOCALE_PREFIX)?.[1] as Locale | undefined
}

// Server-safe utility function to generate locale-aware URLs
export function getLocalizedPath(path: string, locale: Locale): string {
  // Remove any existing locale prefix
  const cleanPath = removeLocalePrefix(path)
  
  // Always add locale prefix since all URLs must have locale
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`
}

// Server-safe utility function to get locale from pathname
export function getLocaleFromPathname(pathname: string): Locale {
  return localePrefixOf(pathname) ?? 'hu'
}