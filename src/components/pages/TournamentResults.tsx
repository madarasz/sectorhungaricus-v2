'use client'

import { useState } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { getTournamentResultsTranslations } from '@/lib/translations'
import resultsData from '../../../scripts/results.json'

const TOP_PLAYERS_COUNT = 16
const TOP_FACTIONS_COUNT = 10
const FACTION_MIN_TIMES_PLAYED = 3
// Season id of the all-time results, set by scripts/get_tournament_points.ts
const ALL_TIME_SEASON_ID = 'all-time'

type PlayerLimit = 'top' | 'all'

const filterLabelClassName = 'text-xs font-semibold uppercase tracking-wide text-gray-600'
const selectClassName = 'w-full md:w-auto md:min-w-[10rem] appearance-none min-h-[44px] md:min-h-0 rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-900 shadow-sm cursor-pointer transition-colors hover:border-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40'

function SelectChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
    >
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clipRule="evenodd" />
    </svg>
  )
}

export default function TournamentResults() {
  const { locale } = useLocale()
  const t = getTournamentResultsTranslations(locale)
  const [playerLimit, setPlayerLimit] = useState<PlayerLimit>('top')
  // Newest season is the first one
  const [seasonId, setSeasonId] = useState(resultsData.seasons[0].id)
  const [showAllPlayersChecked, setShowAllPlayersChecked] = useState(false)

  const season = resultsData.seasons.find(s => s.id === seasonId) ?? resultsData.seasons[0]
  const isAllTime = season.id === ALL_TIME_SEASON_ID
  const seasonLabel = (id: string) => id === ALL_TIME_SEASON_ID ? t.season.allTime : id
  // With a minimum of 1 tournament every player is eligible: the checkbox is always on
  const isMinTournamentsOne = season.min_tournaments <= 1
  const showAllPlayers = isMinTournamentsOne || showAllPlayersChecked
  const scope = showAllPlayers
    ? t.playerScope.allPlayers
    : t.playerScope.minTournaments(season.min_tournaments)
  const title = isAllTime ? t.allTimeTitle(scope) : t.title(season.id, scope)

  const eligiblePlayers = showAllPlayers
    ? season.players
    : season.players.filter(player => player.tournaments.length >= season.min_tournaments)
  const shownPlayers = playerLimit === 'top'
    ? eligiblePlayers.slice(0, TOP_PLAYERS_COUNT)
    : eligiblePlayers

  // Calculate faction counts from all player tournaments
  const factionCounts = season.players
    .flatMap(player => player.tournaments)
    .reduce((acc, tournament) => {
      acc[tournament.faction] = (acc[tournament.faction] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  // Count players per tournament
  const tournamentPlayerCounts = season.players
    .flatMap(player => player.tournaments)
    .reduce((acc, tournament) => {
      acc[tournament.name] = (acc[tournament.name] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  // Sort factions, filter out those with less than FACTION_MIN_TIMES_PLAYED
  const sortedFactions = Object.entries(factionCounts)
    .filter(([, count]) => count >= FACTION_MIN_TIMES_PLAYED)
    .sort((a, b) => b[1] - a[1])

  // Take top factions, extending if there's a tie at the cutoff
  const topFactions = (() => {
    if (sortedFactions.length <= TOP_FACTIONS_COUNT) {
      return sortedFactions
    }
    const cutoffCount = sortedFactions[TOP_FACTIONS_COUNT - 1][1]
    return sortedFactions.filter(([, count]) => count >= cutoffCount)
  })()

  return (
    <div className="space-y-6">
      {/* Tournament Results Card */}
      <div className="bg-white rounded-lg overflow-hidden shadow">
        {/* Filters */}
        <div
          className="px-4 md:px-6 py-4 bg-gray-200 border-b border-gray-300 grid grid-cols-2 gap-x-3 gap-y-3 md:flex md:flex-wrap md:items-end md:gap-x-6"
          id="tournament-results-filters"
        >
          <div className="flex flex-col gap-1 min-w-0">
            <label htmlFor="season-select" className={filterLabelClassName}>
              {t.season.label}
            </label>
            <div className="relative">
              <select
                id="season-select"
                value={season.id}
                onChange={(e) => setSeasonId(e.target.value)}
                className={selectClassName}
              >
                {resultsData.seasons.map(s => (
                  <option key={s.id} value={s.id}>{seasonLabel(s.id)}</option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <label htmlFor="player-limit-select" className={filterLabelClassName}>
              {t.playerLimit.label}
            </label>
            <div className="relative">
              <select
                id="player-limit-select"
                value={playerLimit}
                onChange={(e) => setPlayerLimit(e.target.value as PlayerLimit)}
                className={selectClassName}
              >
                <option value="top">{t.playerLimit.top}</option>
                <option value="all">{t.playerLimit.all}</option>
              </select>
              <SelectChevron />
            </div>
          </div>
          <label
            htmlFor="show-all-players"
            className={`col-span-2 flex items-center gap-3 min-h-[44px] md:min-h-[2.375rem] select-none text-sm font-medium text-gray-900 ${isMinTournamentsOne ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          >
            <input
              type="checkbox"
              id="show-all-players"
              checked={showAllPlayers}
              disabled={isMinTournamentsOne}
              onChange={(e) => setShowAllPlayersChecked(e.target.checked)}
              className="h-5 w-5 shrink-0 rounded border-gray-300 accent-indigo-600 cursor-pointer disabled:cursor-not-allowed"
            />
            {t.showAllPlayers}
          </label>
        </div>

        <div className="px-4 md:px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900" id="tournament-results-title">{title}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="tournament-table" id="tournament-results-table">
            <thead className="tournament-table__header">
              <tr>
                <th className="tournament-table__header-cell--right">
                  {t.tableHeaders.position}
                </th>
                <th className="tournament-table__header-cell">
                  {t.tableHeaders.player}
                </th>
                <th className="tournament-table__header-cell--center">
                  {t.tableHeaders.points}
                </th>
                <th className="tournament-table__header-cell--center hidden md:table-cell">
                  {t.tableHeaders.tournaments}
                </th>
              </tr>
            </thead>
            <tbody className="tournament-table__body">
              {shownPlayers.map((player) => {
                const rank = eligiblePlayers.findIndex(p => p.elo === player.elo) + 1
                return (
                <tr key={player.id} className="tournament-table__row">
                  <td className="tournament-table__cell--right">{rank}</td>
                  <td className="tournament-table__cell">{player.name}</td>
                  <td className="tournament-table__cell--center"><span className="font-bold">{player.elo}</span> <span className="italic">({player.wins}W/{player.draws}D/{player.losses}L)</span></td>
                  <td className="tournament-table__cell--center hidden md:table-cell">{player.tournaments.length}</td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div
          className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500"
          id="tournament-results-count"
          aria-live="polite"
        >
          {t.playerLimit.showing(shownPlayers.length, eligiblePlayers.length)}
        </div>
      </div>

      {/* Concluded Tournaments Card */}
      <div className="bg-white rounded-lg overflow-hidden shadow">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{t.concludedTournaments} ({season.tournaments.length})</h3>
        </div>
        <div className="px-6 py-4">
          <ul className="list-disc list-inside space-y-2">
            {season.tournaments.map((tournament) => (
              <li key={tournament.bcp_id}>
                <a
                  href={`https://www.bestcoastpairings.com/event/${tournament.bcp_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {tournament.name}
                </a>
                {' '}
                <span className="text-gray-700" data-testid="tournament-players">
                  {t.tournamentPlayers(tournamentPlayerCounts[tournament.name] ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Top Factions Card */}
      <div className="bg-white rounded-lg overflow-hidden shadow">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{t.topFactions}</h3>
        </div>
        <div className="px-6 py-4">
          <ul className="list-disc list-inside space-y-2">
            {topFactions.map(([faction, count]) => (
              <li key={faction} className="text-gray-700">
                {faction} ({count})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
