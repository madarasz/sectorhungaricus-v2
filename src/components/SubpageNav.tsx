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

  const rows: SubpageContent[][] = []
  for (let i = 0; i < subpages.length; i += 2) {
    rows.push(subpages.slice(i, i + 2))
  }

  return (
    <nav className="sticky top-[4rem] sm:top-[6rem] md:top-[7.5rem] z-10 lg:static w-full lg:w-[16rem] 2xl:w-[20rem] pl-4 pr-4 lg:pr-0">
      <div className="hero-secondary-colors lg:w-[15.5rem] 2xl:ml-[4rem] rounded-md text-[0.9375rem] md:text-[1rem] font-poppins flex flex-col md:flex-row md:flex-wrap lg:flex-col lg:flex-nowrap overflow-hidden">
        {/* On mobile the links go in rows of two; from md the row wrappers dissolve into the parent flex */}
        {rows.map((row) => (
          <div key={row[0].slug} className="flex md:contents">
            {row.map((subpage, index) => {
              const isActive = currentSlug === subpage.data.slug
              const href = `/${locale}/${gameSlug}/${subpage.data.slug}`
              const mobileAlign = row.length === 1 ? 'text-center' : index === 0 ? 'text-left pl-3.5' : 'text-right pr-3.5'

              return (
                <Link
                  key={subpage.slug}
                  href={href}
                  className={`block px-2 md:px-3 py-2 text-md transition-colors whitespace-nowrap ${mobileAlign} md:text-center lg:text-left flex-auto md:flex-1 lg:flex-none ${
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
        ))}
      </div>
      <div className="h-4 lg:hidden" style={{backgroundColor: 'var(--background)'}} />
    </nav>
  )
}