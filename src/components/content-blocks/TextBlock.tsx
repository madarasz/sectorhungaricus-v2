import { ContentBlock } from '@/types/content'

interface TextBlockProps {
  block: ContentBlock & { type: 'text_block' }
}

const STYLE_CLASSES: Record<NonNullable<ContentBlock['style']>, string> = {
  normal: 'prose max-w-none',
  bordered: 'prose max-w-none p-6 border-10 border-indigo-950 rounded-lg',
  'small-print': 'prose max-w-none text-sm italic text-gray-500',
}

export default function TextBlock({ block }: TextBlockProps) {
  const style = block.style ?? 'normal'

  return (
    <div
      className={STYLE_CLASSES[style]}
      data-testid="text-block"
      data-style={style}
      dangerouslySetInnerHTML={{ __html: block.content || '' }}
    />
  )
}
