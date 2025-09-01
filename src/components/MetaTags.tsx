import { Locale } from '@/lib/locale-utils'

interface MetaTagsProps {
  locale: Locale
  pathname: string
  title?: string
  description?: string
}

export default function MetaTags({ locale, pathname, title, description }: MetaTagsProps) {
  // Remove locale prefix from pathname for hreflang generation
  const cleanPath = pathname.replace(/^\/(en|hu)/, '') || '/'
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sectorhungaricus.com'
  
  const hreflangs = [
    {
      lang: 'hu',
      url: `${baseUrl}${cleanPath === '/' ? '' : cleanPath}`,
    },
    {
      lang: 'en', 
      url: `${baseUrl}/en${cleanPath === '/' ? '' : cleanPath}`,
    },
    {
      lang: 'x-default',
      url: `${baseUrl}${cleanPath === '/' ? '' : cleanPath}`, // Hungarian is default
    }
  ]

  return (
    <>
      {/* Language meta */}
      <html lang={locale} />
      
      {/* Hreflang links */}
      {hreflangs.map((hreflang) => (
        <link
          key={hreflang.lang}
          rel="alternate"
          hrefLang={hreflang.lang}
          href={hreflang.url}
        />
      ))}
      
      {/* Open Graph locale */}
      <meta property="og:locale" content={locale === 'hu' ? 'hu_HU' : 'en_US'} />
      {locale === 'hu' && <meta property="og:locale:alternate" content="en_US" />}
      {locale === 'en' && <meta property="og:locale:alternate" content="hu_HU" />}
      
      {/* Title and description if provided */}
      {title && (
        <>
          <title>{title}</title>
          <meta property="og:title" content={title} />
        </>
      )}
      
      {description && (
        <>
          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
        </>
      )}
    </>
  )
}