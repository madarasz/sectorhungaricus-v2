export type Locale = 'hu' | 'en'

// Server-safe utility function to generate locale-aware URLs
export function getLocalizedPath(path: string, locale: Locale): string {
  // Remove any existing locale prefix
  const cleanPath = path.replace(/^\/(en|hu)/, '') || '/'
  
  // Always add locale prefix since all URLs must have locale
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`
}

// Server-safe utility function to get locale from pathname
export function getLocaleFromPathname(pathname: string): Locale {
  return pathname.startsWith('/en') ? 'en' : 'hu'
}