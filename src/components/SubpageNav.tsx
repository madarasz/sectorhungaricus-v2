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
    <nav className="w-full lg:w-[16rem] pl-4 pr-4 lg:pr-0 mb-4 lg:mb-0">
      <div className="hero-secondary-colors rounded-md text-[1rem] font-poppins flex flex-wrap lg:flex-col lg:flex-nowrap overflow-hidden">
        {subpages.map((subpage) => {
          const isActive = currentSlug === subpage.data.slug
          const href = `/${locale}/${gameSlug}/${subpage.data.slug}`
          
          return (
            <Link
              key={subpage.slug}
              href={href}
              className={`block px-3 py-2 text-md transition-colors whitespace-nowrap text-center lg:text-left flex-1 lg:flex-none ${
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