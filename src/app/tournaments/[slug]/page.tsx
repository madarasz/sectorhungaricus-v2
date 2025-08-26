import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMarkdownContent, getAllSlugs } from '@/lib/markdown'

interface TournamentPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const slugs = getAllSlugs('tournaments')
  return slugs.map((slug) => ({
    slug,
  }))
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { slug } = await params
  const tournament = await getMarkdownContent('tournaments', slug, 'en')
  
  if (!tournament) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              tournament.data.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
              tournament.data.status === 'ongoing' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {tournament.data.status}
            </span>
            <span className="text-sm text-gray-500">{tournament.data.game}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{tournament.data.title}</h1>
          
          <div className="text-lg text-gray-600 mb-6">
            📅 {formatDate(tournament.data.date)}
          </div>
        </header>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Tournament Details</h2>
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: tournament.data.description }}
          />
        </div>

        {tournament.data.registration && (
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: tournament.data.registration }}
            />
          </div>
        )}

        {tournament.data.resultsGallery && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-4">Results Gallery</h3>
            <Link 
              href={`/gallery/${tournament.data.resultsGallery}`}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              View Tournament Photos →
            </Link>
          </div>
        )}

        <div className="mt-12 pt-8 border-t">
          <Link
            href="/tournaments"
            className="text-red-600 hover:text-red-700 font-semibold"
          >
            ← Back to All Tournaments
          </Link>
        </div>
      </article>
    </div>
  )
}