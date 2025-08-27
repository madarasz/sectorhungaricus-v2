'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLanguage, faSun } from '@fortawesome/free-solid-svg-icons'
import { useLocale, getLocalizedPath } from '@/contexts/LocaleContext'
import { usePathname, useRouter } from 'next/navigation'

interface NavigationProps {
  calendarTitle: string
  aboutTitle: string
}

export default function Navigation({ calendarTitle, aboutTitle }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Safe locale hook usage with fallback
  let locale: 'hu' | 'en' = 'hu'
  let setLocale: ((locale: 'hu' | 'en') => void) | undefined

  try {
    const localeContext = useLocale()
    locale = localeContext.locale
    setLocale = localeContext.setLocale
  } catch {
    // Fallback when not wrapped in LocaleProvider
    locale = pathname.startsWith('/en') ? 'en' : 'hu'
  }

  useEffect(() => {
    setMounted(true)
  }, [])


  const handleLanguageSwitch = () => {
    if (!setLocale || !mounted) return
    
    const newLocale = locale === 'hu' ? 'en' : 'hu'
    const newPath = getLocalizedPath(pathname, newLocale)
    setLocale(newLocale)
    router.push(newPath)
  }


  return (
    <nav style={{backgroundColor: '#EAE9E9', height: '164px'}}>
      <div className="w-[1024px] mx-auto px-16 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Group 1: Calendar */}
          <div className="font-poppins font-medium text-[22px] leading-[27px] text-[#1A1A1A]">
            {calendarTitle}
          </div>

          {/* Group 2: Logo and Title */}
          <Link href={getLocalizedPath("/", locale)} className="flex items-center space-x-4">
            <img 
              src="/uploads/sh-logo.png" 
              alt="Sector Hungaricus Logo" 
              className="max-w-[70px] max-h-[70px] object-contain"
            />
            <div className="font-montserrat-subrayada font-bold text-[36px] leading-[48px] text-[#1A1A1A] tracking-wide">
              SECTOR HUNGARICUS
            </div>
          </Link>

          {/* Group 3: About Us */}
          <div className="font-poppins font-medium text-[22px] leading-[27px] text-[#1A1A1A]">
            {aboutTitle}
          </div>

          {/* Group 4: Language and Dark Mode */}
          <div className="flex items-center space-x-6">
            {/* Language Icon */}
            <button 
              onClick={handleLanguageSwitch}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-lg transition-colors"
              title={locale === 'hu' ? 'Switch to English' : 'Váltás magyarra'}
              disabled={!mounted || !setLocale}
            >
              <span className="text-sm font-semibold text-[#1A1A1A]">
                {locale === 'hu' ? 'EN' : 'HU'}
              </span>
            </button>
            
            {/* Dark Mode Toggle */}
            <button className="w-10 h-10 flex items-center justify-center">
              <FontAwesomeIcon 
                icon={faSun} 
                className="text-2xl text-[#1A1A1A]" 
              />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex items-center px-3 py-2 border rounded text-gray-500 border-gray-600 hover:text-gray-800 hover:border-gray-800"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <div className="block text-gray-700 px-3 py-2 rounded-md text-base font-medium">
                {calendarTitle}
              </div>
              <div className="block text-gray-700 px-3 py-2 rounded-md text-base font-medium">
                {aboutTitle}
              </div>
              <div className="flex space-x-4 px-3 py-2">
                <button 
                  onClick={handleLanguageSwitch}
                  className="text-sm text-gray-600 hover:text-red-600"
                  disabled={!mounted || !setLocale}
                >
                  {locale === 'hu' ? 'EN' : 'HU'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}