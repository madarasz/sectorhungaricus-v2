import { SubpageContent } from '@/types/content'
import ContentBlockRenderer from './content-blocks/ContentBlockRenderer'

interface SubpageRendererProps {
  subpage: SubpageContent
  locale: string
}

export default function SubpageRenderer({ subpage, locale }: SubpageRendererProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {!subpage.data['hide-title'] && (
        // Below lg the subpage nav already shows the title, so keep it only for screen readers
        <h1 className="sr-only lg:not-sr-only text-2xl lg:text-3xl font-bold lg:mb-8">{subpage.data.title}</h1>
      )}

      <div className="space-y-8">
        {subpage.data.content_blocks?.map((block, index) => (
          <ContentBlockRenderer key={index} block={block} locale={locale} />
        ))}
      </div>
    </div>
  )
}