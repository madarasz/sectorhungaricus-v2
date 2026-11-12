import { Locale } from './locale-utils'

export interface TournamentResultsTranslations {
  title: (season: string, minTournaments: number) => string
  allTimeTitle: (minTournaments: number) => string
  season: {
    label: string
    allTime: string
  }
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
  tournamentPlayers: (count: number) => string
  topFactions: string
}

// Hungarian adjective suffix of a year number, for example 2026-os, 2027-es, 2028-as
function hungarianYearSuffix(year: string): string {
  const lastDigitSuffixes = ['', 'es', 'es', 'as', 'es', 'ös', 'os', 'es', 'as', 'es']
  const tensSuffixes = ['es', 'es', 'as', 'as', 'es', 'es', 'as', 'es', 'as', 'es']
  const lastDigit = Number(year.slice(-1))
  if (lastDigit !== 0) return lastDigitSuffixes[lastDigit]
  const tens = Number(year.slice(-2, -1))
  if (tens !== 0) return tensSuffixes[tens]
  return year.slice(-3, -2) === '0' ? 'es' : 'as'
}

export const tournamentResultsTranslations: Record<Locale, TournamentResultsTranslations> = {
  en: {
    title: (season, minTournaments) =>
      `Best tournament players in the ${season} season (at least ${minTournaments} ${minTournaments === 1 ? 'tournament' : 'tournaments'})`,
    allTimeTitle: (minTournaments) =>
      `Best tournament players of all time (at least ${minTournaments} ${minTournaments === 1 ? 'tournament' : 'tournaments'})`,
    season: {
      label: 'Season',
      allTime: 'All-time'
    },
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
    tournamentPlayers: (count) => `(${count} players)`,
    topFactions: 'Most Played Factions'
  },
  hu: {
    title: (season, minTournaments) =>
      `Legjobb versenyzők a ${season}-${hungarianYearSuffix(season)} szezonban (legalább ${minTournaments} verseny)`,
    allTimeTitle: (minTournaments) =>
      `Minden idők legjobb versenyzői (legalább ${minTournaments} verseny)`,
    season: {
      label: 'Szezon',
      allTime: 'Összesített'
    },
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
    tournamentPlayers: (count) => `(${count} játékos)`,
    topFactions: 'Legtöbbet játszott frakciók'
  }
}

export function getTournamentResultsTranslations(locale: Locale): TournamentResultsTranslations {
  return tournamentResultsTranslations[locale]
}