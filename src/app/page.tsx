import Link from 'next/link'
import { getAllContent } from '@/lib/markdown'
import { TournamentContent } from '@/types/content'

export default async function Home() {
  const tournaments = await getAllContent('tournaments', 'en') as TournamentContent[]
  const upcomingTournaments = tournaments
    .filter((t) => t?.data?.status === 'upcoming')
    .slice(0, 3)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg mb-12">
        <h1 className="text-5xl font-bold mb-4">Sector Hungaricus</h1>
        <p className="text-xl mb-8">Hungarian Skirmish Gaming Community</p>
        <div className="space-x-4">
          <Link
            href="/games"
            className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Our Games
          </Link>
          <Link
            href="/tournaments"
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors"
          >
            View Tournaments
          </Link>
        </div>
      </section>

      {/* Games Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Featured Games</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-48 bg-red-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-red-600">Kill Team</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Kill Team</h3>
              <p className="text-gray-600 mb-4">
                Fast-paced skirmish battles in the 41st Millennium
              </p>
              <Link
                href="/games/kill-team"
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Learn More →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-48 bg-blue-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">Spearhead</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Spearhead</h3>
              <p className="text-gray-600 mb-4">
                Compact 40K battles with streamlined rules
              </p>
              <Link
                href="/games/spearhead"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Tournaments */}
      {upcomingTournaments.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Upcoming Tournaments</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingTournaments.map((tournament, index: number) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-2">{tournament.data.title}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(tournament.data.date).toLocaleDateString()}
                </p>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {tournament.data.description}
                </p>
                <Link
                  href={`/tournaments/${tournament.slug}`}
                  className="text-red-600 hover:text-red-700 font-semibold"
                >
                  Learn More →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Community Section */}
      <section className="text-center py-16 bg-gray-100 rounded-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Join Our Community</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Whether you&apos;re a veteran player or just starting out, our friendly community 
          welcomes players of all skill levels. Join us for regular tournaments, 
          painting sessions, and casual games.
        </p>
        <Link
          href="/tournaments"
          className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          View Upcoming Events
        </Link>
      </section>
    </div>
  )
}
