import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan, faBoxOpen, faCrown, faCubes, faSeedling, faUsers } from '@fortawesome/free-solid-svg-icons'
import { KillTeam, KillTeamBoxType, KillTeamChooserLabels } from '@/types/content'
import CombatIcons from './CombatIcons'
import TeamImage from './TeamImage'
import { operativesText } from './filters'

interface TeamCardProps {
  team: KillTeam
  labels: KillTeamChooserLabels
  factionNames: (values: string[]) => string
  selected: boolean
  onSelect: (slug: string) => void
}

// Tag shown for the skill levels other than normal
export function SkillTag({ skill, labels }: { skill: KillTeam['skill']; labels: KillTeamChooserLabels }) {
  if (skill === 'beginner-friendly') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-green-100 text-green-900 px-2 py-0.5 text-xs font-medium" data-testid="kt-beginner-tag">
        <FontAwesomeIcon icon={faSeedling} className="w-3 h-3" aria-hidden="true" />
        {labels.beginner_tag}
      </span>
    )
  }
  if (skill === 'pro-only') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-red-100 text-red-900 px-2 py-0.5 text-xs font-medium" data-testid="kt-pro-tag">
        <FontAwesomeIcon icon={faCrown} className="w-3 h-3" aria-hidden="true" />
        {labels.pro_tag}
      </span>
    )
  }
  return null
}

// Teams that cannot be bought as a Kill Team box
type SpecialBoxType = Exclude<KillTeamBoxType, 'kill-team'>

export const BOX_TYPE_STYLES: Record<SpecialBoxType, { icon: typeof faBan; badgeClassName: string; noteClassName: string }> = {
  wh40k: { icon: faCubes, badgeClassName: 'bg-[#1A1251] text-[#EAE9E9]', noteClassName: 'bg-[#E2E0F0] text-[#1A1251]' },
  discontinued: { icon: faBan, badgeClassName: 'bg-red-800 text-white', noteClassName: 'bg-red-100 text-red-900' },
}

export function boxTypeTexts(boxType: KillTeamBoxType, labels: KillTeamChooserLabels) {
  if (boxType === 'wh40k') return { badge: labels.wh40k_badge, note: labels.wh40k_note }
  if (boxType === 'discontinued') return { badge: labels.discontinued_badge, note: labels.discontinued_note }
  return undefined
}

export function BoxTypeBadge({ boxType, labels }: { boxType: KillTeamBoxType; labels: KillTeamChooserLabels }) {
  const texts = boxTypeTexts(boxType, labels)
  if (boxType === 'kill-team' || !texts) return null
  const style = BOX_TYPE_STYLES[boxType]

  return (
    // Diagonal banner across the top right corner of the image
    <span className={`absolute top-[2rem] -right-[2.625rem] w-[11rem] rotate-45 inline-flex items-center justify-center gap-1.5 py-1 text-sm leading-5 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.4)] ${style.badgeClassName}`} data-box-type={boxType} data-testid="kt-box-type-badge">
      <FontAwesomeIcon icon={style.icon} className="w-3.5 h-3.5" aria-hidden="true" />
      {texts.badge}
    </span>
  )
}

export default function TeamCard({ team, labels, factionNames, selected, onSelect }: TeamCardProps) {
  const operatives = operativesText(team)

  return (
    <button
      type="button"
      onClick={() => onSelect(team.slug)}
      aria-haspopup="dialog"
      aria-pressed={selected}
      className={`group flex flex-col text-left rounded-xl overflow-hidden bg-[var(--card-background)] text-[var(--card-text)] shadow-[0_1px_3px_var(--card-shadow)] hover:shadow-[0_4px_12px_var(--card-shadow)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--hero-secondary-background)] ${selected ? 'outline-3 outline-offset-2 outline-[var(--hero-secondary-background)]' : ''}`}
      data-testid={`kt-card-${team.slug}`}
    >
      <TeamImage team={team} context="thumbnail" sizes="(max-width: 767px) 50vw, 240px" className="aspect-[6/5]"catalogFrameClassName="-inset-y-[3%] inset-x-0 bg-white [&>img]:object-contain">
        <BoxTypeBadge boxType={team.box_type} labels={labels} />
        {team.skill !== 'normal' && (
          <span className="absolute left-2 bottom-2">
            <SkillTag skill={team.skill} labels={labels} />
          </span>
        )}
      </TeamImage>

      <div className="p-[0.75em] font-poppins">
        <h3 className="font-namdhinggo text-base md:text-lg font-semibold leading-tight" data-testid="kt-card-name">
          {team.name}
        </h3>
        <p className="text-xs opacity-75 mt-0.5 mb-2">{factionNames(team.factions)}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {operatives && (
            <span className="inline-flex items-center gap-1" title={labels.operatives_label}>
              <FontAwesomeIcon icon={faUsers} className="w-[1em] h-[1em]" aria-hidden="true" />
              <span className="sr-only">{labels.operatives_label}:</span>
              {operatives}
            </span>
          )}
          <span className="inline-flex items-center gap-1" title={labels.boxes_label}>
            <FontAwesomeIcon icon={faBoxOpen} className="w-[1em] h-[1em]" aria-hidden="true" />
            <span className="sr-only">{labels.boxes_label}:</span>
            {team.boxes}
          </span>
          <CombatIcons combat={team.combat} rangedLabel={labels.ranged_label} meleeLabel={labels.melee_label} />
        </div>
      </div>
    </button>
  )
}
