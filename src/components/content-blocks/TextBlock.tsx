import { ContentBlock } from '@/types/content'

interface TextBlockProps {
  block: ContentBlock & { type: 'text_block' }
}

export default function TextBlock({ block }: TextBlockProps) {
  const className = block.style === 'bordered' 
    ? 'prose max-w-none p-6 border border-gray-300 rounded-lg'
    : 'prose max-w-none'

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: block.content || '' }} 
    />
  )
}