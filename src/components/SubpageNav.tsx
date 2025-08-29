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
    <nav className="w-80 bg-gray-50 border-r border-gray-200 min-h-screen p-6">
      <div className="space-y-2">
        {subpages.map((subpage) => {
          const isActive = currentSlug === subpage.data.slug
          const href = `/${locale}/${gameSlug}/${subpage.data.slug}`
          
          return (
            <Link
              key={subpage.slug}
              href={href}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-100'
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