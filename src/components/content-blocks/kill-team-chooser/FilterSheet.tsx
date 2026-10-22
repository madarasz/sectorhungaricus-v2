'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotateLeft, faSliders, faXmark } from '@fortawesome/free-solid-svg-icons'

interface FilterSheetProps {
  buttonLabel: string
  closeLabel: string
  resetLabel: string
  // Show results button text with the current result count
  showResultsLabel: string
  activeCount: number
  onReset: () => void
  children: ReactNode
}

const TABLET_QUERY = '(min-width: 768px)'

// Questions open from a button as a bottom sheet on mobile, so the teams show first.
// From tablet the questions show in place and the button and sheet parts are hidden.
export default function FilterSheet({ buttonLabel, closeLabel, resetLabel, showResultsLabel, activeCount, onReset, children }: FilterSheetProps) {
  const [open, setOpen] = useState(false)
  const openRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus({ preventScroll: true })

    const close = () => setOpen(false)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    // The sheet is a mobile layout only: close it when the screen gets wider
    const tablet = window.matchMedia(TABLET_QUERY)
    document.addEventListener('keydown', handleKeyDown)
    tablet.addEventListener('change', close)
    document.body.style.overflow = 'hidden'
    const openButton = openRef.current

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      tablet.removeEventListener('change', close)
      document.body.style.overflow = 'unset'
      openButton?.focus({ preventScroll: true })
    }
  }, [open])

  return (
    <>
      <button
        ref={openRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="kt-filter-sheet"
        className="md:hidden flex items-center justify-center gap-2 w-full min-h-11 mb-4 px-4 rounded-xl hero-colors font-poppins text-sm font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--hero-secondary-background)]"
        data-testid="kt-filters-open"
      >
        <FontAwesomeIcon icon={faSliders} className="w-4 h-4" aria-hidden="true" />
        {buttonLabel}
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-[var(--hero-text)] text-[var(--hero-background)] text-xs" data-testid="kt-filters-count">
            {activeCount}
          </span>
        )}
      </button>

      {open && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setOpen(false)} data-testid="kt-filters-backdrop" />}

      <div
        id="kt-filter-sheet"
        role={open ? 'dialog' : undefined}
        aria-modal={open || undefined}
        aria-labelledby={open ? 'kt-filter-sheet-title' : undefined}
        className={`${open ? 'flex' : 'hidden'} fixed inset-x-0 bottom-0 z-50 max-h-[85vh] flex-col rounded-t-2xl hero-colors shadow-[0_-4px_24px_var(--card-shadow)] motion-safe:animate-[kt-sheet-in_200ms_ease-out] md:flex md:static md:z-auto md:max-h-none md:rounded-none md:bg-transparent md:shadow-none md:motion-safe:animate-none`}
        data-testid="kt-filter-sheet"
      >
        <div className="md:hidden flex items-center justify-between gap-4 pl-4 pr-2 pt-2 font-poppins">
          <h2 id="kt-filter-sheet-title" className="text-base font-semibold">{buttonLabel}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label={closeLabel}
            className="w-11 h-11 rounded-full flex items-center justify-center focus-visible:outline-3 focus-visible:outline-[var(--hero-secondary-background)]"
            data-testid="kt-filters-close"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto overscroll-contain md:overflow-visible">{children}</div>

        <div className="md:hidden flex items-center gap-3 p-4 border-t border-[var(--hero-text)]/20 font-poppins text-sm">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 min-h-11 px-3 rounded-lg underline underline-offset-4 hover:no-underline focus-visible:outline-3 focus-visible:outline-[var(--hero-secondary-background)]"
              data-testid="kt-filters-reset"
            >
              <FontAwesomeIcon icon={faRotateLeft} className="w-3.5 h-3.5" aria-hidden="true" />
              {resetLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 min-h-11 px-4 rounded-lg bg-[var(--hero-text)] text-[var(--hero-background)] font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--hero-text)]"
            data-testid="kt-filters-show"
          >
            {showResultsLabel}
          </button>
        </div>
      </div>
    </>
  )
}
