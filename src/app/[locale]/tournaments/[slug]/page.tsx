import { notFound } from 'next/navigation'
import { getMarkdownContent, getAllSlugs } from '@/lib/markdown'
import { Locale } from '@/contexts/LocaleContext'

interface TournamentPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export async function generateStaticParams() {
  const slugs = getAllSlugs('tournaments')
  const locales: Locale[] = ['en']
  
  // Generate params for English only (Hungarian is default at root)
  return slugs.flatMap((slug) =>
    locales.map((locale) => ({
      slug,
      locale,
    }))
  )
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { slug, locale } = await params
  const validLocale = locale as Locale
  const tournament = await getMarkdownContent('tournaments', slug, validLocale)
  
  if (!tournament) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{tournament.data.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
            <span>Date: {tournament.data.date}</span>
            <span>Game: {tournament.data.game}</span>
            <span className={`px-2 py-1 rounded ${
              tournament.data.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
              tournament.data.status === 'ongoing' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {tournament.data.status}
            </span>
          </div>
          <p className="text-xl text-gray-600">{tournament.data.description}</p>
        </header>

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: tournament.contentHtml }}
        />

        {tournament.data.registration && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Registration</h3>
            <p className="text-gray-700">{tournament.data.registration}</p>
          </div>
        )}

        {tournament.data.resultsGallery && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-4">Results Gallery</h3>
            <p className="text-gray-600">Gallery: {tournament.data.resultsGallery}</p>
          </div>
        )}
      </article>
    </div>
  )
}