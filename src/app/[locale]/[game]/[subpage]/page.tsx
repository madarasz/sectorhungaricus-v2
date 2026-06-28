import { getGameWithSubpages, getAllContent } from '@/lib/markdown'
import { GameContent, SubpageContent } from '@/types/content'
import { Locale } from '@/lib/locale-utils'
import { buildPageMetadata, composeTitle } from '@/lib/seo'
import { Metadata } from 'next'
import GameLayout from '@/components/GameLayout'
import { notFound } from 'next/navigation'

interface SubpagePageProps {
  params: Promise<{
    locale: string
    game: string
    subpage: string
  }>
}

export async function generateMetadata({ params }: SubpagePageProps): Promise<Metadata> {
  const { locale, game: gameSlug, subpage: subpageSlug } = await params
  const validLocale = locale as Locale

  const { game, subpages } = await getGameWithSubpages(gameSlug, validLocale)
  const current = subpages.find(
    (s) => s !== null && s.data.slug === subpageSlug
  ) as SubpageContent | undefined

  if (!game || !current) {
    return {}
  }

  const g = game as GameContent

  return buildPageMetadata({
    locale: validLocale,
    path: `/${gameSlug}/${subpageSlug}/`,
    title: composeTitle(current.data.metaTitle, current.data.title, g.data.title),
    description: current.data.metaDescription,
    image: g.data.featuredImage,
  })
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