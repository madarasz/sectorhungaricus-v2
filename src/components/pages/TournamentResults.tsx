'use client'

import { useLocale } from '@/contexts/LocaleContext'
import { getTournamentResultsTranslations } from '@/lib/translations'
import resultsData from '../../../scripts/results-2026.json'

const TOP_PLAYERS_COUNT = 12

export default function TournamentResults() {
  const { locale } = useLocale()
  const t = getTournamentResultsTranslations(locale)

  const topPlayers = resultsData.players.slice(0, TOP_PLAYERS_COUNT)

  return (
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
  )
}
