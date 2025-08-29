import Link from 'next/link'
import { SubpageContent } from '@/types/content'

interface SubpageNavProps {
  subpages: SubpageContent[]
  currentSlug?: string
  gameSlug: string
  locale: string
}

export default function SubpageNav({ subpages, currentSlug, gameSlug, locale }: SubpageNavProps) {
  if (subpages.length === 0) {
    return null
  }

  return (
    <nav className="w-[16rem] pl-4">
      <div className="hero-secondary-colors rounded-md text-[1rem] font-poppins">
        {subpages.map((subpage, index) => {
          const isActive = currentSlug === subpage.data.slug
          const href = `/${locale}/${gameSlug}/${subpage.data.slug}`
          const isFirst = index === 0
          const isLast = index === subpages.length - 1
          
          let roundedClasses = ''
          if (isFirst && isLast) {
            roundedClasses = 'rounded-md'
          } else if (isFirst) {
            roundedClasses = 'rounded-t-md'
          } else if (isLast) {
            roundedClasses = 'rounded-b-md'
          }
          
          return (
            <Link
              key={subpage.slug}
              href={href}
              className={`block px-3 py-2 text-md transition-colors ${roundedClasses} ${
                isActive
                  ? 'hero-colors font-medium'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {subpage.data.title}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}