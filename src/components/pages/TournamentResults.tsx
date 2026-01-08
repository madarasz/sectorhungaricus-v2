'use client'

import { useLocale } from '@/contexts/LocaleContext'
import { getTournamentResultsTranslations } from '@/lib/translations'

export default function TournamentResults() {
  const { locale } = useLocale()
  const t = getTournamentResultsTranslations(locale)

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
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">1</td>
              <td className="tournament-table__cell">Watapi</td>
              <td className="tournament-table__cell--right">40</td>
              <td className="tournament-table__cell--center">1</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">2</td>
              <td className="tournament-table__cell">Clostry</td>
              <td className="tournament-table__cell--right">30</td>
              <td className="tournament-table__cell--center">1</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">3</td>
              <td className="tournament-table__cell">Gombás Bence</td>
              <td className="tournament-table__cell--right">22</td>
              <td className="tournament-table__cell--center">1</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">4</td>
              <td className="tournament-table__cell">Nagy Dávid</td>
              <td className="tournament-table__cell--right">16</td>
              <td className="tournament-table__cell--center">1</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">5</td>
              <td className="tournament-table__cell">Ágota Sándor</td>
              <td className="tournament-table__cell--right">12</td>
              <td className="tournament-table__cell--center">1</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">6</td>
              <td className="tournament-table__cell">Oláh Péter</td>
              <td className="tournament-table__cell--right">10</td>
              <td className="tournament-table__cell--center">1</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">7</td>
              <td className="tournament-table__cell">Tóth Csaba</td>
              <td className="tournament-table__cell--right">8</td>
              <td className="tournament-table__cell--center">1</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">8</td>
              <td className="tournament-table__cell">Darmos Gergely</td>
              <td className="tournament-table__cell--right">6</td>
              <td className="tournament-table__cell--center">1</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">9</td>
              <td className="tournament-table__cell">Kovács Áron</td>
              <td className="tournament-table__cell--right">4</td>
              <td className="tournament-table__cell--center">1</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">10</td>
              <td className="tournament-table__cell">Balogh Sándor</td>
              <td className="tournament-table__cell--right">2</td>
              <td className="tournament-table__cell--center">1</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}