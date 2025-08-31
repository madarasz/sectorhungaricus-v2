import { ImageVariants } from '@/types/content'
import path from 'path'

/**
 * Generate image variant paths from an original image path
 */
export function generateImageVariants(originalPath: string): ImageVariants {
  if (!originalPath) {
    return {}
  }

  const parsedPath = path.parse(originalPath)
  const { dir, name, ext } = parsedPath

  return {
    original: originalPath,
    thumb: path.join(dir, `${name}-thumb${ext}`).replace(/\\/g, '/'),
    mobile: path.join(dir, `${name}-mobile${ext}`).replace(/\\/g, '/'),
    desktop: path.join(dir, `${name}-desktop${ext}`).replace(/\\/g, '/'),
  }
}

/**
 * Check if image variants exist (for fallback purposes)
 */
export function hasImageVariants(variants: ImageVariants | undefined): boolean {
  return !!(variants?.thumb || variants?.mobile || variants?.desktop)
}

/**
 * Get the best image variant for a given context
 */
export function getBestImageVariant(
  variants: ImageVariants | undefined,
  context: 'thumbnail' | 'mobile' | 'desktop' | 'original'
): string | undefined {
  if (!variants) return undefined

  switch (context) {
    case 'thumbnail':
      return variants.thumb || variants.mobile || variants.original
    case 'mobile':
      return variants.mobile || variants.desktop || variants.original
    case 'desktop':
      return variants.desktop || variants.original
    case 'original':
    default:
      return variants.original
  }
}

/**
 * Get responsive image srcSet for different screen sizes
 */
export function getResponsiveSrcSet(variants: ImageVariants | undefined): string {
  if (!variants) return ''

  const srcSetEntries: string[] = []

  if (variants.thumb) {
    srcSetEntries.push(`${variants.thumb} 400w`)
  }
  if (variants.mobile) {
    srcSetEntries.push(`${variants.mobile} 800w`)
  }
  if (variants.desktop) {
    srcSetEntries.push(`${variants.desktop} 1200w`)
  }

  return srcSetEntries.join(', ')
}