import { GameContent, SubpageContent } from '@/types/content'
import SubpageNav from './SubpageNav'
import SubpageRenderer from './SubpageRenderer'

interface GameLayoutProps {
  game: GameContent
  subpages: SubpageContent[]
  currentSubpage: SubpageContent | null
  locale: string
}

export default function GameLayout({ game, subpages, currentSubpage, locale }: GameLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <SubpageNav 
        subpages={subpages} 
        currentSlug={currentSubpage?.data.slug} 
        gameSlug={game.slug}
        locale={locale} 
      />
      <main className="flex-1 p-8" data-testid="subpage-content">
        {currentSubpage ? (
          <SubpageRenderer subpage={currentSubpage} />
        ) : (
          <div className="max-w-4xl mx-auto text-center py-16">
            <h1 className="text-4xl font-bold mb-4">{game.data.title}</h1>
            <p className="text-xl text-gray-600">
              Contents coming soon...
            </p>
          </div>
        )}
      </main>
    </div>
  )
}