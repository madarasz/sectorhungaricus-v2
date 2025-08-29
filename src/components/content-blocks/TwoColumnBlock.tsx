import { ContentBlock } from '@/types/content'

interface TwoColumnBlockProps {
  block: ContentBlock & { type: 'two_column_block' }
}

export default function TwoColumnBlock({ block }: TwoColumnBlockProps) {
  return (
    <div className="two-column-block" >
      {block.block_title && !block.hide_title && (
        <h3 className="text-2xl font-bold mb-6">{block.block_title}</h3>
      )}
      <div className="grid lg:grid-cols-2 gap-4">
        <div 
          className="p-8 rounded-lg prose max-w-none"
          style={{ 
            background: 'var(--hero-background)',
            color: 'var(--hero-text)'
          }}
          dangerouslySetInnerHTML={{ __html: block.left_content || '' }} 
        />
        <div 
          className="p-8 rounded-lg prose max-w-none"
          style={{ 
            background: 'var(--hero-background)',
            color: 'var(--hero-text)'
          }}
          dangerouslySetInnerHTML={{ __html: block.right_content || '' }} 
        />
      </div>
    </div>
  )
}