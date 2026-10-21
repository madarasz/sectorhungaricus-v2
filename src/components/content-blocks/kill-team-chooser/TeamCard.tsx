import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBoxOpen, faSeedling, faUsers } from '@fortawesome/free-solid-svg-icons'
import { KillTeam, KillTeamChooserLabels } from '@/types/content'
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

export function BeginnerTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-green-100 text-green-900 px-2 py-0.5 text-xs font-medium" data-testid="kt-beginner-tag">
      <FontAwesomeIcon icon={faSeedling} className="w-3 h-3" aria-hidden="true" />
      {label}
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
      <TeamImage team={team} context="thumbnail" sizes="(max-width: 767px) 50vw, 240px" className="aspect-[4/3]">
        {team.beginner_friendly && (
          <span className="absolute left-2 bottom-2">
            <BeginnerTag label={labels.beginner_tag} />
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
