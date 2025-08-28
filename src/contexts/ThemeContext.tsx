'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Theme } from '@/styles/themes'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  initialTheme?: Theme
}

export function ThemeProvider({ children, initialTheme = 'light' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Theme is already applied by the inline script in layout.tsx
    // Just sync the React state with the already-applied theme
    const appliedTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    setThemeState(appliedTheme)
    
    // Enable transitions after a brief delay to prevent flash
    setTimeout(() => {
      document.documentElement.classList.add('theme-transitions-enabled')
      setIsLoading(false)
    }, 500)
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('preferred-theme', newTheme)
    
    // Apply theme class to document
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme, 
      isLoading 
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}