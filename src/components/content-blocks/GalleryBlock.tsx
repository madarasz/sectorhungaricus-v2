'use client'

import { ContentBlock, ImageVariants } from '@/types/content'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getBestImageVariant } from '@/lib/imageVariants'

interface GalleryBlockProps {
  block: ContentBlock & { type: 'gallery_block' }
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
    document.body.style.overflow = 'hidden' // Prevent background scrolling

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, onPrevious, onNext])

  if (!isOpen || !images[currentIndex]) return null

  const currentImage = images[currentIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Semi-transparent background overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onClose}
        data-testid="gallery-overlay-background"
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10 p-2 pointer-events-auto"
        aria-label="Close gallery"
        data-testid="gallery-close-button"
      >
        ✕
      </button>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrevious()
          }}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 z-10 p-2 pointer-events-auto"
          aria-label="Previous image"
          data-testid="gallery-prev-button"
        >
          ‹
        </button>
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 z-10 p-2 pointer-events-auto"
          aria-label="Next image"
          data-testid="gallery-next-button"
        >
          ›
        </button>
      )}

      {/* Image container */}
      <div 
        className="relative w-full h-full max-w-[90vw] max-h-[80vh] flex flex-col z-10 pointer-events-none"
        data-testid="gallery-image-container"
      >
        <div className="relative flex-1 min-h-0">
          <picture>
            {/* Desktop: use desktop variant */}
            <source 
              media="(min-width: 768px)" 
              srcSet={getBestImageVariant(currentImage.variants, 'desktop') || currentImage.src}
            />
            {/* Mobile: use mobile variant */}
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
              data-testid="gallery-overlay-image"
            />
          </picture>
        </div>
        
        {/* Caption */}
        {currentImage.caption && (
          <div className="text-white text-center mt-4 px-4 py-2 flex-shrink-0" data-testid="gallery-image-caption">
            {currentImage.caption}
          </div>
        )}
      </div>

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm z-10 pointer-events-auto" data-testid="gallery-image-counter">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}

export default function GalleryBlock({ block }: GalleryBlockProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  if (!block.galleryData?.images || block.galleryData.images.length === 0) {
    return null
  }

  const images = block.galleryData.images

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

  return (
    <>
      <div className="w-4/5 mx-auto" data-testid="gallery-container">
        <div className="flex flex-wrap gap-4 justify-center">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.67rem)]"
              onClick={() => openOverlay(index)}
              data-testid={`gallery-thumbnail-${index}`}
            >
              {/* Always use thumbnail variant for grid display */}
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
  )
}