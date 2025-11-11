import { getGameWithSubpages, getAllContent } from '@/lib/markdown'
import { GameContent, SubpageContent } from '@/types/content'
import { Locale } from '@/lib/locale-utils'
import GameLayout from '@/components/GameLayout'
import { notFound } from 'next/navigation'

interface SubpagePageProps {
  params: Promise<{
    locale: string
    game: string
    subpage: string
  }>
}

export async function generateStaticParams() {
  const locales = ['en', 'hu']
  const params = []

  for (const locale of locales) {
    const allSubpages = await getAllContent('subpages', locale)

    for (const subpage of allSubpages) {
      if (subpage && subpage.data && subpage.data.game && subpage.data.slug) {
        params.push({
          locale,
          game: subpage.data.game,
          subpage: subpage.data.slug
        })
      }
    }
  }

  return params
}

export default async function SubpagePage({ params }: SubpagePageProps) {
  const { locale, game: gameSlug, subpage: subpageSlug } = await params
  const validLocale = locale as Locale

  const { game, subpages } = await getGameWithSubpages(gameSlug, validLocale)
  
  if (!game) {
    notFound()
  }

  // Find the specific subpage from the already-fetched subpages
  const currentSubpage = subpages.find(subpage => 
    subpage && subpage.data.slug === subpageSlug
  )
  
  if (!currentSubpage) {
    notFound()
  }

  return (
    <GameLayout 
      game={game as GameContent} 
      subpages={subpages as SubpageContent[]} 
      currentSubpage={currentSubpage as SubpageContent} 
      locale={validLocale} 
    />
  )
}