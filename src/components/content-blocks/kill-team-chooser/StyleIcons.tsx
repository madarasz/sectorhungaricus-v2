'use client'

import { ReactNode, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCrosshairs, faPersonRunning, faRepeat, faSpiral } from '@fortawesome/free-solid-svg-icons'
import { KillTeamStyle, KillTeamStyleOption } from '@/types/content'
import CardTooltip from './CardTooltip'

// Font Awesome Free has no sword, snail, broken glass or outlined shield and burst icon, so these are drawn here
function DrawnIcon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[1em] h-[1em]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

const STYLE_ICONS: Record<KillTeamStyle, () => ReactNode> = {
  melee: () => (
    <DrawnIcon>
      <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
      <path d="m13 19 6-6" />
      <path d="m16 16 4 4" />
      <path d="m19 21 2-2" />
    </DrawnIcon>
  ),
  shooting: () => <FontAwesomeIcon icon={faCrosshairs} className="w-[1em] h-[1em]" aria-hidden="true" />,
  combo: () => <FontAwesomeIcon icon={faRepeat} className="w-[1em] h-[1em]" aria-hidden="true" />,
  mobile: () => <FontAwesomeIcon icon={faPersonRunning} className="w-[1em] h-[1em]" aria-hidden="true" />,
  slow: () => (
    <DrawnIcon>
      <path d="M1.5 20h16a3 3 0 0 0 3-3v-5" />
      <path d="m20.5 12-2-5" />
      <path d="m20.5 12 2-4.5" />
      <circle cx="10" cy="11.5" r="7" />
      <path d="M10 11.5a1.5 1.5 0 1 0-1.5 1.5 3.5 3.5 0 1 0-3.5-3.5" />
    </DrawnIcon>
  ),
  fragile: () => (
    <DrawnIcon>
      <path d="M7 2h10v5a5 5 0 0 1-10 0z" />
      <path d="M12 12v9" />
      <path d="M8 21h8" />
      <path d="m11 2 1.5 3-2 2 1.5 2.5" />
    </DrawnIcon>
  ),
  tough: () => (
    <DrawnIcon>
      <path d="M12 2.5 4 5.5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10v-6z" />
    </DrawnIcon>
  ),
  'high-damage': () => (
    <DrawnIcon>
      <path d="m12 2 2.2 5.2L19.8 5l-2.4 5.4L22 12l-4.6 1.6 2.4 5.4-5.6-2.2L12 22l-2.2-5.2L4.2 19l2.4-5.4L2 12l4.6-1.6L4.2 5l5.6 2.2z" />
    </DrawnIcon>
  ),
  control: () => <FontAwesomeIcon icon={faSpiral} flip="vertical" className="w-[1em] h-[1em]" aria-hidden="true" />,
}

export function StyleIcon({ style }: { style: KillTeamStyle }) {
  return STYLE_ICONS[style]()
}

// Styles of the team in the order of the style labels from the CMS
function orderedStyles(style: KillTeamStyle[], styles: KillTeamStyleOption[]) {
  return styles.filter((option) => style.includes(option.value))
}

interface StyleIconsProps {
  style: KillTeamStyle[]
  styles: KillTeamStyleOption[]
}

export default function StyleIcons({ style, styles }: StyleIconsProps) {
  const options = orderedStyles(style, styles)

  return (
    <span className="ml-auto inline-flex items-center gap-1" role="img" aria-label={options.map((o) => o.label).join(', ')} data-testid="kt-style-icons">
      {options.map((option) => (
        <span key={option.value} className="group/tip inline-flex" data-style={option.value}>
          {STYLE_ICONS[option.value]()}
          <CardTooltip label={option.label} testId="kt-style-tooltip">{option.description}</CardTooltip>
        </span>
      ))}
    </span>
  )
}

export function StylePills({ style, styles, label }: StyleIconsProps & { label: string }) {
  const options = orderedStyles(style, styles)
  const [selected, setSelected] = useState<KillTeamStyle>()
  // Mouse hover previews a description without changing the selection
  const [hovered, setHovered] = useState<KillTeamStyle>()
  const shown = options.find((o) => o.value === (hovered ?? selected))

  return (
    <div className="xl:col-span-2 mt-2" data-testid="kt-detail-styles">
      <ul className="flex flex-wrap gap-1.5" aria-label={label}>
        {options.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              onClick={() => setSelected(selected === option.value ? undefined : option.value)}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(option.value)}
              onPointerLeave={() => setHovered(undefined)}
              aria-pressed={selected === option.value}
              aria-controls="kt-style-description"
              className={`inline-flex items-center gap-1.5 min-h-11 xl:min-h-8 px-3 rounded-full text-xs font-medium border border-[var(--hero-secondary-background)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--hero-secondary-background)] ${selected === option.value ? 'bg-[var(--hero-secondary-background)] text-[var(--hero-text)]' : 'hover:bg-[var(--hero-secondary-background)]/15'}`}
              data-testid={`kt-style-${option.value}`}
            >
              <span className="text-sm leading-none">{STYLE_ICONS[option.value]()}</span>
              {option.label}
            </button>
          </li>
        ))}
      </ul>
      <p id="kt-style-description" aria-live="polite" className="text-sm empty:hidden mt-2 rounded-lg px-3 py-2 bg-[var(--hero-secondary-background)]/10" data-testid="kt-style-description">
        {shown && (
          <>
            <span className="font-semibold">{shown.label}:</span> {shown.description}
          </>
        )}
      </p>
    </div>
  )
}
