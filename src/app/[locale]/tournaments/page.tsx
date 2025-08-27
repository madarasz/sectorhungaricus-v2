import Link from 'next/link'
import { getAllContent } from '@/lib/markdown'
import { Locale } from '@/contexts/LocaleContext'

interface TournamentsPageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateStaticParams() {
  return [{ locale: 'en' }] // Only generate English version (Hungarian is default)
}

export default async function TournamentsPage({ params }: TournamentsPageProps) {
  const { locale } = await params
  const validLocale = locale as Locale
  const tournaments = await getAllContent('tournaments', validLocale)

  const formatDate = (dateString: string, locale: Locale) => {
    return new Date(dateString).toLocaleDateString(
      locale === 'hu' ? 'hu-HU' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    )
  }

  const getStatusText = (status: string, locale: Locale) => {
    if (locale === 'hu') {
      switch (status) {
        case 'upcoming': return 'közelgő'
        case 'ongoing': return 'folyamatban'
        case 'completed': return 'befejezett'
        default: return status
      }
    }
    return status
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {validLocale === 'hu' ? 'Versenyek' : 'Tournaments'}
          </h1>
          <p className="text-xl text-gray-600">
            {validLocale === 'hu' 
              ? 'Csatlakozz közösségünk versenyeihez és mérd össze tudásodat másokkal'
              : 'Join our community tournaments and test your skills against others'
            }
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tournaments.map((tournament) => tournament && (
            <Link 
              key={tournament.slug}
              href={validLocale === 'en' ? `/en/tournaments/${tournament.slug}` : `/tournaments/${tournament.slug}`}
              className="group block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    tournament.data.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    tournament.data.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusText(tournament.data.status, validLocale)}
                  </span>
                  <span className="text-sm text-gray-500">{tournament.data.game}</span>
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
                  {tournament.data.title}
                </h2>
                
                <p className="text-sm text-gray-600 mb-4">
                  📅 {formatDate(tournament.data.date, validLocale)}
                </p>
                
                <p className="text-gray-600 text-sm line-clamp-3">
                  {tournament.data.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {tournaments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {validLocale === 'hu' ? 'Még nincsenek versenyek hozzáadva.' : 'No tournaments have been added yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}