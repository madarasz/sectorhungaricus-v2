import Link from 'next/link'
import { getAllContent } from '@/lib/markdown'
import { GameContent } from '@/types/content'

export default async function GamesPage() {
  const games = await getAllContent('games', 'hu') as GameContent[]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Our Games</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map((game, index: number) => (
          <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {game.data.featuredImage && (
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-lg text-gray-500">Image: {game.data.featuredImage}</span>
              </div>
            )}
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-2">{game.data.title}</h2>
              <p className="text-gray-600 mb-4">{game.data.description}</p>
              <Link
                href={`/games/${game.slug}`}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}