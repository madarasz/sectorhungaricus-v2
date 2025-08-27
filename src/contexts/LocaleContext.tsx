'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export type Locale = 'hu' | 'en'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  isLoading: boolean
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

interface LocaleProviderProps {
  children: ReactNode
  initialLocale?: Locale
}

export function LocaleProvider({ children, initialLocale = 'hu' }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    // Detect locale from URL path
    const pathLocale = pathname.startsWith('/en') ? 'en' : 'hu'
    
    // Get saved locale from localStorage
    const savedLocale = localStorage.getItem('preferred-locale') as Locale | null
    
    // Priority: URL > localStorage > default (hu)
    const detectedLocale = pathLocale || savedLocale || 'hu'
    
    setLocaleState(detectedLocale)
    setIsLoading(false)
  }, [pathname])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('preferred-locale', newLocale)
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, isLoading }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}

// Utility function to get locale from pathname
export function getLocaleFromPathname(pathname: string): Locale {
  return pathname.startsWith('/en') ? 'en' : 'hu'
}

// Utility function to generate locale-aware URLs
export function getLocalizedPath(path: string, locale: Locale): string {
  // Remove any existing locale prefix
  const cleanPath = path.replace(/^\/(en|hu)/, '') || '/'
  
  // Add locale prefix only for English (Hungarian is default)
  if (locale === 'en') {
    return `/en${cleanPath === '/' ? '' : cleanPath}`
  }
  
  return cleanPath
}