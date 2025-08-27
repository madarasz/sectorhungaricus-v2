import { getMarkdownContent } from '@/lib/markdown'
import { Locale } from '@/contexts/LocaleContext'

interface CalendarPageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateStaticParams() {
  return [{ locale: 'en' }] // Only generate English version (Hungarian is default)
}

export default async function CalendarPage({ params }: CalendarPageProps) {
  const { locale } = await params
  const validLocale = locale as Locale
  const calendarPage = await getMarkdownContent('pages', 'calendar', validLocale)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {calendarPage?.data?.title || (validLocale === 'hu' ? 'Naptár' : 'Calendar')}
          </h1>
        </header>

        {calendarPage && (
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: calendarPage.contentHtml }}
          />
        )}

        {!calendarPage && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {validLocale === 'hu' 
                ? 'A naptár oldal tartalma még nem elérhető.' 
                : 'Calendar page content is not available yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}