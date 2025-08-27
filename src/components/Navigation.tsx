'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import { useLocale, getLocalizedPath } from '@/contexts/LocaleContext'
import { useTheme } from '@/contexts/ThemeContext'
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

  // Safe theme hook usage with fallback
  let theme: 'light' | 'dark' = 'light'
  let toggleTheme: (() => void) | undefined

  try {
    const themeContext = useTheme()
    theme = themeContext.theme
    toggleTheme = themeContext.toggleTheme
  } catch {
    // Fallback when not wrapped in ThemeProvider
    theme = 'light'
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

  const handleThemeSwitch = () => {
    if (!toggleTheme || !mounted) return
    toggleTheme()
  }


  return (
    <nav style={{backgroundColor: 'var(--navigation-background)', height: '164px'}} className="transition-colors duration-300">
      <div className="w-[1024px] mx-auto px-16 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Group 1: Calendar */}
          <Link href={getLocalizedPath("/calendar", locale)} className="font-poppins font-medium text-[22px] leading-[27px] transition-colors duration-300 hover:opacity-80" style={{color: 'var(--navigation-text)'}}>
            {calendarTitle}
          </Link>

          {/* Group 2: Logo and Title */}
          <Link href={getLocalizedPath("/", locale)} className="flex items-center space-x-4">
            <img 
              src="/uploads/sh-logo.png" 
              alt="Sector Hungaricus Logo" 
              className="max-w-[70px] max-h-[70px] object-contain"
            />
            <div className="font-montserrat-subrayada font-bold text-[36px] leading-[48px] tracking-wide" style={{color: 'var(--navigation-text)'}}>
              SECTOR HUNGARICUS
            </div>
          </Link>

          {/* Group 3: About Us */}
          <div className="font-poppins font-medium text-[22px] leading-[27px]" style={{color: 'var(--navigation-text)'}}>
            {aboutTitle}
          </div>

          {/* Group 4: Language and Dark Mode */}
          <div className="flex items-center space-x-6">
            {/* Language Switch */}
            <div className="flex rounded-lg p-1 transition-colors duration-300" style={{backgroundColor: 'var(--language-switch-background)'}}>
              <button
                onClick={() => locale !== 'hu' && handleLanguageSwitch()}
                className="px-3 py-1 text-sm font-semibold rounded-md transition-all duration-300 shadow-sm"
                style={{
                  backgroundColor: locale === 'hu' ? 'var(--language-switch-active)' : 'var(--language-switch-inactive)',
                  color: locale === 'hu' ? 'var(--language-switch-active-text)' : 'var(--language-switch-inactive-text)'
                }}
                disabled={!mounted || !setLocale}
              >
                HU
              </button>
              <button
                onClick={() => locale !== 'en' && handleLanguageSwitch()}
                className="px-3 py-1 text-sm font-semibold rounded-md transition-all duration-300 shadow-sm"
                style={{
                  backgroundColor: locale === 'en' ? 'var(--language-switch-active)' : 'var(--language-switch-inactive)',
                  color: locale === 'en' ? 'var(--language-switch-active-text)' : 'var(--language-switch-inactive-text)'
                }}
                disabled={!mounted || !setLocale}
              >
                EN
              </button>
            </div>
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={handleThemeSwitch}
              className="w-10 h-10 flex items-center justify-center transition-all duration-300 hover:scale-110"
              disabled={!mounted || !toggleTheme}
              data-testid="theme-toggle"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              <FontAwesomeIcon 
                icon={theme === 'light' ? faMoon : faSun} 
                className="text-2xl transition-colors duration-300" 
                style={{color: 'var(--navigation-text)'}}
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-opacity-20" style={{borderColor: 'var(--navigation-text)'}}>
              <Link href={getLocalizedPath("/calendar", locale)} className="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 hover:opacity-80" style={{color: 'var(--navigation-text)'}}>
                {calendarTitle}
              </Link>
              <div className="block px-3 py-2 rounded-md text-base font-medium" style={{color: 'var(--navigation-text)'}}>
                {aboutTitle}
              </div>
              <div className="px-3 py-2 flex items-center justify-between">
                <div className="flex rounded-lg p-1 w-fit transition-colors duration-300" style={{backgroundColor: 'var(--language-switch-background)'}}>
                  <button
                    onClick={() => locale !== 'hu' && handleLanguageSwitch()}
                    className="px-3 py-1 text-sm font-semibold rounded-md transition-all duration-300 shadow-sm"
                    style={{
                      backgroundColor: locale === 'hu' ? 'var(--language-switch-active)' : 'var(--language-switch-inactive)',
                      color: locale === 'hu' ? 'var(--language-switch-active-text)' : 'var(--language-switch-inactive-text)'
                    }}
                    disabled={!mounted || !setLocale}
                  >
                    HU
                  </button>
                  <button
                    onClick={() => locale !== 'en' && handleLanguageSwitch()}
                    className="px-3 py-1 text-sm font-semibold rounded-md transition-all duration-300 shadow-sm"
                    style={{
                      backgroundColor: locale === 'en' ? 'var(--language-switch-active)' : 'var(--language-switch-inactive)',
                      color: locale === 'en' ? 'var(--language-switch-active-text)' : 'var(--language-switch-inactive-text)'
                    }}
                    disabled={!mounted || !setLocale}
                  >
                    EN
                  </button>
                </div>
                
                {/* Mobile Dark Mode Toggle */}
                <button 
                  onClick={handleThemeSwitch}
                  className="w-10 h-10 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  disabled={!mounted || !toggleTheme}
                  data-testid="mobile-theme-toggle"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                >
                  <FontAwesomeIcon 
                    icon={theme === 'light' ? faMoon : faSun} 
                    className="text-xl transition-colors duration-300" 
                    style={{color: 'var(--navigation-text)'}}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}