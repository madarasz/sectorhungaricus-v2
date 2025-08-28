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
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('preferred-theme') as Theme | null
    
    // Check system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const systemTheme: Theme = systemPrefersDark ? 'dark' : 'light'
    
    // Priority: localStorage > system preference > default (light)
    const detectedTheme = savedTheme || systemTheme || 'light'
    
    setThemeState(detectedTheme)
    
    // Apply theme class to document immediately
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(detectedTheme)
    
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