'use client'

import Link from 'next/link'
import { useState } from 'react'

interface NavigationProps {
  calendarTitle: string
  aboutTitle: string
}

export default function Navigation({ calendarTitle, aboutTitle }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav style={{backgroundColor: '#EAE9E9', height: '164px'}}>
      <div className="w-[1024px] mx-auto px-16 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Group 1: Calendar */}
          <Link
            href="/calendar"
            className="font-poppins font-medium text-[18px] leading-[27px] text-[#1A1A1A] hover:text-[#1A1251] transition-colors"
          >
            {calendarTitle}
          </Link>

          {/* Group 2: Logo and Title */}
          <Link href="/" className="flex items-center space-x-4">
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
          <Link
            href="/about-us"
            className="font-poppins font-medium text-[18px] leading-[27px] text-[#1A1A1A] hover:text-[#1A1251] transition-colors"
          >
            {aboutTitle}
          </Link>

          {/* Group 4: Language and Dark Mode */}
          <div className="flex items-center space-x-6">
            {/* Language Icon */}
            <button className="w-10 h-10 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 3.33337C29.2042 3.33337 36.6667 10.7959 36.6667 20C36.6667 29.2042 29.2042 36.6667 20 36.6667C10.7958 36.6667 3.33333 29.2042 3.33333 20C3.33333 10.7959 10.7958 3.33337 20 3.33337ZM20 33.3334C21.0417 33.3334 22.0833 33.1667 23.0833 32.8334L20 26.6667L16.9167 32.8334C17.9167 33.1667 18.9583 33.3334 20 33.3334ZM13.75 31.5C14.5833 30.8334 15.3333 29.9584 16 28.9584L14.1667 25L10 25.8334C11.0833 28.1667 12.25 30.0834 13.75 31.5ZM6.25 20C6.25 21.0417 6.41667 22.0833 6.75 23.0833L10 22.5V17.5L6.75 16.9167C6.41667 17.9167 6.25 18.9584 6.25 20ZM10 14.1667L14.1667 15L16 11.0417C15.3333 10.0417 14.5833 9.16671 13.75 8.50004C12.25 9.91671 11.0833 11.8334 10 14.1667ZM30 14.1667C28.9167 11.8334 27.75 9.91671 26.25 8.50004C25.4167 9.16671 24.6667 10.0417 24 11.0417L25.8333 15L30 14.1667ZM30 25.8334L25.8333 25L24 28.9584C24.6667 29.9584 25.4167 30.8334 26.25 31.5C27.75 30.0834 28.9167 28.1667 30 25.8334ZM33.75 20C33.75 18.9584 33.5833 17.9167 33.25 16.9167L30 17.5V22.5L33.25 23.0833C33.5833 22.0833 33.75 21.0417 33.75 20ZM18.3333 13.3334H21.6667V16.6667H18.3333V13.3334ZM18.3333 23.3334H21.6667V26.6667H18.3333V23.3334Z" fill="#1A1A1A"/>
              </svg>
            </button>
            
            {/* Dark Mode Toggle */}
            <button className="w-10 h-10 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 13.3334C16.3167 13.3334 13.3333 16.3167 13.3333 20C13.3333 23.6834 16.3167 26.6667 20 26.6667C23.6833 26.6667 26.6667 23.6834 26.6667 20C26.6667 16.3167 23.6833 13.3334 20 13.3334ZM3.33333 21.6667H6.66667C7.58333 21.6667 8.33333 20.9167 8.33333 20C8.33333 19.0834 7.58333 18.3334 6.66667 18.3334H3.33333C2.41667 18.3334 1.66667 19.0834 1.66667 20C1.66667 20.9167 2.41667 21.6667 3.33333 21.6667ZM33.3333 21.6667H36.6667C37.5833 21.6667 38.3333 20.9167 38.3333 20C38.3333 19.0834 37.5833 18.3334 36.6667 18.3334H33.3333C32.4167 18.3334 31.6667 19.0834 31.6667 20C31.6667 20.9167 32.4167 21.6667 33.3333 21.6667ZM18.3333 3.33337V6.66671C18.3333 7.58337 19.0833 8.33337 20 8.33337C20.9167 8.33337 21.6667 7.58337 21.6667 6.66671V3.33337C21.6667 2.41671 20.9167 1.66671 20 1.66671C19.0833 1.66671 18.3333 2.41671 18.3333 3.33337ZM18.3333 33.3334V36.6667C18.3333 37.5834 19.0833 38.3334 20 38.3334C20.9167 38.3334 21.6667 37.5834 21.6667 36.6667V33.3334C21.6667 32.4167 20.9167 31.6667 20 31.6667C19.0833 31.6667 18.3333 32.4167 18.3333 33.3334Z" fill="#1A1A1A"/>
              </svg>
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
              <Link
                href="/calendar"
                className="block text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {calendarTitle}
              </Link>
              <Link
                href="/about-us"
                className="block text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {aboutTitle}
              </Link>
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