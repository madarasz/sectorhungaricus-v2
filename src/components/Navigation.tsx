'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Games', href: '/games' },
    { name: 'Tournaments', href: '/tournaments' },
    { name: 'Gallery', href: '/gallery' },
  ]

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-red-600">
              Sector Hungaricus
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Language Switcher */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-red-600 px-2 py-1 rounded"
            >
              EN
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/hu"
              className="text-sm text-gray-600 hover:text-red-600 px-2 py-1 rounded"
            >
              HU
            </Link>
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
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex space-x-4 px-3 py-2">
                <Link href="/" className="text-sm text-gray-600 hover:text-red-600">
                  EN
                </Link>
                <Link href="/hu" className="text-sm text-gray-600 hover:text-red-600">
                  HU
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}