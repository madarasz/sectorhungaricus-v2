import { ContentBlock } from '@/types/content'
import RichText from '@/components/RichText'

interface HeroBlockProps {
  block: ContentBlock & { type: 'hero_block' }
}

export default function HeroBlock({ block }: HeroBlockProps) {
  return (
    <div 
      className="hero-block p-8 rounded-lg mb-8"
      style={{ 
        background: 'var(--hero-background)',
        color: 'var(--hero-text)'
      }}
    >
      <RichText
        className="prose prose-lg max-w-none"
        style={{ color: 'var(--hero-text)' }}
        html={block.content || ''}
        storeBoxes={block.storeBoxes}
      />
    </div>
  )
}