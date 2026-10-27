import Image from 'next/image'
import { ImageVariants, KillTeam } from '@/types/content'
import { getBestImageVariant } from '@/lib/imageVariants'

// warhammer.com shop product photos have a ~3% white border around the tiles
const CATALOG_PHOTO = /^https:\/\/www\.warhammer\.com\/app\/resources\/catalog\/product\//
// 360° spin frames show one small model with much empty space around it, so zoom in
const SPIN_PHOTO = /^https:\/\/www\.warhammer\.com\/app\/resources\/catalog\/product\/threeSixty\//
const SPIN_ZOOM_CLASS_NAME = 'scale-[1.35] origin-[50%_55%]'
// Teams (slugs) whose spin frame shows an even smaller model, with their own zoom.
// Write full class names: Tailwind only finds classes that appear literally in the code.
const STRONG_SPIN_ZOOM = 'scale-[1.6] origin-[50%_55%]'
const TEAM_SPIN_ZOOM_CLASS_NAMES: Record<string, string> = {
  'deathwatch': 'scale-[1.9] origin-[50%_68%]',
  'hearthkyn-salvagers': STRONG_SPIN_ZOOM,
  'tempestus-aquilons': STRONG_SPIN_ZOOM,
  'wolf-scouts': STRONG_SPIN_ZOOM,
  'xv26-stealth-battlesuits': STRONG_SPIN_ZOOM,
}

type ImageContext = 'thumbnail' | 'mobile'

interface TeamImagePairProps {
  /** Classes of the box when both images show */
  className: string
  sizes: string
  catalogFrameClassName: string
}

interface TeamImageProps {
  team: KillTeam
  context: ImageContext
  sizes: string
  className: string
  imageClassName?: string
  /** Frame that extends past the box to crop the white border of shop product photos */
  catalogFrameClassName: string
  /** When set and the team has a second image, both images show next to each other */
  pair?: TeamImagePairProps
  children?: React.ReactNode
}

function imageSrc(image: string | undefined, variants: ImageVariants | undefined, context: ImageContext) {
  return image ? getBestImageVariant(variants, context) || image : undefined
}

function spinZoomClassName(src: string, slug: string) {
  if (!SPIN_PHOTO.test(src)) return ''
  return TEAM_SPIN_ZOOM_CLASS_NAMES[slug] ?? SPIN_ZOOM_CLASS_NAME
}

function FramedImage({ src, slug, sizes, imageClassName, catalogFrameClassName }: { src: string; slug: string; sizes: string; imageClassName?: string; catalogFrameClassName: string }) {
  const frameClassName = CATALOG_PHOTO.test(src) ? catalogFrameClassName : 'inset-0'
  const zoomClassName = spinZoomClassName(src, slug)

  return (
    <div className={`absolute ${frameClassName}`}>
      <Image src={src} alt="" fill className={`object-cover ${zoomClassName} ${imageClassName ?? ''}`} sizes={sizes} />
    </div>
  )
}

export default function TeamImage({ team, context, sizes, className, imageClassName, catalogFrameClassName, pair, children }: TeamImageProps) {
  const src = imageSrc(team.image, team.imageVariants, context)
  const secondSrc = imageSrc(team.second_image, team.secondImageVariants, context)

  if (pair && src && secondSrc) {
    return (
      <div className={`relative grid grid-cols-2 hero-colors ${pair.className}`}>
        {[src, secondSrc].map((pairSrc) => (
          <div key={pairSrc} className="relative overflow-hidden">
            <FramedImage src={pairSrc} slug={team.slug} sizes={pair.sizes} catalogFrameClassName={pair.catalogFrameClassName} />
          </div>
        ))}
        {children}
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden hero-colors ${className}`}>
      {src && <FramedImage src={src} slug={team.slug} sizes={sizes} imageClassName={imageClassName} catalogFrameClassName={catalogFrameClassName} />}
      {children}
    </div>
  )
}
