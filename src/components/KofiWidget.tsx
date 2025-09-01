'use client'

import React, { useState } from 'react'

interface KofiWidgetProps {
  textColor?: string
  buttonText?: string
  popoverDirection?: 'up' | 'down'
  variant?: 'link' | 'button'
  buttonBackgroundColor?: string
  buttonBorderColor?: string
}

const KofiWidget: React.FC<KofiWidgetProps> = ({ 
  textColor, 
  buttonText = "Support Us", 
  popoverDirection = 'up',
  variant = 'link',
  buttonBackgroundColor,
  buttonBorderColor
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <span className="relative inline">
      {/* Text link to open Popover */}
      <button
        onClick={handleToggle}
        className={`${
          variant === 'button' 
            ? `text-white font-bold py-2 px-4 rounded-[5px] transition-colors duration-300 flex items-center justify-center ${buttonBorderColor ? 'border' : ''}` 
            : ''
        } transition-all duration-300`}
        style={variant === 'link' ? { 
          fontFamily: 'var(--font-poppins-fallback)',
          color: textColor || 'var(--navigation-text)'
        } : {
          fontFamily: 'var(--font-poppins-fallback)',
          backgroundColor: buttonBackgroundColor || '#72a4f2',
          ...(buttonBorderColor && { borderColor: buttonBorderColor })
        }}
      >
        {variant === 'button' && (
          <img
            src="/images/ko-fi-logo.png"
            alt="Ko-fi Logo"
            className="w-5 h-5 mr-2"
          />
        )}
        {buttonText}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[999998]"
          onClick={handleClose}
        />
      )}

      {/* Popover */}
      {isOpen && (
        <div 
          className={`absolute ${popoverDirection === 'down' ? 'top-full mt-2' : 'bottom-full mb-2'} left-1/2 transform -translate-x-1/2 sm:left-0 sm:transform-none z-[999999] w-[calc(100vw-2rem)] max-w-[400px] rounded-lg shadow-lg`}
          style={{ 
            backgroundColor: 'var(--hero-background)',
            borderColor: 'var(--hero-background)',
            border: '1px solid'
          }}
        >
          <div className="p-4">
            {/* Ko-fi iframe */}
            <iframe
              src="https://ko-fi.com/sectorhungaricus/?hidefeed=true&widget=true&embed=true&preview=true"
              style={{
                border: 'none',
                width: '100%',
                padding: '4px',
                background: '#fff',
                borderRadius: 0,
              }}
              height="570"
              title="sectorhungaricus"
            />
            
            {/* QR Code Section */}
            <div className="text-center mt-4">
              <a 
                href="https://ko-fi.com/sectorhungaricus"
                className="text-sm mb-2 block underline hover:no-underline"
                style={{ 
                  fontFamily: 'var(--font-poppins-fallback)',
                  color: 'var(--hero-text)'
                }}
              >
                https://ko-fi.com/sectorhungaricus
              </a>
              <img
                src="/images/kofi-qr.png"
                alt="Ko-fi QR Code"
                className="mx-auto max-w-[100px] w-full"
              />
            </div>
          </div>
        </div>
      )}
    </span>
  )
}

export default KofiWidget