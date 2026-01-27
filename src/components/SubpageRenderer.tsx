'use client'

import type { SubpageContent, ContentBlock } from '@/types/content'
import ContentBlockRenderer from './content-blocks/ContentBlockRenderer'
import { VotingProvider } from '@/contexts/VotingContext'
import SortableArtistList from './SortableArtistList'

interface SubpageRendererProps {
  subpage: SubpageContent
  locale: string
}

function SubpageContentWithVoting({ subpage, locale }: SubpageRendererProps) {
  const blocks = subpage.data.content_blocks || []

  // Separate artist blocks from other blocks
  const artistBlocks: ContentBlock[] = []
  const otherBlocks: { block: ContentBlock; index: number }[] = []

  blocks.forEach((block, index) => {
    if (block.type === 'artist_block') {
      artistBlocks.push(block)
    } else {
      otherBlocks.push({ block, index })
    }
  })

  const hasArtists = artistBlocks.length > 0

  return (
    <div className="max-w-4xl mx-auto">
      {!subpage.data['hide-title'] && (
        <h1 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-8">{subpage.data.title}</h1>
      )}

      <div className="space-y-8">
        {/* Render non-artist blocks in their original order */}
        {otherBlocks.map(({ block, index }) => (
          <ContentBlockRenderer key={index} block={block} locale={locale} />
        ))}

        {/* Render artist blocks sorted by votes */}
        {hasArtists && (
          <SortableArtistList artistBlocks={artistBlocks} locale={locale} />
        )}
      </div>
    </div>
  )
}

export default function SubpageRenderer({ subpage, locale }: SubpageRendererProps) {
  const blocks = subpage.data.content_blocks || []
  const hasArtists = blocks.some(block => block.type === 'artist_block')

  // Wrap with VotingProvider only when artist blocks are present
  if (hasArtists) {
    return (
      <VotingProvider>
        <SubpageContentWithVoting subpage={subpage} locale={locale} />
      </VotingProvider>
    )
  }

  // No artists - render without provider
  return (
    <div className="max-w-4xl mx-auto">
      {!subpage.data['hide-title'] && (
        <h1 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-8">{subpage.data.title}</h1>
      )}

      <div className="space-y-8">
        {blocks.map((block, index) => (
          <ContentBlockRenderer key={index} block={block} locale={locale} />
        ))}
      </div>
    </div>
  )
}