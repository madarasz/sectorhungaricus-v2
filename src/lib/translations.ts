import { Locale } from './locale-utils'

export interface TournamentResultsTranslations {
  // scope: playerScope.minTournaments(...) or playerScope.allPlayers
  title: (season: string, scope: string) => string
  allTimeTitle: (scope: string) => string
  playerScope: {
    minTournaments: (minTournaments: number) => string
    allPlayers: string
  }
  showAllPlayers: string
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
    title: (season, scope) => `Best tournament players in the ${season} season (${scope})`,
    allTimeTitle: (scope) => `Best tournament players of all time (${scope})`,
    playerScope: {
      minTournaments: (minTournaments) =>
        `at least ${minTournaments} ${minTournaments === 1 ? 'tournament' : 'tournaments'}`,
      allPlayers: 'all players'
    },
    showAllPlayers: 'Include players with fewer tournaments',
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
      label: 'List',
      top: 'Top 16',
      all: 'Full list',
      showing: (shown, total) => `Showing ${shown} of ${total} players`
    },
    concludedTournaments: 'Concluded Tournaments',
    tournamentPlayers: (count) => `(${count} players)`,
    topFactions: 'Most Played Factions'
  },
  hu: {
    title: (season, scope) =>
      `Legjobb versenyzők a ${season}-${hungarianYearSuffix(season)} szezonban (${scope})`,
    allTimeTitle: (scope) => `Minden idők legjobb versenyzői (${scope})`,
    playerScope: {
      minTournaments: (minTournaments) => `legalább ${minTournaments} verseny`,
      allPlayers: 'összes játékos'
    },
    showAllPlayers: 'Kevesebb versenyt játszók is',
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
      label: 'Lista',
      top: 'Top 16',
      all: 'Teljes lista',
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