'use client'

import { ContentBlock, ImageVariants } from '@/types/content'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getBestImageVariant } from '@/lib/imageVariants'

interface GalleryImage {
  src: string
  variants?: ImageVariants
  caption?: string
  alt: string
}

interface GalleryBlockProps {
  block?: ContentBlock & { type: 'gallery_block' }
  images?: GalleryImage[]
  testIdPrefix?: string
}

interface ImageOverlayProps {
  images: GalleryImage[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  testIdPrefix: string
}

function ImageOverlay({ images, currentIndex, isOpen, onClose, onPrevious, onNext, testIdPrefix }: ImageOverlayProps) {
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
        data-testid={`${testIdPrefix}-overlay-background`}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10 p-2 pointer-events-auto"
        aria-label="Close gallery"
        data-testid={`${testIdPrefix}-close-button`}
      >
        ✕
      </button>

      {/* Desktop navigation buttons - on sides */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPrevious()
            }}
            className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 z-10 p-2 pointer-events-auto"
            aria-label="Previous image"
            data-testid={`${testIdPrefix}-prev-button-desktop`}
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 z-10 p-2 pointer-events-auto"
            aria-label="Next image"
            data-testid={`${testIdPrefix}-next-button-desktop`}
          >
            ›
          </button>
        </>
      )}

      {/* Main content container */}
      <div
        className="relative z-10 pointer-events-none flex flex-col items-center justify-center"
        style={{ width: 'calc(100vw - 2rem)', maxWidth: '90vw' }}
        data-testid={`${testIdPrefix}-image-container`}
      >
        {/* Image wrapper - fits image naturally without cropping */}
        <div className="flex items-center justify-center w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getBestImageVariant(currentImage.variants, 'original') || getBestImageVariant(currentImage.variants, 'desktop') || currentImage.src}
            alt={currentImage.alt}
            style={{
              maxWidth: 'calc(100vw - 2rem)',
              maxHeight: 'calc(100vh - 180px)',
              width: 'auto',
              height: 'auto',
            }}
            className="pointer-events-none"
            data-testid={`${testIdPrefix}-overlay-image`}
          />
        </div>

        {/* Mobile navigation buttons - below image */}
        {images.length > 1 && (
          <div className="flex md:hidden items-center justify-center gap-8 mt-4 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPrevious()
              }}
              className="text-white text-4xl hover:text-gray-300 p-3 bg-black/50 rounded-full min-w-[52px] min-h-[52px] flex items-center justify-center"
              aria-label="Previous image"
              data-testid={`${testIdPrefix}-prev-button`}
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onNext()
              }}
              className="text-white text-4xl hover:text-gray-300 p-3 bg-black/50 rounded-full min-w-[52px] min-h-[52px] flex items-center justify-center"
              aria-label="Next image"
              data-testid={`${testIdPrefix}-next-button`}
            >
              ›
            </button>
          </div>
        )}

        {/* Caption */}
        {currentImage.caption && (
          <div className="text-white text-center mt-4 px-4 py-2 flex-shrink-0" data-testid={`${testIdPrefix}-image-caption`}>
            {currentImage.caption}
          </div>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="text-white text-sm mt-2 pointer-events-auto" data-testid={`${testIdPrefix}-image-counter`}>
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  )
}

export default function GalleryBlock({ block, images: imagesProp, testIdPrefix = 'gallery' }: GalleryBlockProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  // Use images from props if provided, otherwise from block
  const images = imagesProp || block?.galleryData?.images

  if (!images || images.length === 0) {
    return null
  }

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
      <div className="w-4/5 mx-auto" data-testid={`${testIdPrefix}-container`}>
        <div className="flex flex-wrap gap-4 justify-center">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.67rem)]"
              onClick={() => openOverlay(index)}
              data-testid={`${testIdPrefix}-thumbnail-${index}`}
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
        testIdPrefix={testIdPrefix}
      />
    </>
  )
}