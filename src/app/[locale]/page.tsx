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
    <div style={{backgroundColor: 'var(--background)', minHeight: '100vh', overflowX: 'auto'}} className="transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative transition-colors duration-300" style={{backgroundColor: 'var(--hero-background)', height: '390px'}}>
        <div className="w-[1440px] mx-auto relative h-full">
          {/* Welcome Title */}
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-center font-namdhinggo font-semibold text-[48px] leading-[60px] transition-colors duration-300" 
              style={{width: '693px', top: '48px', color: 'var(--hero-text)'}}>
            {homepageContent?.data.title}
          </h1>
          
          {/* Description */}
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center font-poppins font-light text-[18px] leading-[27px] transition-colors duration-300" 
               style={{width: '1030px', top: '158px', color: 'var(--hero-text)'}}
               dangerouslySetInnerHTML={{
                 __html: homepageContent?.contentHtml || ''
               }} />
          
          {/* Buttons */}
          <div className="absolute flex" style={{left: '449.5px', top: '279.5px'}}>
            {/* Calendar Button */}
            <Link href={`/${locale}/calendar`}
                  className="flex items-center border-3 rounded-[10px] px-6 py-4 mr-[91.5px] transition-all duration-300 hover:opacity-90" 
                  style={{
                    width: '215px', 
                    height: '71px', 
                    borderColor: 'var(--button-border)',
                    backgroundColor: 'var(--button-secondary)'
                  }}>
              <FontAwesomeIcon 
                icon={faCalendarDays} 
                className="text-4xl mr-4 transition-colors duration-300" 
                style={{color: 'var(--button-secondary-text)'}}
              />
              <span className="font-poppins font-medium text-[20px] leading-[30px] transition-colors duration-300" style={{color: 'var(--button-secondary-text)'}}>
                {calendarContent?.data.title}
              </span>
            </Link>
            
            {/* Discord Button */}
            <Link href="https://discord.gg/sector-hungaricus" 
                  className="flex items-center rounded-[10px] px-6 py-4 transition-all duration-300 hover:opacity-90" 
                  style={{
                    width: '218px', 
                    height: '74px',
                    backgroundColor: 'var(--button-primary)'
                  }}>
              <FontAwesomeIcon 
                icon={faDiscord} 
                className="text-4xl mr-4 transition-colors duration-300" 
                style={{color: 'var(--button-primary-text)'}}
              />
              <span className="font-poppins font-medium text-[20px] leading-[30px] transition-colors duration-300" style={{color: 'var(--button-primary-text)'}}>
                Discord
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section style={{paddingTop: '79px'}}>
        <div className="w-[1440px] mx-auto">
          <div className="flex justify-center gap-[91px]">
            {games.map((game) => {
              return (
                <div key={game.slug} className="w-[373px] h-[485px]">
                  <div className="w-full h-full rounded-[15px] relative transition-all duration-300" 
                       style={{
                         backgroundColor: 'var(--card-background)',
                         boxShadow: `4px 4px 5px 2px var(--card-shadow)`
                       }}>
                    {/* Background Image */}
                    {game.data.featuredImage ? (
                      <div 
                        className="w-full h-[269px] rounded-t-[15px] bg-cover bg-center"
                        style={{backgroundImage: `url(${game.data.featuredImage})`}}
                      />
                    ) : (
                      <div className="w-full h-[269px] rounded-t-[15px] bg-gradient-to-b from-gray-400 to-gray-600" />
                    )}
                    
                    {/* Content */}
                    <div className="absolute left-[19px] top-[225px]">
                      <h3 className="font-poppins font-semibold text-[36px] leading-[45px] mb-2 transition-colors duration-300" style={{color: 'var(--card-title)'}}>
                        {game.data.title}
                      </h3>
                      <p className="font-poppins font-normal text-[16px] leading-[24px] w-[312px] transition-colors duration-300" style={{color: 'var(--card-text)'}}>
                        {game.data.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div style={{height: '485px'}}></div>
      </section>
    </div>
  )
}