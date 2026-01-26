'use client'

import { ContentBlock, ImageVariants } from '@/types/content'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getBestImageVariant } from '@/lib/imageVariants'

interface ArtistBlockProps {
  block: ContentBlock & { type: 'artist_block' }
  locale: string
}

interface ImageOverlayProps {
  images: Array<{
    src: string
    variants?: ImageVariants
    caption?: string
    alt: string
  }>
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}

function ImageOverlay({ images, currentIndex, isOpen, onClose, onPrevious, onNext }: ImageOverlayProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          onPrevious()
          break
        case 'ArrowRight':
          onNext()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, onPrevious, onNext])

  if (!isOpen || !images[currentIndex]) return null

  const currentImage = images[currentIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onClose}
        data-testid="artist-gallery-overlay-background"
      />

      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10 p-2 pointer-events-auto"
        aria-label="Close gallery"
        data-testid="artist-gallery-close-button"
      >
        ✕
      </button>

      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrevious()
          }}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 z-10 p-2 pointer-events-auto"
          aria-label="Previous image"
          data-testid="artist-gallery-prev-button"
        >
          ‹
        </button>
      )}

      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 z-10 p-2 pointer-events-auto"
          aria-label="Next image"
          data-testid="artist-gallery-next-button"
        >
          ›
        </button>
      )}

      <div
        className="relative w-full h-full max-w-[90vw] max-h-[80vh] flex flex-col z-10 pointer-events-none"
        data-testid="artist-gallery-image-container"
      >
        <div className="relative flex-1 min-h-0">
          <picture>
            <source
              media="(min-width: 768px)"
              srcSet={getBestImageVariant(currentImage.variants, 'desktop') || currentImage.src}
            />
            <source
              media="(max-width: 767px)"
              srcSet={getBestImageVariant(currentImage.variants, 'mobile') || currentImage.src}
            />
            <Image
              src={getBestImageVariant(currentImage.variants, 'desktop') || currentImage.src}
              alt={currentImage.alt}
              fill
              className="object-contain pointer-events-none"
              sizes="90vw"
              data-testid="artist-gallery-overlay-image"
            />
          </picture>
        </div>

        {currentImage.caption && (
          <div className="text-white text-center mt-4 px-4 py-2 flex-shrink-0" data-testid="artist-gallery-image-caption">
            {currentImage.caption}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm z-10 pointer-events-auto" data-testid="artist-gallery-image-counter">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}

const commissionLabels: Record<string, string> = {
  en: 'does commissions',
  hu: 'bérfestést vállal'
}

export default function ArtistBlock({ block, locale }: ArtistBlockProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  if (!block.artistData) {
    return null
  }

  const { name, portfolio, does_commission, galleryData } = block.artistData
  const images = galleryData?.images || []

  const openOverlay = (index: number) => {
    setSelectedImageIndex(index)
  }

  const closeOverlay = () => {
    setSelectedImageIndex(null)
  }

  const goToPrevious = () => {
    if (selectedImageIndex !== null) {
      const newIndex = selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1
      setSelectedImageIndex(newIndex)
    }
  }

  const goToNext = () => {
    if (selectedImageIndex !== null) {
      const newIndex = selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1
      setSelectedImageIndex(newIndex)
    }
  }

  const commissionLabel = commissionLabels[locale] || commissionLabels.en

  return (
    <div data-testid="artist-block">
      <div className="flex items-center gap-3 mb-4">
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
            className="text-sm text-blue-600 hover:underline"
            data-testid="artist-portfolio-link"
          >
            {portfolio}
          </a>
        )}
      </div>

      {images.length > 0 && (
        <>
          <div className="w-4/5 mx-auto" data-testid="artist-gallery-container">
            <div className="flex flex-wrap gap-4 justify-center">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.67rem)]"
                  onClick={() => openOverlay(index)}
                  data-testid={`artist-gallery-thumbnail-${index}`}
                >
                  <Image
                    src={getBestImageVariant(image.variants, 'thumbnail') || image.src}
                    alt={image.alt}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>

          <ImageOverlay
            images={images}
            currentIndex={selectedImageIndex ?? 0}
            isOpen={selectedImageIndex !== null}
            onClose={closeOverlay}
            onPrevious={goToPrevious}
            onNext={goToNext}
          />
        </>
      )}
    </div>
  )
}
