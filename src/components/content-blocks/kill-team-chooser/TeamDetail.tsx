'use client'

import { useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBoxOpen, faHourglassHalf, faShieldHalved, faTrophy, faUsers, faXmark } from '@fortawesome/free-solid-svg-icons'
import { KillTeam, KillTeamChooserLabels, KillTeamTier } from '@/types/content'
import CombatIcons, { SwordIcon } from './CombatIcons'
import TeamImage from './TeamImage'
import { BeginnerTag } from './TeamCard'

interface TeamDetailProps {
  team: KillTeam
  labels: KillTeamChooserLabels
  factionNames: (values: string[]) => string
  onClose: () => void
}

// Darkest shade for the strongest tier
const TIER_COLORS: Record<KillTeamTier, string> = {
  S: 'bg-[#1A1251] text-[#EAE9E9]',
  A: 'bg-[#2E2670] text-[#EAE9E9]',
  B: 'bg-[#4D448E] text-[#EAE9E9]',
  C: 'bg-[#7F77B8] text-[#1A1251]',
  D: 'bg-[#B9B4DA] text-[#1A1251]',
  E: 'bg-[#E2E0F0] text-[#1A1251]',
}

const DESKTOP_QUERY = '(min-width: 1280px)'

export default function TeamDetail({ team, labels, factionNames, onClose }: TeamDetailProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
  }, [team.slug])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    // Bottom sheet on mobile and tablet: lock background scroll
    const isSheet = !window.matchMedia(DESKTOP_QUERY).matches
    if (isSheet) document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (isSheet) document.body.style.overflow = 'unset'
    }
  }, [onClose])

  const rows = [
    { icon: faUsers, label: labels.operatives_label, value: team.operatives },
    { icon: faBoxOpen, label: labels.boxes_label, value: String(team.boxes), note: team.boxes_note },
  ]

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 xl:hidden" onClick={onClose} data-testid="kt-detail-backdrop" />
      <aside
        role="dialog"
        aria-labelledby="kt-detail-title"
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-[var(--card-background)] text-[var(--card-text)] font-poppins shadow-[0_-4px_24px_var(--card-shadow)] motion-safe:animate-[kt-sheet-in_200ms_ease-out] xl:motion-safe:animate-none xl:sticky xl:top-4 xl:z-auto xl:w-80 xl:shrink-0 xl:max-h-[calc(100vh-2rem)] xl:rounded-2xl xl:shadow-[0_1px_3px_var(--card-shadow)]"
        data-testid="kt-detail"
      >
        <TeamImage team={team} context="mobile" sizes="(max-width: 1279px) 100vw, 320px" className="aspect-[21/9] xl:aspect-[16/9]">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={labels.close_label}
            className="absolute top-2 right-2 w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center focus-visible:outline-3 focus-visible:outline-white"
            data-testid="kt-detail-close"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" aria-hidden="true" />
          </button>
          {team.beginner_friendly && (
            <span className="absolute left-3 bottom-3">
              <BeginnerTag label={labels.beginner_tag} />
            </span>
          )}
        </TeamImage>

        <div className="p-4 md:p-5">
          <h2 id="kt-detail-title" className="font-namdhinggo text-xl md:text-2xl font-semibold leading-tight" data-testid="kt-detail-name">
            {team.name}
          </h2>
          <p className="text-xs opacity-75 mt-1">{factionNames(team.factions)}</p>

          <div className="prose prose-sm max-w-none mt-3 text-sm" dangerouslySetInnerHTML={{ __html: team.playstyleHtml }} />

          <dl className="grid grid-cols-[1.25rem_1fr_auto] gap-x-2 gap-y-2 items-center text-sm mt-2">
            {rows.map((row) => (
              <div key={row.label} className="contents">
                <FontAwesomeIcon icon={row.icon} className="w-4 h-4" aria-hidden="true" />
                <dt className="opacity-80">{row.label}</dt>
                <dd className="text-right font-medium">{row.value}</dd>
                {row.note && <dd className="col-start-2 col-span-2 text-xs opacity-75 -mt-1">{row.note}</dd>}
              </div>
            ))}
            <span className="text-base leading-none" aria-hidden="true"><SwordIcon /></span>
            <dt className="opacity-80">{labels.combat_label}</dt>
            <dd className="text-right">
              <CombatIcons combat={team.combat} rangedLabel={labels.ranged_label} meleeLabel={labels.melee_label} />
            </dd>
            <FontAwesomeIcon icon={faTrophy} className="w-4 h-4" aria-hidden="true" />
            <dt className="opacity-80">{labels.tier_label}</dt>
            <dd className="text-right">
              <span className={`inline-flex items-center justify-center min-w-8 h-8 rounded-md font-namdhinggo text-lg font-semibold ${TIER_COLORS[team.tier]}`} data-testid="kt-detail-tier">
                {team.tier}
              </span>
            </dd>
          </dl>

          <div
            className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${team.rotates_soon ? 'bg-amber-100 text-amber-900' : 'hero-secondary-colors'}`}
            data-testid="kt-detail-legal"
          >
            <FontAwesomeIcon icon={team.rotates_soon ? faHourglassHalf : faShieldHalved} className="w-4 h-4" aria-hidden="true" />
            <span>
              {labels.legal_until_label}: <strong className="font-semibold">{team.legal_until}</strong>
              {team.rotates_soon && <span className="block text-xs">{labels.rotates_soon_label}</span>}
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
