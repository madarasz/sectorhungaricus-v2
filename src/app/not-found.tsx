'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function NotFound() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect admin paths (preserve CMS functionality)
    if (pathname.startsWith('/admin')) {
      return
    }

    // Don't redirect if path already has locale
    if (pathname.startsWith('/hu') || pathname.startsWith('/en')) {
      return
    }

    // Don't redirect static assets
    if (pathname.startsWith('/_next') || 
        pathname.startsWith('/api') || 
        pathname.startsWith('/uploads') ||
        pathname === '/favicon.ico') {
      return
    }

    // Redirect to Hungarian locale
    const redirectPath = pathname === '/' ? '/hu' : `/hu${pathname}`
    router.replace(redirectPath)
  }, [pathname, router])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#EAE9E9',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#1A1251', marginBottom: '1rem' }}>Átirányítás...</h1>
        <p style={{ color: '#666' }}>Redirecting to Hungarian version...</p>
      </div>
    </div>
  )
}