import Link from 'next/link'
import { getMarkdownContent, getAllContent } from '@/lib/markdown'
import { PageContent, GameContent } from '@/types/content'

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
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-center font-poppins font-semibold text-[48px] leading-[60px] text-[#EAE9E9]" 
              style={{width: '693px', top: '48px'}}>
            {homepageContent?.data.title || 'Üdvözlünk a Sector Hungaricuson!'}
          </h1>
          
          {/* Description */}
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center font-poppins font-light text-[18px] leading-[27px] text-[#EAE9E9]" 
               style={{width: '1030px', top: '158px'}}
               dangerouslySetInnerHTML={{
                 __html: homepageContent?.contentHtml || 'Közösségünk Magyarország legnagyobb wargame skirmish társasága. Önszerveződő közösség vagyunk, független üzletektől és kluboktól.'
               }} />
          
          {/* Buttons */}
          <div className="absolute flex" style={{left: '449.5px', top: '279.5px'}}>
            {/* Calendar Button */}
            <Link href="/tournaments" className="flex items-center border-3 border-[#EAE9E9] rounded-[10px] px-6 py-4 hover:bg-[#EAE9E9] hover:text-[#1A1251] transition-colors group mr-[91.5px]" 
                  style={{width: '215px', height: '71px'}}>
              <svg className="w-11 h-11 mr-4" viewBox="0 0 45 45" fill="none">
                <path className="fill-[#EAE9E9] group-hover:fill-[#1A1251]" d="M37.5 7.5h-3.75V3.75c0-1.03125-.84375-1.875-1.875-1.875S30 2.71875 30 3.75V7.5H15V3.75C15 2.71875 14.1562 1.875 13.125 1.875S11.25 2.71875 11.25 3.75V7.5H7.5C3.375 7.5 0 10.875 0 15v22.5C0 41.625 3.375 45 7.5 45h30c4.125 0 7.5-3.375 7.5-7.5V15C45 10.875 41.625 7.5 37.5 7.5zM37.5 37.5h-30V18.75h30V37.5z"/>
              </svg>
              <span className="font-poppins font-medium text-[20px] leading-[30px] text-[#EAE9E9] group-hover:text-[#1A1251]">Naptár</span>
            </Link>
            
            {/* Discord Button */}
            <Link href="https://discord.gg/sector-hungaricus" className="flex items-center bg-[#EAE9E9] rounded-[10px] px-6 py-4 hover:bg-white transition-colors" 
                  style={{width: '218px', height: '74px'}}>
              <svg className="w-11 h-11 mr-4" viewBox="0 0 45 45" fill="none">
                <path fill="#1A1A1A" d="M38.25 7.5C35.7 6.1875 32.9625 5.25 30.0375 4.7625C29.7 5.4 29.3625 6.1875 29.1375 6.825C26.025 6.375 22.95 6.375 19.8375 6.825C19.6125 6.1875 19.275 5.4 18.9375 4.7625C16.0125 5.25 13.275 6.1875 10.725 7.5C5.0625 16.35 3.6 24.975 4.425 33.45C7.95 36.075 11.325 37.6875 14.625 38.775C15.4125 37.6875 16.125 36.525 16.7625 35.2875C15.6375 34.875 14.5875 34.3875 13.575 33.8625C13.8375 33.675 14.1 33.4875 14.325 33.3C21.4125 36.675 29.2875 36.675 36.225 33.3C36.45 33.4875 36.7125 33.675 36.975 33.8625C35.9625 34.3875 34.9125 34.875 33.7875 35.2875C34.425 36.525 35.1375 37.6875 35.925 38.775C39.225 37.6875 42.6 36.075 46.125 33.45C47.1 23.775 44.475 15.225 38.25 7.5ZM15.975 28.6875C13.6875 28.6875 11.8125 26.625 11.8125 24.075C11.8125 21.525 13.6125 19.4625 15.975 19.4625C18.3375 19.4625 20.2125 21.525 20.1375 24.075C20.1375 26.625 18.3375 28.6875 15.975 28.6875ZM29.025 28.6875C26.7375 28.6875 24.8625 26.625 24.8625 24.075C24.8625 21.525 26.6625 19.4625 29.025 19.4625C31.3875 19.4625 33.2625 21.525 33.1875 24.075C33.1875 26.625 31.3875 28.6875 29.025 28.6875Z"/>
              </svg>
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
