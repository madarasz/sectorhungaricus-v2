import Link from 'next/link'
import { getMarkdownContent, getAllContent } from '@/lib/markdown'
import { PageContent, GameContent } from '@/types/content'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'
import { Locale } from '@/contexts/LocaleContext'

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
        <div className="w-full max-w-[1440px] mx-auto relative responsive-padding min-h-[24rem]">
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
          
          {/* Buttons */}
          <div className="mx-auto flex flex-col md:flex-row gap-4 md:gap-[91.5px] w-full max-w-[16rem]">
            {/* Calendar Button */}
            <Link href={`/${locale}/calendar`}
                  className="flex items-center justify-center border-3 rounded-[10px] px-4 py-3 md:px-6 md:py-4 transition-all duration-300 hover:opacity-90 w-full md:w-[215px]" 
                  style={{
                    minHeight: '60px',
                    borderColor: 'var(--button-border)',
                    backgroundColor: 'var(--button-secondary)'
                  }}>
              <FontAwesomeIcon 
                icon={faCalendarDays} 
                className="text-2xl md:text-4xl mr-2 md:mr-4" 
                style={{color: 'var(--button-secondary-text)'}}
              />
              <span className="font-poppins font-medium text-[16px] md:text-[20px] leading-[24px] md:leading-[30px]" style={{color: 'var(--button-secondary-text)'}}>
                {calendarContent?.data.title}
              </span>
            </Link>
            
            {/* Discord Button */}
            <Link href="https://discord.gg/sector-hungaricus" 
                  className="flex items-center justify-center rounded-[10px] px-4 py-3 md:px-6 md:py-4 transition-all duration-300 hover:opacity-90 w-full md:w-[218px]" 
                  style={{
                    minHeight: '60px',
                    backgroundColor: 'var(--button-primary)'
                  }}>
              <FontAwesomeIcon 
                icon={faDiscord} 
                className="text-2xl md:text-4xl mr-2 md:mr-4" 
                style={{color: 'var(--button-primary-text)'}}
              />
              <span className="font-poppins font-medium text-[16px] md:text-[20px] leading-[24px] md:leading-[30px]" style={{color: 'var(--button-primary-text)'}}>
                Discord
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-8 md:py-16 lg:py-20">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-[91px] justify-items-center">
            {games.map((game) => {
              return (
                <div key={game.slug} className="w-full max-w-[373px] h-[300px] md:h-[485px]">
                  <div className="w-full h-full rounded-[15px] relative" 
                       style={{
                         backgroundColor: 'var(--card-background)',
                         boxShadow: `4px 4px 5px 2px var(--card-shadow)`
                       }}>
                    {/* Background Image */}
                    {game.data.featuredImage ? (
                      <div 
                        className="w-full h-[180px] md:h-[269px] rounded-t-[15px] bg-cover bg-center"
                        style={{backgroundImage: `url(${game.data.featuredImage})`}}
                      />
                    ) : (
                      <div className="w-full h-[180px] md:h-[269px] rounded-t-[15px] bg-gradient-to-b from-gray-400 to-gray-600" />
                    )}
                    
                    {/* Content - Mobile: centered title only, Desktop: positioned title + description */}
                    <div className="absolute inset-0 flex items-center justify-center md:block md:left-[19px] md:top-[225px]">
                      <div className="text-center md:text-left">
                        <h3 className="font-poppins font-semibold text-[24px] md:text-[36px] leading-[30px] md:leading-[45px] mb-0 md:mb-2 px-4 md:px-0" 
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