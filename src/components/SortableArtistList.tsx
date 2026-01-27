'use client'

import { useMemo } from 'react'
import { useVotingContext } from '@/contexts/VotingContext'
import { ContentBlock } from '@/types/content'
import ContentBlockRenderer from './content-blocks/ContentBlockRenderer'

interface SortableArtistListProps {
  artistBlocks: ContentBlock[]
  locale: string
}

export default function SortableArtistList({ artistBlocks, locale }: SortableArtistListProps) {
  const { votes, isLoading } = useVotingContext()

  const sortedBlocks = useMemo(() => {
    if (isLoading) return artistBlocks

    return [...artistBlocks].sort((a, b) => {
      const aId = a.artist || ''
      const bId = b.artist || ''
      const aVotes = votes[aId] || 0
      const bVotes = votes[bId] || 0
      return bVotes - aVotes // descending order
    })
  }, [artistBlocks, votes, isLoading])

  return (
    <div className="space-y-8" data-testid="sortable-artist-list">
      {sortedBlocks.map((block, index) => (
        <ContentBlockRenderer
          key={block.artist || index}
          block={block}
          locale={locale}
        />
      ))}
    </div>
  )
}
