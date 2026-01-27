'use client'

import { ContentBlock } from '@/types/content'
import GalleryBlock from './GalleryBlock'

interface ArtistBlockProps {
  block: ContentBlock & { type: 'artist_block' }
  locale: string
}

const commissionLabels: Record<string, string> = {
  en: 'does commissions',
  hu: 'bérfestést vállal'
}

export default function ArtistBlock({ block, locale }: ArtistBlockProps) {
  if (!block.artistData) {
    return null
  }

  const { name, portfolio, does_commission, galleryData } = block.artistData
  const images = galleryData?.images || []
  const commissionLabel = commissionLabels[locale] || commissionLabels.en

  return (
    <div data-testid="artist-block">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-xl font-semibold" data-testid="artist-name">
          @{name}
        </span>

        {does_commission && (
          <span
            className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded"
            data-testid="artist-commission-badge"
          >
            {commissionLabel}
          </span>
        )}

        {portfolio && (
          <a
            href={portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto text-sm text-blue-600 hover:underline"
            data-testid="artist-portfolio-link"
          >
            {portfolio}
          </a>
        )}
      </div>

      {images.length > 0 && (
        <GalleryBlock images={images} />
      )}
    </div>
  )
}
