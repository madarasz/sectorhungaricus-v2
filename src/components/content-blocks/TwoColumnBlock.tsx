import { ContentBlock } from '@/types/content'

interface TwoColumnBlockProps {
  block: ContentBlock & { type: 'two_column_block' }
}

export default function TwoColumnBlock({ block }: TwoColumnBlockProps) {
  return (
    <div className="two-column-block mb-8">
      {block.block_title && (
        <h3 className="text-2xl font-bold mb-6">{block.block_title}</h3>
      )}
      <div className="grid md:grid-cols-2 gap-8">
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: block.left_content || '' }} 
        />
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: block.right_content || '' }} 
        />
      </div>
    </div>
  )
}