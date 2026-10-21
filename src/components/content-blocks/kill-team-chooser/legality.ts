// Teams are tournament legal until the end of 30 November of their legal_until year
export const LEGAL_UNTIL_MONTH = 10 // November (0-based)
export const LEGAL_UNTIL_DAY = 30

export type Legality = 'classified' | 'rotates_soon' | 'declassified'

function legalUntilDate(year: number): Date {
  return new Date(year, LEGAL_UNTIL_MONTH, LEGAL_UNTIL_DAY)
}

// First moment when the team is no longer legal
function rotationMoment(year: number): Date {
  return new Date(year, LEGAL_UNTIL_MONTH, LEGAL_UNTIL_DAY + 1)
}

export function getLegality(legalUntil: number | undefined, now: Date): Legality {
  if (legalUntil === undefined || now >= rotationMoment(legalUntil)) return 'declassified'
  // Less than a year before the rotation
  if (now >= rotationMoment(legalUntil - 1)) return 'rotates_soon'
  return 'classified'
}

// Fills the {month} and {year} placeholders of the CMS label
export function formatLegalUntil(template: string, legalUntil: number, locale: string): string {
  const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(legalUntilDate(legalUntil))
  return template.replace('{month}', month).replace('{year}', String(legalUntil))
}
