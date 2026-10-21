import Image from 'next/image'
import { KillTeam } from '@/types/content'
import { getBestImageVariant } from '@/lib/imageVariants'

interface TeamImageProps {
  team: KillTeam
  context: 'thumbnail' | 'mobile'
  sizes: string
  className: string
  children?: React.ReactNode
}

export default function TeamImage({ team, context, sizes, className, children }: TeamImageProps) {
  const src = team.image ? getBestImageVariant(team.imageVariants, context) || team.image : undefined

  return (
    <div className={`relative overflow-hidden hero-colors ${className}`}>
      {src && <Image src={src} alt="" fill className="object-cover" sizes={sizes} />}
      {children}
    </div>
  )
}
