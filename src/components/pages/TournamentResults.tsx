'use client'

import { useLocale } from '@/contexts/LocaleContext'
import { getTournamentResultsTranslations } from '@/lib/translations'
import resultsData from '../../../scripts/results-2026.json'
import tournamentsData from '../../../scripts/tournaments-2026.json'

const TOP_PLAYERS_COUNT = 12
const TOP_FACTIONS_COUNT = 5
const MIN_TIMES_PLAYED = 2

export default function TournamentResults() {
  const { locale } = useLocale()
  const t = getTournamentResultsTranslations(locale)

  const topPlayers = resultsData.players.slice(0, TOP_PLAYERS_COUNT)

  // Calculate faction counts from all player tournaments
  const factionCounts = resultsData.players
    .flatMap(player => player.tournaments)
    .reduce((acc, tournament) => {
      acc[tournament.faction] = (acc[tournament.faction] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  // Sort factions, filter out those with less than MIN_TIMES_PLAYED
  const sortedFactions = Object.entries(factionCounts)
    .filter(([, count]) => count >= MIN_TIMES_PLAYED)
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
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{t.title}</h3>
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
                <th className="tournament-table__header-cell--right">
                  {t.tableHeaders.points}
                </th>
                <th className="tournament-table__header-cell--center">
                  {t.tableHeaders.tournaments}
                </th>
              </tr>
            </thead>
            <tbody className="tournament-table__body">
              {topPlayers.map((player, index) => (
                <tr key={player.name} className="tournament-table__row">
                  <td className="tournament-table__cell--right">{index + 1}</td>
                  <td className="tournament-table__cell">{player.name}</td>
                  <td className="tournament-table__cell--right">{player.best_3_score}</td>
                  <td className="tournament-table__cell--center">{player.tournaments.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Concluded Tournaments Card */}
      <div className="bg-white rounded-lg overflow-hidden shadow">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{t.concludedTournaments}</h3>
        </div>
        <div className="px-6 py-4">
          <ul className="list-disc list-inside space-y-2">
            {tournamentsData.tournaments.map((tournament) => (
              <li key={tournament.bcp_id}>
                <a
                  href={`https://www.bestcoastpairings.com/event/${tournament.bcp_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {tournament.name}
                </a>
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
