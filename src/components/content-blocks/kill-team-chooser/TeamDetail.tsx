'use client'

import { useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan, faBoxOpen, faHourglassHalf, faShieldHalved, faTrophy, faUsers, faXmark } from '@fortawesome/free-solid-svg-icons'
import { KillTeam, KillTeamChooserLabels, KillTeamStoreBox, KillTeamTier } from '@/types/content'
import { StylePills } from './StyleIcons'
import TeamImage from './TeamImage'
import { BOX_TYPE_STYLES, SkillTag, boxTypeTexts } from './TeamCard'
import { operativesText } from './filters'
import { Legality, formatLegalUntil, getLegality } from './legality'

interface TeamDetailProps {
  team: KillTeam
  labels: KillTeamChooserLabels
  factionLabels: (values: string[]) => string[]
  locale: string
  now: Date
  onClose: () => void
}

// Strongest tiers have the hottest colors
const TIER_COLORS: Record<KillTeamTier, string> = {
  S: 'bg-red-300',
  A: 'bg-orange-300',
  B: 'bg-yellow-200',
  C: 'bg-purple-300',
  D: 'bg-[#B9B4DA]',
  E: 'bg-[#E2E0F0]',
}

const LEGALITY_STYLES: Record<Legality, string> = {
  classified: 'bg-[var(--hero-text)] text-[var(--card-text)] border border-[var(--hero-secondary-background)]',
  rotates_soon: 'bg-amber-100 text-amber-900',
  declassified: 'bg-[var(--hero-text)] text-[var(--card-text)] border border-dashed border-[var(--card-text)]',
}

const DESKTOP_QUERY = '(min-width: 1280px)'

export default function TeamDetail({ team, labels, factionLabels, locale, now, onClose }: TeamDetailProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    // Desktop panel sits above the grid: bring it into view when a lower card is selected
    if (window.matchMedia(DESKTOP_QUERY).matches) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      panelRef.current?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' })
    }
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

  const operatives = operativesText(team)
  const legality = getLegality(team.legal_until, now)
  const boxTypeNote = boxTypeTexts(team.box_type, labels)?.note
  const rows: { icon: typeof faUsers; label: string; value: string; note?: string; storeBoxes?: KillTeamStoreBox[] }[] = [
    ...(operatives ? [{ icon: faUsers, label: labels.operatives_label, value: operatives }] : []),
    { icon: faBoxOpen, label: labels.boxes_label, value: String(team.boxes), note: team.boxes_note, storeBoxes: team.store_boxes },
  ]

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 xl:hidden" onClick={onClose} data-testid="kt-detail-backdrop" />
      <aside
        ref={panelRef}
        role="dialog"
        aria-labelledby="kt-detail-title"
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-[var(--card-background)] text-[var(--card-text)] font-poppins shadow-[0_-4px_24px_var(--card-shadow)] motion-safe:animate-[kt-sheet-in_200ms_ease-out] xl:motion-safe:animate-none xl:static xl:z-auto xl:col-span-full xl:max-h-none xl:overflow-hidden xl:rounded-2xl xl:outline-3 xl:outline-offset-[0.375rem] xl:outline-[var(--hero-secondary-background)] xl:m-[0.5625rem] xl:scroll-mt-4 xl:shadow-[0_8px_24px_var(--card-shadow)]"
        data-testid="kt-detail"
      >
        <TeamImage team={team} context="mobile" sizes="(max-width: 1279px) 100vw, 75vw" className="aspect-[21/9] xl:aspect-[2/1]" imageClassName="object-top" catalogFrameClassName="top-0 bottom-0 -inset-x-[3.5%] -mt-[3.5%] xl:mt-0 xl:inset-x-0 xl:-inset-y-[3%] xl:bg-white xl:[&>img]:object-contain"
          pair={{ className: 'aspect-[2/1]', sizes: '(max-width: 1279px) 50vw, 38vw', catalogFrameClassName: '-inset-[3%] bg-white [&>img]:object-contain' }}
        >
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
          {team.skill !== 'normal' && (
            <span className="absolute left-3 bottom-3">
              <SkillTag skill={team.skill} labels={labels} />
            </span>
          )}
        </TeamImage>

        <div className="p-4 md:p-5 xl:p-6 xl:grid xl:grid-cols-2 xl:gap-x-8 xl:content-start">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 xl:col-span-2">
            <h2 id="kt-detail-title" className="font-namdhinggo text-xl md:text-2xl font-semibold leading-tight" data-testid="kt-detail-name">
              {team.name}
            </h2>
            <ul className="flex flex-wrap gap-1.5" data-testid="kt-detail-factions">
              {factionLabels(team.factions).map((label) => (
                <li key={label} className="px-2.5 py-0.5 rounded-full border border-[var(--card-text)]/25 bg-[var(--hero-secondary-background)]/15 text-xs font-medium">
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <StylePills key={team.slug} style={team.style} styles={labels.styles} label={labels.styles_label} />

          {/* First column on desktop: play style and where to buy the team */}
          <div>
            <div className="prose prose-sm max-w-none mt-3 text-sm" dangerouslySetInnerHTML={{ __html: team.playstyleHtml }} />
            {team.box_type !== 'kill-team' && boxTypeNote && (
              <div
                className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${BOX_TYPE_STYLES[team.box_type].noteClassName}`}
                data-box-type={team.box_type}
                data-testid="kt-detail-box-type"
              >
                <FontAwesomeIcon icon={BOX_TYPE_STYLES[team.box_type].icon} className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{boxTypeNote}</span>
              </div>
            )}
          </div>

          {/* Second column on desktop: team facts and tournament legality */}
          <div className="xl:col-start-2 xl:row-start-3 xl:self-start">
            <dl className="grid grid-cols-[1.25rem_1fr_auto] gap-x-2 gap-y-2 items-center text-sm mt-2 xl:mt-3">
              {rows.map((row) => (
                <div key={row.label} className="contents">
                  <FontAwesomeIcon icon={row.icon} className="w-4 h-4" aria-hidden="true" />
                  <dt className="opacity-80">{row.label}</dt>
                  <dd className="text-right font-medium">{row.value}</dd>
                  {row.note && <dd className="col-start-2 col-span-2 text-xs opacity-75 -mt-1">{row.note}</dd>}
                  {row.storeBoxes && (
                    <dd className="col-start-2 col-span-2 -mt-1">
                      <ul className="list-disc pl-4 text-xs space-y-0.5" data-testid="kt-detail-store-boxes">
                        {row.storeBoxes.map((box) => (
                          <li key={box.url}>
                            <a href={box.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80">
                              {box.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  )}
                </div>
              ))}
              {team.tier && (
                <>
                  <FontAwesomeIcon icon={faTrophy} className="w-4 h-4" aria-hidden="true" />
                  <dt className="opacity-80">{labels.tier_label}</dt>
                  <dd className="text-right">
                    <span className={`inline-flex items-center justify-center min-w-8 h-8 rounded-md font-namdhinggo text-lg font-semibold text-[#1A1251] ${TIER_COLORS[team.tier]}`} data-testid="kt-detail-tier">
                      {team.tier}
                    </span>
                  </dd>
                </>
              )}
            </dl>

            <div
              className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${LEGALITY_STYLES[legality]}`}
              data-legality={legality}
              data-testid="kt-detail-legal"
            >
              <FontAwesomeIcon icon={legality === 'classified' ? faShieldHalved : legality === 'rotates_soon' ? faHourglassHalf : faBan} className="w-4 h-4" aria-hidden="true" />
              {legality === 'declassified' || team.legal_until === undefined ? (
                <span>{labels.not_legal_label}</span>
              ) : (
                <span>
                  {formatLegalUntil(labels.legal_until_label, team.legal_until, locale)}
                  {legality === 'rotates_soon' && <span className="block text-xs">{labels.rotates_soon_label}</span>}
                </span>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
