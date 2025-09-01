import { getMarkdownContent } from '@/lib/markdown'
import { PageContent } from '@/types/content'
import { Locale } from '@/lib/locale-utils'

interface AboutPageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateStaticParams() {
  return [{ locale: 'hu' }, { locale: 'en' }]
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params
  const validLocale = locale as Locale
  
  const aboutContent = await getMarkdownContent('pages', 'about-us', validLocale) as PageContent | null

  return (
    <div style={{backgroundColor: 'var(--background)', minHeight: '100vh'}}>
      <section className="py-16">
        <div className="max-w-[1440px] mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {aboutContent && (
              <div className="bg-blue-900 bg-opacity-80 lg:rounded-lg p-6 backdrop-blur-sm" style={{color: 'var(--hero-text)', backgroundColor: 'var(--hero-background)'}}>
                <h1 className="text-center font-poppins font-semibold text-[22px] leading-[60px] mb-8">
                  {aboutContent.data.hero || aboutContent.data.title}
                </h1>
                <div 
                  className="font-poppins text-base leading-relaxed prose max-w-none"
                  style={{color: 'var(--hero-text)'}}
                  dangerouslySetInnerHTML={{
                    __html: aboutContent.contentHtml || ''
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}