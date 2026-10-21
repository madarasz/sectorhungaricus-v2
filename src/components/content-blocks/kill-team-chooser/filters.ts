import { KillTeam } from '@/types/content'

export interface Answers {
  exp?: 'new' | 'played'
  fight?: 'ranged' | 'melee' | 'mixed'
  size?: 'few' | 'many'
  boxes?: 'one' | 'more'
  faction?: string
}

export type AnswerKey = keyof Answers

export const ANSWER_KEYS: AnswerKey[] = ['exp', 'fight', 'size', 'boxes', 'faction']

const FIXED_VALUES: Record<Exclude<AnswerKey, 'faction'>, string[]> = {
  exp: ['new', 'played'],
  fight: ['ranged', 'melee', 'mixed'],
  size: ['few', 'many'],
  boxes: ['one', 'more'],
}

export const TEAM_PARAM = 'team'

export function matchesAnswers(team: KillTeam, answers: Answers, eliteMaxOperatives: number): boolean {
  if (answers.exp === 'new' && !team.beginner_friendly) return false

  if (answers.fight) {
    const ranged = team.combat.filter((c) => c === 'ranged').length
    const melee = team.combat.length - ranged
    if (answers.fight === 'ranged' && ranged < 2) return false
    if (answers.fight === 'melee' && melee < 2) return false
    if (answers.fight === 'mixed' && (ranged === 0 || melee === 0)) return false
  }

  if (answers.size === 'few' && team.operatives_min > eliteMaxOperatives) return false
  if (answers.size === 'many' && team.operatives_max <= eliteMaxOperatives) return false

  if (answers.boxes === 'one' && team.boxes > 1) return false

  if (answers.faction && !team.factions.includes(answers.faction)) return false

  return true
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
