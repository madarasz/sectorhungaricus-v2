import { notFound } from 'next/navigation'
import { getMarkdownContent, getAllSlugs } from '@/lib/markdown'
import { Locale } from '@/contexts/LocaleContext'

interface GamePageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export async function generateStaticParams() {
  const slugs = getAllSlugs('games')
  const locales: Locale[] = ['en']
  
  // Generate params for English only (Hungarian is default at root)
  return slugs.flatMap((slug) =>
    locales.map((locale) => ({
      slug,
      locale,
    }))
  )
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug, locale } = await params
  const validLocale = locale as Locale
  const game = await getMarkdownContent('games', slug, validLocale)
  
  if (!game) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        {game.data.featuredImage && (
          <div className="mb-8 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Featured Image: {game.data.featuredImage}</span>
          </div>
        )}
        
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{game.data.title}</h1>
          <p className="text-xl text-gray-600">{game.data.description}</p>
        </header>

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: game.contentHtml }}
        />

        {game.data.gallery && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-4">Gallery</h3>
            <p className="text-gray-600">Gallery: {game.data.gallery}</p>
          </div>
        )}
      </article>
    </div>
  )
}