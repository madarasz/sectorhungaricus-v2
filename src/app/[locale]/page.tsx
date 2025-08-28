import { getMarkdownContent, getAllContent } from '@/lib/markdown'
import { PageContent, GameContent } from '@/types/content'
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'
import { Locale } from '@/contexts/LocaleContext'
import CTAButton from '@/components/CTAButton'

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
  const games = allGames.filter(Boolean).sort((a, b) => a.data.title.localeCompare(b.data.title))

  return (
    <div style={{backgroundColor: 'var(--background)', minHeight: '100vh'}} className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative" style={{backgroundColor: 'var(--hero-background)'}}>
        <div className="w-full max-w-[1440px] mx-auto relative responsive-padding min-h-[24rem] flex flex-col">
          <div>
            {/* Welcome Title */}
            <h1 className="max-w-[50rem] mx-auto text-center pt-[3rem] font-namdhinggo font-semibold text-[2rem] md:text-[2.5rem] xl:text-[3rem]" 
                style={{color: 'var(--hero-text)'}}>
              {homepageContent?.data.title}
            </h1>
            
            {/* Description */}
            <div className="mx-auto text-center font-poppins font-light w-full max-w-[64rem] text-[1.125rem] pt-[1rem]" 
                 style={{ color: 'var(--hero-text)' }}
                 dangerouslySetInnerHTML={{
                   __html: homepageContent?.contentHtml || ''
                 }} />
          </div>
          
          <div className="flex-1 flex items-center">
            {/* Buttons */}
            <div className="mx-auto flex flex-col sm:flex-row gap-4 md:gap-[5rem] w-full max-w-[34rem] py-2 md:py-0">
            <CTAButton 
              href={`/${locale}/calendar`}
              icon={faCalendarDays}
              text={calendarContent?.data.title || ''}
              variant="secondary"
            />
            
            <CTAButton 
              href="https://discord.com/channels/1025385427273789550/"
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
            {games.map((game) => {
              return (
                <div key={game.slug} className="w-full max-w-[373px] h-[300px] md:h-[485px]">
                  <div className="w-full h-full rounded-[15px] relative overflow-hidden" 
                       style={{
                         backgroundColor: 'var(--card-background)',
                         boxShadow: `4px 4px 5px 2px var(--card-shadow)`
                       }}>
                    {/* Background Image */}
                    {game.data.featuredImage ? (
                      <div 
                        className="w-full h-full md:h-[269px] rounded-t-[15px] bg-cover bg-center"
                        style={{backgroundImage: `url(${game.data.featuredImage})`}}
                      />
                    ) : (
                      <div className="w-full h-[180px] md:h-[269px] rounded-t-[15px] bg-gradient-to-b from-gray-400 to-gray-600" />
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
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}