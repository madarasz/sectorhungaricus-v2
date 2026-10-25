import { KillTeam, KillTeamStyle } from '@/types/content'
import { getLegality } from './legality'

export interface Answers {
  exp?: 'new' | 'played' | 'pro'
  size?: 'few' | 'many' | 'horde'
  boxes?: 'one'
  // Non-classified teams are hidden unless this is set
  legal?: 'declassified'
  // Main faction values
  faction?: string[]
  // Sub faction values, valid only for a selected main faction
  sub?: string[]
  // Play styles that the team must all have
  style?: KillTeamStyle[]
}

export type AnswerKey = keyof Answers
export type SingleAnswerKey = Exclude<AnswerKey, 'faction' | 'sub' | 'style'>

export const ANSWER_KEYS: SingleAnswerKey[] = ['exp', 'size', 'boxes', 'legal']

// Main faction tags and the sub faction tags shown when the main faction is selected
export const FACTION_TREE: Record<string, string[]> = {
  imperium: ['baseline-human', 'space-marine', 'astra-militarum', 'adepta-sororitas', 'inquisition', 'abhuman', 'adeptus-mechanicus'],
  chaos: ['baseline-human', 'space-marine', 'abhuman', 'mutant'],
  xenos: ['aeldari', 'tyranid', 'genestealer-cult', 'necron', 'tau', 'votann', 'ork'],
}

// Sub factions of the selected main factions, each once, in FACTION_TREE order
export function subFactionsOf(mains: string[]): string[] {
  const subs = Object.keys(FACTION_TREE).filter((main) => mains.includes(main)).flatMap((main) => FACTION_TREE[main])
  return subs.filter((sub, index) => subs.indexOf(sub) === index)
}

const FIXED_VALUES: Record<SingleAnswerKey, string[]> = {
  exp: ['new', 'played', 'pro'],
  size: ['few', 'many', 'horde'],
  legal: ['declassified'],
  boxes: ['one'],
}

export const TEAM_PARAM = 'team'

// Operative count ranges of the team size answers
const SIZE_RANGES: Record<NonNullable<Answers['size']>, [number, number]> = {
  few: [0, 6],
  many: [7, 10],
  horde: [11, Infinity],
}

export function matchesAnswers(team: KillTeam, answers: Answers, now: Date): boolean {
  if (answers.exp === 'new' && team.skill !== 'beginner-friendly') return false
  if (answers.exp === 'played' && team.skill === 'pro-only') return false
  if (answers.exp === 'pro' && team.skill !== 'pro-only') return false

  if (answers.style && !answers.style.every((style) => team.style.includes(style))) return false

  if (answers.size) {
    // A team matches when its operative count range overlaps the answer's range
    const smallest = team.operatives ?? team.operatives_min
    const largest = team.operatives ?? team.operatives_max
    const [from, to] = SIZE_RANGES[answers.size]
    if (smallest === undefined || largest === undefined || largest < from || smallest > to) return false
  }

  if (answers.boxes === 'one' && team.boxes > 1) return false

  if (!answers.legal && getLegality(team.legal_until, now) === 'declassified') return false

  // Selected sub factions replace the main faction filter
  if (answers.sub?.length) {
    // The team must also have a selected main faction that has this sub faction
    const mains = answers.faction ?? []
    const matchesSub = answers.sub.some((sub) =>
      team.factions.includes(sub) && mains.some((main) => FACTION_TREE[main].includes(sub) && team.factions.includes(main))
    )
    if (!matchesSub) return false
  } else if (answers.faction?.length && !answers.faction.some((main) => team.factions.includes(main))) {
    return false
  }

  return true
}

// Fix number when set, otherwise the min–max range
export function operativesText(team: KillTeam): string | undefined {
  if (team.operatives !== undefined) return String(team.operatives)
  if (team.operatives_min === undefined || team.operatives_max === undefined) return undefined
  if (team.operatives_min === team.operatives_max) return String(team.operatives_min)
  return `${team.operatives_min}–${team.operatives_max}`
}

const STYLE_VALUES: KillTeamStyle[] = ['melee', 'shooting', 'combo', 'mobile', 'slow', 'fragile', 'tough', 'high-damage', 'control']

export function answersFromSearch(search: string): Answers {
  const params = new URLSearchParams(search)
  const answers: Answers = {}

  for (const key of ANSWER_KEYS) {
    const value = params.get(key)
    if (value && FIXED_VALUES[key].includes(value)) {
      ;(answers as Record<string, string>)[key] = value
    }
  }

  const factions = Object.keys(FACTION_TREE).filter((main) => params.getAll('faction').includes(main))
  if (factions.length) answers.faction = factions

  // A sub faction is valid only together with its main faction
  const validSubs = subFactionsOf(factions)
  const subs = validSubs.filter((sub) => params.getAll('sub').includes(sub))
  if (subs.length) answers.sub = subs

  const styles = STYLE_VALUES.filter((style) => params.getAll('style').includes(style))
  if (styles.length) answers.style = styles

  return answers
}

export function buildSearch(answers: Answers, selectedSlug: string | null): string {
  const params = new URLSearchParams()
  for (const key of ANSWER_KEYS) {
    const value = answers[key]
    if (value) params.set(key, value)
  }
  answers.faction?.forEach((main) => params.append('faction', main))
  answers.sub?.forEach((sub) => params.append('sub', sub))
  answers.style?.forEach((style) => params.append('style', style))
  if (selectedSlug) params.set(TEAM_PARAM, selectedSlug)
  const query = params.toString()
  return query ? `?${query}` : ''
}
