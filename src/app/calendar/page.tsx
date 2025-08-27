import { getMarkdownContent } from '@/lib/markdown'

export default async function CalendarPage() {
  const calendarPage = await getMarkdownContent('pages', 'calendar', 'hu')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {calendarPage?.data?.title || 'Naptár'}
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
              A naptár oldal tartalma még nem elérhető.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}