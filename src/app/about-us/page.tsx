import { getMarkdownContent } from '@/lib/markdown'

export default async function AboutUsPage() {
  const aboutPage = await getMarkdownContent('pages', 'about-us', 'hu')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {aboutPage?.data?.title || 'Rólunk'}
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
              A rólunk oldal tartalma még nem elérhető.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}