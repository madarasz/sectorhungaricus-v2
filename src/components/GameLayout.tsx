import { GameContent, SubpageContent } from '@/types/content'
import SubpageNav from './SubpageNav'
import SubpageRenderer from './SubpageRenderer'

interface GameLayoutProps {
  game: GameContent
  subpages: SubpageContent[]
  currentSubpage: SubpageContent
  locale: string
}

export default function GameLayout({ game, subpages, currentSubpage, locale }: GameLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <SubpageNav 
        subpages={subpages} 
        currentSlug={currentSubpage?.data.slug} 
        gameSlug={game.slug}
        locale={locale} 
      />
      <main className="flex-1 px-4 pb-4" data-testid="subpage-content">
        <SubpageRenderer subpage={currentSubpage} locale={locale} />
      </main>
    </div>
  )
}