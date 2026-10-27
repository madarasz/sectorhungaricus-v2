import { ReactNode } from 'react'

interface CardTooltipProps {
  label: string
  children?: ReactNode
  testId?: string
}

// Shown while the mouse is over the closest "group/tip" parent.
// Spans the width of the nearest positioned parent, so the tooltip is not cut off by the card
export default function CardTooltip({ label, children, testId }: CardTooltipProps) {
  return (
    <span className="pointer-events-none absolute inset-x-2 bottom-full z-10 mb-1 hidden group-hover/tip:block rounded-md bg-[#1A1251] text-[#EAE9E9] px-2.5 py-1.5 text-xs font-normal text-left shadow-[0_2px_8px_rgba(0,0,0,0.4)]" aria-hidden="true" data-testid={testId}>
      {children ? (
        <>
          <span className="font-semibold">{label}:</span> {children}
        </>
      ) : (
        <span className="font-semibold">{label}</span>
      )}
    </span>
  )
}
