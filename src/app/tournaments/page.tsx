import Link from 'next/link'
import { getAllContent } from '@/lib/markdown'
import { TournamentContent } from '@/types/content'

export default async function TournamentsPage() {
  const tournaments = await getAllContent('tournaments', 'en') as TournamentContent[]
  
  const upcomingTournaments = tournaments.filter((t) => t?.data?.status === 'upcoming')
  const ongoingTournaments = tournaments.filter((t) => t?.data?.status === 'ongoing')
  const completedTournaments = tournaments.filter((t) => t?.data?.status === 'completed')

  const TournamentCard = ({ tournament }: { tournament: TournamentContent }) => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{tournament.data.title}</h3>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          tournament.data.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
          tournament.data.status === 'ongoing' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {tournament.data.status}
        </span>
      </div>
      
      <p className="text-sm text-gray-500 mb-2">
        {new Date(tournament.data.date).toLocaleDateString()} • {tournament.data.game}
      </p>
      
      <div 
        className="text-gray-600 mb-4 line-clamp-3"
        dangerouslySetInnerHTML={{ __html: tournament.data.description }}
      />
      
      <Link
        href={`/tournaments/${tournament.slug}`}
        className="text-red-600 hover:text-red-700 font-semibold"
      >
        Learn More →
      </Link>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Tournaments</h1>

      {upcomingTournaments.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Tournaments</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTournaments.map((tournament, index: number) => (
              <TournamentCard key={index} tournament={tournament} />
            ))}
          </div>
        </section>
      )}

      {ongoingTournaments.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Ongoing Tournaments</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongoingTournaments.map((tournament, index: number) => (
              <TournamentCard key={index} tournament={tournament} />
            ))}
          </div>
        </section>
      )}

      {completedTournaments.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Past Tournaments</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedTournaments.map((tournament, index: number) => (
              <TournamentCard key={index} tournament={tournament} />
            ))}
          </div>
        </section>
      )}

      {tournaments.length === 0 && (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600">No tournaments scheduled yet.</p>
          <p className="text-gray-500 mt-2">Check back soon for upcoming events!</p>
        </div>
      )}
    </div>
  )
}