import { ContentBlock } from '@/types/content'
import TextBlock from './TextBlock'
import HeroBlock from './HeroBlock'
import TwoColumnBlock from './TwoColumnBlock'
import GalleryBlock from './GalleryBlock'
import PageReferenceBlock from './PageReferenceBlock'

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
    case 'gallery_block':
      return <GalleryBlock block={block as ContentBlock & { type: 'gallery_block' }} />
    case 'page_reference_block':
      return <PageReferenceBlock block={block as ContentBlock & { type: 'page_reference_block' }} />
    default:
      return null
  }
}