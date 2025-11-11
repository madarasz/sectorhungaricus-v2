import { getMarkdownContent, getAllContent } from '@/lib/markdown'
import { PageContent, TournamentContent, GameContent } from '@/types/content'
import { Locale } from '@/lib/locale-utils'
import Link from 'next/link'

interface CalendarPageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateStaticParams() {
  return [{ locale: 'hu' }, { locale: 'en' }]
}

export default async function CalendarPage({ params }: CalendarPageProps) {
  const { locale } = await params
  const validLocale = locale as Locale
  
  // Load calendar page content
  const calendarContent = await getMarkdownContent('pages', 'calendar', validLocale) as PageContent | null
  
  // Load all tournaments and games
  const allTournaments = await getAllContent('tournaments') as TournamentContent[]
  const allGames = await getAllContent('games', validLocale) as GameContent[]
  
  // Filter tournaments for upcoming events only
  // Support TEST_CURRENT_DATE environment variable for testing
  const now = process.env.TEST_CURRENT_DATE
    ? new Date(process.env.TEST_CURRENT_DATE)
    : new Date()
  const upcomingTournaments = allTournaments
    .filter(tournament => {
      const tournamentDate = new Date(tournament.data.date)
      return tournamentDate >= now
    })
    .sort((a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime())
  
  // Create a map of game slugs to game titles for lookup
  const gameMap = allGames.reduce((map, game) => {
    map[game.slug] = game.data.title
    return map
  }, {} as Record<string, string>)

  return (
    <div style={{backgroundColor: 'var(--background)', minHeight: '100vh'}}>
      {/* Hero Section */}
          
          {/* Upcoming Tournaments List */}
          {upcomingTournaments.length > 0 && (
            <div className="lg:max-w-4xl lg:mx-auto">
              <div className="bg-blue-900 bg-opacity-80 lg:rounded-lg p-6 backdrop-blur-sm" style={{color: 'var(--hero-text)', backgroundColor: 'var(--hero-background)',}}>
                <h1 className="text-center font-poppins font-semibold text-[22px] leading-[60px] mb-8" >
                  {calendarContent?.data.hero || calendarContent?.data.title}
                </h1>
                {upcomingTournaments.map((tournament) => {
                  const tournamentDate = new Date(tournament.data.date)
                  const formattedDate = `${tournamentDate.getFullYear()}.${String(tournamentDate.getMonth() + 1).padStart(2, '0')}.${String(tournamentDate.getDate()).padStart(2, '0')}`
                  const gameName = gameMap[tournament.data.game] || tournament.data.game
                  
                  return (
                      <div key={tournament.slug} className="py-2">
                        <div className="text-white font-poppins text-center">
                          {formattedDate} - {gameName} {validLocale == "hu" ? "verseny" : "tournament"}: {tournament.data.url ? (
                            <Link 
                              href={tournament.data.url}
                              className="text-blue-200 hover:text-white underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {tournament.data.title}
                            </Link>
                          ) : (
                            <span>
                              {tournament.data.title}
                            </span>
                          )}
                        </div>
                      </div>
                  )
                })}
              </div>
            </div>
          )}

      {/* Main Content Section */}
      <section className="py-16">
        <div className="max-w-[1440px] mx-auto px-4">
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Google Calendar Embed */}
            <div className="h-[600px]">
              <iframe
                src={`https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Europe%2FBudapest&showPrint=0&mode=AGENDA&src=OGY0Njg2NTg4YjM3NWE0ZTg0YWE3ZTA1ZjRhYjZhNDY0ZWQxMGVlZGQ4NjZhYTU4YmQ3ZjIxNjRmMTkxNjEyMUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23616161&hl=${validLocale}`}
                style={{ border: 0 }}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                title="Google Calendar"
              />
            </div>
            
            {/* Calendar Page Body Content */}
            <div className="prose max-w-none">
              <div 
                className="font-poppins text-base leading-relaxed"
                style={{color: 'var(--text)'}}
                dangerouslySetInnerHTML={{
                  __html: calendarContent?.contentHtml || ''
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}