import { KillTeam } from '@/types/content'
import { getLegality } from './legality'

export interface Answers {
  exp?: 'new' | 'played'
  fight?: 'ranged' | 'melee' | 'mixed'
  size?: 'few' | 'many' | 'horde'
  boxes?: 'one' | 'more'
  legal?: 'classified'
  faction?: string
}

export type AnswerKey = keyof Answers

export const ANSWER_KEYS: AnswerKey[] = ['exp', 'fight', 'size', 'boxes', 'legal', 'faction']

const FIXED_VALUES: Record<Exclude<AnswerKey, 'faction'>, string[]> = {
  exp: ['new', 'played'],
  fight: ['ranged', 'melee', 'mixed'],
  size: ['few', 'many', 'horde'],
  legal: ['classified'],
  boxes: ['one', 'more'],
}

export const TEAM_PARAM = 'team'

// Operative count ranges of the team size answers
const SIZE_RANGES: Record<NonNullable<Answers['size']>, [number, number]> = {
  few: [0, 6],
  many: [7, 10],
  horde: [11, Infinity],
}

export function matchesAnswers(team: KillTeam, answers: Answers, now: Date): boolean {
  if (answers.exp === 'new' && !team.beginner_friendly) return false

  if (answers.fight) {
    const ranged = team.combat.filter((c) => c === 'ranged').length
    const melee = team.combat.length - ranged
    if (answers.fight === 'ranged' && ranged < 2) return false
    if (answers.fight === 'melee' && melee < 2) return false
    if (answers.fight === 'mixed' && (ranged === 0 || melee === 0)) return false
  }

  if (answers.size) {
    // A team matches when its operative count range overlaps the answer's range
    const smallest = team.operatives ?? team.operatives_min
    const largest = team.operatives ?? team.operatives_max
    const [from, to] = SIZE_RANGES[answers.size]
    if (smallest === undefined || largest === undefined || largest < from || smallest > to) return false
  }

  if (answers.boxes === 'one' && team.boxes > 1) return false

  if (answers.legal) {
    if (getLegality(team.legal_until, now) === 'declassified') return false
  }

  if (answers.faction && !team.factions.includes(answers.faction)) return false

  return true
}

// Fix number when set, otherwise the min–max range
export function operativesText(team: KillTeam): string | undefined {
  if (team.operatives !== undefined) return String(team.operatives)
  if (team.operatives_min === undefined || team.operatives_max === undefined) return undefined
  if (team.operatives_min === team.operatives_max) return String(team.operatives_min)
  return `${team.operatives_min}–${team.operatives_max}`
}

export function answersFromSearch(search: string, factionValues: string[]): Answers {
  const params = new URLSearchParams(search)
  const answers: Answers = {}

  for (const key of ANSWER_KEYS) {
    const value = params.get(key)
    if (!value) continue
    const allowed = key === 'faction' ? factionValues : FIXED_VALUES[key]
    if (allowed.includes(value)) {
      ;(answers as Record<string, string>)[key] = value
    }
  }

  return answers
}

export function buildSearch(answers: Answers, selectedSlug: string | null): string {
  const params = new URLSearchParams()
  for (const key of ANSWER_KEYS) {
    const value = answers[key]
    if (value) params.set(key, value)
  }
  if (selectedSlug) params.set(TEAM_PARAM, selectedSlug)
  const query = params.toString()
  return query ? `?${query}` : ''
}
