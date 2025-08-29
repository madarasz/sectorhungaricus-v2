import { ContentBlock } from '@/types/content'
import TextBlock from './TextBlock'
import HeroBlock from './HeroBlock'
import TwoColumnBlock from './TwoColumnBlock'

interface ContentBlockRendererProps {
  block: ContentBlock
}

export default function ContentBlockRenderer({ block }: ContentBlockRendererProps) {
  switch (block.type) {
    case 'text_block':
      return <TextBlock block={block as ContentBlock & { type: 'text_block' }} />
    case 'hero_block':
      return <HeroBlock block={block as ContentBlock & { type: 'hero_block' }} />
    case 'two_column_block':
      return <TwoColumnBlock block={block as ContentBlock & { type: 'two_column_block' }} />
    default:
      return null
  }
}