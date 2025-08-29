import { SubpageContent } from '@/types/content'
import ContentBlockRenderer from './content-blocks/ContentBlockRenderer'

interface SubpageRendererProps {
  subpage: SubpageContent
}

export default function SubpageRenderer({ subpage }: SubpageRendererProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {!subpage.data['hide-title'] && (
        <h1 className="text-3xl font-bold mb-8">{subpage.data.title}</h1>
      )}
      
      <div className="space-y-8">
        {subpage.data.content_blocks?.map((block, index) => (
          <ContentBlockRenderer key={index} block={block} />
        ))}
      </div>
    </div>
  )
}