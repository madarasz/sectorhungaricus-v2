import { getMarkdownContent, getAllContent, getGameWithSubpages } from '@/lib/markdown'
import { PageContent, GameContent } from '@/types/content'
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'
import { Locale } from '@/lib/locale-utils'
import CTAButton from '@/components/CTAButton'
import Link from 'next/link'

interface HomePageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateStaticParams() {
  return [{ locale: 'hu' }, { locale: 'en' }] // Generate both Hungarian and English versions
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  const validLocale = locale as Locale
  
  // Load homepage content
  const homepageContent = await getMarkdownContent('pages', 'welcome-to-sector-hungaricus', validLocale) as PageContent | null
  
  // Load calendar content for button text
  const calendarContent = await getMarkdownContent('pages', 'calendar', validLocale) as PageContent | null
  
  // Load games content and sort alphabetically  
  const allGames = await getAllContent('games', validLocale) as GameContent[]
  const sortedGames = allGames.filter(Boolean).sort((a, b) => a.data.title.localeCompare(b.data.title))

  // Get first subpage for each game for direct linking
  const gamesWithFirstSubpage = await Promise.all(
    sortedGames.map(async (game) => {
      const { subpages } = await getGameWithSubpages(game.slug, validLocale)
      const firstSubpage = subpages.length > 0 ? subpages[0] : null
      return {
        ...game,
        firstSubpage
      }
    })
  )

  return (
    <div style={{backgroundColor: 'var(--background)', minHeight: '100vh'}} className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative" style={{backgroundColor: 'var(--hero-background)'}}>
        <div className="w-full max-w-[1440px] relative responsive-padding min-h-[22rem] flex flex-col hero-section">
          <div>
            {/* Welcome Title */}
            <h1 className="max-w-[50rem] pt-[1rem] lg:pt-[3rem] text-[2rem] md:text-[2.5rem] xl:text-[3rem]">
              {homepageContent?.data.title}
            </h1>
            
            {/* Description */}
            <div className="w-full max-w-[64rem] text-[1.125rem] pt-[1rem]" 
                 dangerouslySetInnerHTML={{
                   __html: homepageContent?.contentHtml || ''
                 }} />
          </div>
          
          <div className="flex-1 flex items-center">
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-[5rem] w-full max-w-[34rem] py-2 md:py-0">
            <CTAButton 
              href={`/${locale}/calendar`}
              icon={faCalendarDays}
              text={calendarContent?.data.title || ''}
              variant="secondary"
            />
            
            <CTAButton 
              href="https://discord.gg/sX46Y83puz"
              icon={faDiscord}
              text="Discord"
              variant="primary"
            />
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-8 md:py-16">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 justify-items-center">
            {gamesWithFirstSubpage.map((game) => {
              const hasSubpages = game.firstSubpage !== null
              const gameHref = hasSubpages && game.firstSubpage
                ? `/${locale}/${game.slug}/${game.firstSubpage.data.slug}`
                : '#'
              const soonText = locale === 'hu' ? 'Nemsokára' : 'Soon'
              
              const CardContent = () => (
                <div className={`w-full h-full rounded-[15px] relative overflow-hidden transition-transform ${hasSubpages ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}`} 
                     style={{
                       backgroundColor: 'var(--card-background)',
                       boxShadow: `4px 4px 5px 2px var(--card-shadow)`
                     }}>
                  {/* Background Image */}
                  {game.data.featuredImage ? (
                    <div 
                      className={`w-full h-full md:h-[269px] rounded-t-[15px] bg-cover bg-center ${!hasSubpages ? 'grayscale opacity-60' : ''}`}
                      style={{backgroundImage: `url(${game.data.featuredImage})`}}
                    />
                  ) : (
                    <div className={`w-full h-[180px] md:h-[269px] rounded-t-[15px] bg-gradient-to-b from-gray-400 to-gray-600 ${!hasSubpages ? 'opacity-60' : ''}`} />
                  )}
                  
                  {/* Soon Banner for games without subpages */}
                  {!hasSubpages && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateY(-5rem)' }}>
                      <div className="px-12 py-4 rounded-lg text-3xl font-bold border-1 transform -rotate-12" style={{color: 'var(--hero-text)', backgroundColor: 'var(--hero-background)',}}>
                        {soonText}
                      </div>
                    </div>
                  )}
                  
                  {/* Content - Mobile: centered title only, Desktop: positioned title + description */}
                  <div className="absolute inset-0 flex items-center justify-center md:block md:left-[19px] md:top-[225px]">
                    <div className="text-center md:text-left">
                      <h3 className="font-poppins font-semibold text-[3.5rem] md:text-[2.25rem] drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] md:leading-[45px] mb-0 md:mb-2 px-4 md:px-0" 
                          style={{color: 'var(--card-title)'}}>
                        {game.data.title}
                      </h3>
                      <p className="hidden md:block font-poppins font-normal text-[16px] leading-[24px] w-[312px]" 
                         style={{color: 'var(--card-text)'}}>
                        {game.data.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
              
              return (
                <div key={game.slug} className="w-full max-w-[373px] h-[300px] md:h-[485px]">
                  {hasSubpages ? (
                    <Link href={gameHref} className="block w-full h-full">
                      <CardContent />
                    </Link>
                  ) : (
                    <div className="w-full h-full">
                      <CardContent />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}