import Image from 'next/image'
import { ImageVariants, KillTeam } from '@/types/content'
import { getBestImageVariant } from '@/lib/imageVariants'

// warhammer.com shop product photos have a ~3% white border around the tiles
const CATALOG_PHOTO = /^https:\/\/www\.warhammer\.com\/app\/resources\/catalog\/product\//

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

function FramedImage({ src, sizes, imageClassName, catalogFrameClassName }: { src: string; sizes: string; imageClassName?: string; catalogFrameClassName: string }) {
  const frameClassName = CATALOG_PHOTO.test(src) ? catalogFrameClassName : 'inset-0'

  return (
    <div className={`absolute ${frameClassName}`}>
      <Image src={src} alt="" fill className={`object-cover ${imageClassName ?? ''}`} sizes={sizes} />
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
            <FramedImage src={pairSrc} sizes={pair.sizes} catalogFrameClassName={pair.catalogFrameClassName} />
          </div>
        ))}
        {children}
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden hero-colors ${className}`}>
      {src && <FramedImage src={src} sizes={sizes} imageClassName={imageClassName} catalogFrameClassName={catalogFrameClassName} />}
      {children}
    </div>
  )
}
