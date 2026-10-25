import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCrosshairs } from '@fortawesome/free-solid-svg-icons'
import { KillTeamCombat } from '@/types/content'

interface CombatIconsProps {
  combat: KillTeamCombat[]
  rangedLabel: string
  meleeLabel: string
}

// Font Awesome Free has no sword icon, so the melee icon is drawn here
export function SwordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[1em] h-[1em]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
      <path d="m13 19 6-6" />
      <path d="m16 16 4 4" />
      <path d="m19 21 2-2" />
    </svg>
  )
}

export default function CombatIcons({ combat, rangedLabel, meleeLabel }: CombatIconsProps) {
  const ranged = combat.filter((c) => c === 'ranged').length
  const label = `${rangedLabel}: ${ranged}, ${meleeLabel}: ${combat.length - ranged}`

  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={label} title={label} data-testid="kt-combat-icons">
      {combat.map((c, i) =>
        c === 'ranged' ? (
          <FontAwesomeIcon key={i} icon={faCrosshairs} className="w-[1em] h-[1em]" aria-hidden="true" />
        ) : (
          <SwordIcon key={i} />
        )
      )}
    </span>
  )
}
