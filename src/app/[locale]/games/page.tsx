import Link from 'next/link'
import { getAllContent } from '@/lib/markdown'
import { Locale } from '@/contexts/LocaleContext'

interface GamesPageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateStaticParams() {
  return [{ locale: 'en' }] // Only generate English version (Hungarian is default)
}

export default async function GamesPage({ params }: GamesPageProps) {
  const { locale } = await params
  const validLocale = locale as Locale
  const games = await getAllContent('games', validLocale)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {validLocale === 'hu' ? 'Játékok' : 'Games'}
          </h1>
          <p className="text-xl text-gray-600">
            {validLocale === 'hu' 
              ? 'Fedezd fel a közösségünk által játszott izgalmas miniature játékokat'
              : 'Discover the exciting miniature games played by our community'
            }
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => game && (
            <Link 
              key={game.slug}
              href={validLocale === 'en' ? `/en/games/${game.slug}` : `/games/${game.slug}`}
              className="group block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {game.data.featuredImage && (
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Featured Image: {game.data.featuredImage}</span>
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
                  {game.data.title}
                </h2>
                <p className="text-gray-600 text-sm">
                  {game.data.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {games.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {validLocale === 'hu' ? 'Még nincsenek játékok hozzáadva.' : 'No games have been added yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}