import { Locale } from './locale-utils'

export interface TournamentResultsTranslations {
  title: string
  tableHeaders: {
    position: string
    player: string
    points: string
    tournaments: string
  }
}

export const tournamentResultsTranslations: Record<Locale, TournamentResultsTranslations> = {
  en: {
    title: 'Best tournament players in the 2026 season',
    tableHeaders: {
      position: '#',
      player: 'Player',
      points: 'Points',
      tournaments: 'Tournaments'
    }
  },
  hu: {
    title: 'Legjobb versenyzők a 2026-os szezonban',
    tableHeaders: {
      position: '#',
      player: 'Játékos',
      points: 'Pontszám',
      tournaments: 'Versenyek'
    }
  }
}

export function getTournamentResultsTranslations(locale: Locale): TournamentResultsTranslations {
  return tournamentResultsTranslations[locale]
}