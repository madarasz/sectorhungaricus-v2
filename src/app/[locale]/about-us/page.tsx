import { getMarkdownContent } from '@/lib/markdown'
import { Locale } from '@/contexts/LocaleContext'

interface AboutUsPageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateStaticParams() {
  return [{ locale: 'en' }] // Only generate English version (Hungarian is default)
}

export default async function AboutUsPage({ params }: AboutUsPageProps) {
  const { locale } = await params
  const validLocale = locale as Locale
  const aboutPage = await getMarkdownContent('pages', 'about-us', validLocale)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {aboutPage?.data?.title || (validLocale === 'hu' ? 'Rólunk' : 'About Us')}
          </h1>
        </header>

        {aboutPage && (
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: aboutPage.contentHtml }}
          />
        )}

        {!aboutPage && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {validLocale === 'hu' 
                ? 'A rólunk oldal tartalma még nem elérhető.' 
                : 'About us page content is not available yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}