// Teams rotate out of tournament play on 1 November of their legal_until year
const ROTATION_MONTH = 10

export type Legality = 'classified' | 'rotates_soon' | 'declassified'

function rotationDate(year: number): Date {
  return new Date(year, ROTATION_MONTH, 1)
}

export function getLegality(legalUntil: number | undefined, now: Date): Legality {
  if (legalUntil === undefined || now >= rotationDate(legalUntil)) return 'declassified'
  // Less than a year before the rotation date
  if (now >= rotationDate(legalUntil - 1)) return 'rotates_soon'
  return 'classified'
}

export function formatRotation(legalUntil: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(rotationDate(legalUntil))
}
