import { Locale } from './locale-utils'

export interface TournamentResultsTranslations {
  title: string
  tableHeaders: {
    position: string
    player: string
    points: string
    tournaments: string
  }
  playerLimit: {
    label: string
    top: string
    all: string
    showing: (shown: number, total: number) => string
  }
  concludedTournaments: string
  topFactions: string
}

export const tournamentResultsTranslations: Record<Locale, TournamentResultsTranslations> = {
  en: {
    title: 'Best tournament players in the 2026 season (at least 2 tournaments)',
    tableHeaders: {
      position: '#',
      player: 'Player',
      points: 'ELO',
      tournaments: 'Tournaments'
    },
    playerLimit: {
      label: 'Show',
      top: 'Top 16',
      all: 'All players',
      showing: (shown, total) => `Showing ${shown} of ${total} players`
    },
    concludedTournaments: 'Concluded Tournaments',
    topFactions: 'Most Played Factions'
  },
  hu: {
    title: 'Legjobb versenyzők a 2026-os szezonban (legalább 2 verseny)',
    tableHeaders: {
      position: '#',
      player: 'Játékos',
      points: 'ELO',
      tournaments: 'Versenyek'
    },
    playerLimit: {
      label: 'Mutat',
      top: 'Legjobb 16',
      all: 'Minden játékos',
      showing: (shown, total) => `${total} játékosból ${shown} látható`
    },
    concludedTournaments: 'Lezárult versenyek',
    topFactions: 'Legtöbbet játszott frakciók'
  }
}

export function getTournamentResultsTranslations(locale: Locale): TournamentResultsTranslations {
  return tournamentResultsTranslations[locale]
}