import Link from 'next/link'
import { getMarkdownContent, getAllContent } from '@/lib/markdown'
import { PageContent, GameContent } from '@/types/content'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'

export default async function Home() {
  // Load homepage content (Hungarian is the primary language)
  const homepageContent = await getMarkdownContent('pages', 'welcome-to-sector-hungaricus', 'hu') as PageContent | null
  
  // Load games content and sort alphabetically
  const allGames = await getAllContent('games', 'hu') as GameContent[]
  const games = allGames.sort((a, b) => a.data.title.localeCompare(b.data.title))
  return (
    <div style={{backgroundColor: '#EAE9E9', minHeight: '100vh', overflowX: 'auto'}}>
      {/* Hero Section */}
      <section className="relative" style={{backgroundColor: '#1A1251', height: '390px'}}>
        <div className="w-[1440px] mx-auto relative h-full">
          {/* Welcome Title */}
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-center font-namdhinggo font-semibold text-[48px] leading-[60px] text-[#EAE9E9]" 
              style={{width: '693px', top: '48px'}}>
            {homepageContent?.data.title}
          </h1>
          
          {/* Description */}
          {homepageContent?.contentHtml && (
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center font-poppins font-light text-[18px] leading-[27px] text-[#EAE9E9]" 
                 style={{width: '1030px', top: '158px'}}
                 dangerouslySetInnerHTML={{
                   __html: homepageContent.contentHtml
                 }} />
          )}
          
          {/* Buttons */}
          <div className="absolute flex" style={{left: '449.5px', top: '279.5px'}}>
            {/* Calendar Button */}
            <div className="flex items-center border-3 border-[#EAE9E9] rounded-[10px] px-6 py-4 mr-[91.5px]" 
                  style={{width: '215px', height: '71px'}}>
              <FontAwesomeIcon 
                icon={faCalendarDays} 
                className="text-4xl mr-4 text-[#EAE9E9]" 
              />
              <span className="font-poppins font-medium text-[20px] leading-[30px] text-[#EAE9E9]">Naptár</span>
            </div>
            
            {/* Discord Button */}
            <Link href="https://discord.gg/sector-hungaricus" className="flex items-center bg-[#EAE9E9] rounded-[10px] px-6 py-4 hover:bg-white transition-colors" 
                  style={{width: '218px', height: '74px'}}>
              <FontAwesomeIcon 
                icon={faDiscord} 
                className="text-4xl mr-4 text-[#1A1A1A]" 
              />
              <span className="font-poppins font-medium text-[20px] leading-[30px] text-[#1A1A1A]">Discord</span>
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
                  <div className="w-full h-full bg-[#DFDFDF] rounded-[15px] shadow-[4px_4px_5px_2px_rgba(0,0,0,0.25)] relative">
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
                      <h3 className="font-poppins font-semibold text-[36px] leading-[45px] text-[#EAE9E9] mb-2">
                        {game.data.title}
                      </h3>
                      <p className="font-poppins font-normal text-[16px] leading-[24px] text-[#1A1A1A] w-[312px]">
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
