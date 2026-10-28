import Image from 'next/image'
import { ImageVariants, KillTeam } from '@/types/content'
import { getBestImageVariant } from '@/lib/imageVariants'

// warhammer.com shop product photos have a ~3% white border around the tiles
const CATALOG_PHOTO = /^https:\/\/www\.warhammer\.com\/app\/resources\/catalog\/product\//
// 360° spin frames show one small model with much empty space around it, so zoom in
const SPIN_PHOTO = /^https:\/\/www\.warhammer\.com\/app\/resources\/catalog\/product\/threeSixty\//
const SPIN_ZOOM_CLASS_NAME = 'scale-[1.35] origin-[50%_55%]'
// Per team zoom: the base of the model touches the bottom of the card and no part of the model is cut off.
// Write full class names: Tailwind only finds classes that appear literally in the code.
const TEAM_SPIN_ZOOM_CLASS_NAMES: Record<string, string> = {
  'angels-of-death': 'scale-[1.39] origin-[60.8%_63.3%]',
  'battleclade': 'scale-[1.30] origin-[69.7%_58.9%]',
  'blooded': 'scale-[1.69] origin-[45.1%_61.0%]',
  'brood-brothers': 'scale-[1.34] origin-[71.3%_30.1%]',
  'canoptek-circle': 'scale-[1.38] origin-[49.6%_63.5%]',
  'celestian-insidiants': 'scale-[1.53] origin-[16.4%_54.2%]',
  'chaos-cult': 'scale-[1.03] origin-[-50.3%_-78.9%]',
  'corsair-voidscarred': 'scale-[1.17] origin-[39.1%_56.5%]',
  'death-korps': 'scale-[1.38] origin-[39.6%_88.3%]',
  'deathwatch': 'scale-[2.07] origin-[61.6%_67.3%]',
  'elucidian-starstriders': 'scale-[1.55] origin-[50.6%_44.8%]',
  'exaction-squad': 'scale-[1.29] origin-[48.9%_42.4%]',
  'farstalker-kinband': 'scale-[1.20] origin-[29.5%_53.6%]',
  'fellgor-ravagers': 'scale-[1.11] origin-[67.0%_16.0%]',
  'goremongers': 'scale-[1.37] origin-[81.2%_75.7%]',
  'hearthkyn-salvagers': 'scale-[1.48] origin-[59.0%_35.4%]',
  'hernkyn-yaegirs': 'scale-[1.28] origin-[9.5%_27.6%]',
  'hierotek-circle': 'scale-[1.33] origin-[35.6%_51.6%]',
  'hunter-clade': 'scale-[1.63] origin-[51.8%_41.8%]',
  'imperial-navy-breachers': 'scale-[1.45] origin-[38.8%_46.0%]',
  'inquisitorial-agents': 'scale-[1.22] origin-[39.0%_17.7%]',
  'kasrkin': 'scale-[1.52] origin-[40.6%_53.0%]',
  'legionaries': 'scale-[1.53] origin-[45.7%_38.7%]',
  'mandrakes': 'scale-[1.25] origin-[50.2%_30.6%]',
  'murderwing': 'scale-[1.24] origin-[64.3%_63.7%]',
  'nemesis-claw': 'scale-[1.53] origin-[70.6%_31.9%]',
  'pathfinders': 'scale-[1.44] origin-[55.3%_42.6%]',
  'phobos-strike-team': 'scale-[1.08] origin-[-40.2%_37.0%]',
  'plague-marines': 'scale-[1.20] origin-[-6.1%_63.0%]',
  'ratlings': 'scale-[1.42] origin-[43.0%_73.8%]',
  'raveners': 'scale-[1.11] origin-[42.0%_64.6%]',
  'sanctifiers': 'scale-[1.13] origin-[48.7%_39.9%]',
  'scout-squad': 'scale-[1.43] origin-[49.3%_36.5%]',
  'spectre-squad': 'scale-[1.47] origin-[42.7%_45.4%]',
  'tempestus-aquilons': 'scale-[1.44] origin-[53.6%_43.7%]',
  'vespid-stingwings': 'scale-[1.28] origin-[47.1%_37.3%]',
  'warpcoven': 'scale-[1.14] origin-[30.6%_30.8%]',
  'wolf-scouts': 'scale-[1.94] origin-[37.3%_57.9%]',
  'wrecka-krew': 'scale-[1.47] origin-[49.2%_72.7%]',
  'xv26-stealth-battlesuits': 'scale-[2.37] origin-[40.7%_57.5%]',
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
