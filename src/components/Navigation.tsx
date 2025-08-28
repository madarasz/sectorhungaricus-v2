'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon, faCalendarDays } from '@fortawesome/free-solid-svg-icons'
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
    <nav style={{backgroundColor: 'var(--navigation-background)'}} className="transition-colors duration-300 h-[4rem] sm:h-[6rem] md:h-[7.5rem] xl:h-[10.25rem]">
      <div className="lg:max-w-[90rem] px-4 sm:px-8 md:px-16 mx-auto h-full">
        <div className="flex justify-between items-center h-full">
          {/* Group 1: Calendar - Hidden on mobile, icon on tablet (md-lg), text on desktop (xl+) */}
          <Link href={getLocalizedPath("/calendar", locale)} className="flex font-poppins font-medium text-[1.25rem] transition-colors duration-300 hover:opacity-80 md:items-center md:justify-center w-auto h-auto" style={{color: 'var(--navigation-text)'}}>
            <FontAwesomeIcon icon={faCalendarDays} className="text-2xl" />
            <div className="hidden md:block">{calendarTitle}</div>
          </Link>

          {/* placeholder for Merch */}
          <div></div>

          {/* Group 2: Logo and Title */}
          <Link href={getLocalizedPath("/", locale)} className="flex items-center space-x-2 md:space-x-3 xl:space-x-4">
            <img 
              src="/uploads/sh-logo.png" 
              alt="Sector Hungaricus Logo" 
              className="hidden sm:block max-w-[2.5rem] max-h-[2.5rem] md:max-w-[3rem] md:max-h-[3rem] lg:max-w-[3.5rem] lg:max-h-[3.5rem] xl:max-w-[4.375rem] xl:max-h-[4.375rem] object-contain"
            />
            <div className="font-montserrat-subrayada font-bold text-[1.25rem] md:text-[1.5rem] lg:text-[1.75rem] xl:text-[2.5rem] tracking-wide" style={{color: 'var(--navigation-text)'}}>
              SECTOR HUNGARICUS
            </div>
          </Link>

          {/* Group 3: About Us - Only on desktop */}
          <div className="hidden lg:block font-poppins font-medium text-[1.25rem]" style={{color: 'var(--navigation-text)'}}>
            {aboutTitle}
          </div>

          {/* Group 4: Language and Dark Mode */}
          <div className="flex items-center space-x-0">
            {/* Language Switch */}
            {/* Desktop: Full switch */}
            <div className="hidden md:flex rounded-lg p-1 transition-colors duration-300" style={{backgroundColor: 'var(--language-switch-background)'}} data-testid="desktop-language-switch">
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
            
            {/* Tablet/Mobile: Single button showing current language */}
            <button
              onClick={handleLanguageSwitch}
              className="md:hidden px-3 py-1 text-sm font-semibold rounded-md transition-all duration-300 shadow-sm"
              style={{
                backgroundColor: 'var(--language-switch-active)',
                color: 'var(--language-switch-active-text)'
              }}
              disabled={!mounted || !setLocale}
              data-testid="mobile-language-switch"
            >
              {locale.toUpperCase()}
            </button>
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={handleThemeSwitch}
              className="hidden sm:block w-10 h-10 flex items-center justify-center transition-all duration-300 hover:scale-110"
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

        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-4 pt-4 pb-4 space-y-3 border-t border-opacity-20" style={{borderColor: 'var(--navigation-text)'}}>
              {/* Calendar Link */}
              <Link 
                href={getLocalizedPath("/calendar", locale)} 
                className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors duration-300 hover:opacity-80" 
                style={{color: 'var(--navigation-text)'}}
                onClick={() => setIsMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faCalendarDays} className="text-lg" />
                <span>{calendarTitle}</span>
              </Link>
              
              {/* About Us */}
              <div className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium" style={{color: 'var(--navigation-text)'}}>
                <span className="text-lg">ℹ️</span>
                <span>{aboutTitle}</span>
              </div>
              
              {/* Language and Theme Controls */}
              <div className="px-3 py-2 flex items-center justify-between">
                <button
                  onClick={handleLanguageSwitch}
                  className="px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 shadow-sm"
                  style={{
                    backgroundColor: 'var(--language-switch-active)',
                    color: 'var(--language-switch-active-text)'
                  }}
                  disabled={!mounted || !setLocale}
                >
                  {locale.toUpperCase()}
                </button>
                
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