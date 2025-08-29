import { ContentBlock } from '@/types/content'

interface HeroBlockProps {
  block: ContentBlock & { type: 'hero_block' }
}

export default function HeroBlock({ block }: HeroBlockProps) {
  return (
    <div className="hero-block bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg mb-8">
      <div 
        className="prose prose-lg max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: block.content || '' }} 
      />
    </div>
  )
}