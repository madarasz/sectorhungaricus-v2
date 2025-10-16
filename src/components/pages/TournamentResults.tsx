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
              <td className="tournament-table__cell">Matteo</td>
              <td className="tournament-table__cell--right">90</td>
              <td className="tournament-table__cell--center">3</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">2</td>
              <td className="tournament-table__cell">Mati_Marci</td>
              <td className="tournament-table__cell--right">74</td>
              <td className="tournament-table__cell--center">4</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">3</td>
              <td className="tournament-table__cell">L Barnabás</td>
              <td className="tournament-table__cell--right">68</td>
              <td className="tournament-table__cell--center">5</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">4</td>
              <td className="tournament-table__cell">Oláh Péter</td>
              <td className="tournament-table__cell--right">56</td>
              <td className="tournament-table__cell--center">4</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">5</td>
              <td className="tournament-table__cell">Madarász</td>
              <td className="tournament-table__cell--right">50</td>
              <td className="tournament-table__cell--center">4</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">6</td>
              <td className="tournament-table__cell">Clostry</td>
              <td className="tournament-table__cell--right">40</td>
              <td className="tournament-table__cell--center">1</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">6</td>
              <td className="tournament-table__cell">Watapi</td>
              <td className="tournament-table__cell--right">40</td>
              <td className="tournament-table__cell--center">1</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">8</td>
              <td className="tournament-table__cell">Károly Dani</td>
              <td className="tournament-table__cell--right">38</td>
              <td className="tournament-table__cell--center">3</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">9</td>
              <td className="tournament-table__cell">gabf</td>
              <td className="tournament-table__cell--right">32</td>
              <td className="tournament-table__cell--center">2</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">10</td>
              <td className="tournament-table__cell">Balogh Sándor</td>
              <td className="tournament-table__cell--right">30</td>
              <td className="tournament-table__cell--center">1</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">11</td>
              <td className="tournament-table__cell">Haász Kristóf</td>
              <td className="tournament-table__cell--right">30</td>
              <td className="tournament-table__cell--center">2</td>
            </tr>
            <tr className="tournament-table__row">
              <td className="tournament-table__cell--right">12</td>
              <td className="tournament-table__cell">Károly Robi</td>
              <td className="tournament-table__cell--right">28</td>
              <td className="tournament-table__cell--center">3</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}