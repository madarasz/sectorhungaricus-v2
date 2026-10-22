'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { ContentBlock, KillTeam } from '@/types/content'
import { AnswerKey, Answers, TEAM_PARAM, answersFromSearch, buildSearch, matchesAnswers } from './filters'
import { getLegality } from './legality'
import QuestionFilters, { Question } from './QuestionFilters'
import TeamCard from './TeamCard'
import TeamDetail from './TeamDetail'

interface KillTeamChooserProps {
  block: ContentBlock & { type: 'kill_team_chooser' }
  locale: string
}

export default function KillTeamChooser({ block, locale }: KillTeamChooserProps) {
  const { labels } = block
  const teams = useMemo(() => block.killTeams ?? [], [block.killTeams])

  const [answers, setAnswers] = useState<Answers>({})
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [urlLoaded, setUrlLoaded] = useState(false)
  // Answers and details render only after mount, so server and client output stay the same
  const now = useMemo(() => new Date(), [])

  const filterFactions = useMemo(() => labels?.factions.filter((f) => f.in_filter) ?? [], [labels])
  const factionValues = useMemo(() => filterFactions.map((f) => f.value), [filterFactions])

  // Restore answers and selected team from the URL
  useEffect(() => {
    const search = window.location.search
    setAnswers(answersFromSearch(search, factionValues))
    const team = new URLSearchParams(search).get(TEAM_PARAM)
    if (team && teams.some((t) => t.slug === team)) setSelectedSlug(team)
    setUrlLoaded(true)
  }, [factionValues, teams])

  // Keep the URL in sync so filtered views can be shared
  useEffect(() => {
    if (!urlLoaded) return
    const url = `${window.location.pathname}${buildSearch(answers, selectedSlug)}`
    window.history.replaceState(window.history.state, '', url)
  }, [answers, selectedSlug, urlLoaded])

  const closeDetail = useCallback(() => setSelectedSlug(null), [])

  if (!labels) return null

  const questions: Question[] = [
    { key: 'exp', label: labels.q_experience, options: [
      { value: 'new', label: labels.a_experience_new },
      { value: 'played', label: labels.a_experience_played },
    ] },
    { key: 'fight', label: labels.q_fight, options: [
      { value: 'ranged', label: labels.a_fight_ranged },
      { value: 'melee', label: labels.a_fight_melee },
      { value: 'mixed', label: labels.a_fight_mixed },
    ] },
    { key: 'size', label: labels.q_size, options: [
      { value: 'few', label: labels.a_size_few },
      { value: 'many', label: labels.a_size_many },
      { value: 'horde', label: labels.a_size_horde },
    ] },
    { key: 'boxes', label: labels.q_boxes, options: [
      { value: 'one', label: labels.a_boxes_one },
      { value: 'more', label: labels.a_boxes_more },
    ] },
    { key: 'faction', label: labels.q_faction, options: filterFactions },
    { key: 'legal', label: labels.q_legal, checkbox: true, options: [
      { value: 'classified', label: labels.a_legal_classified },
    ] },
  ]

  const factionNames = (values: string[]) =>
    labels.factions.filter((f) => values.includes(f.value)).map((f) => f.label).join(', ')

  const visibleTeams = teams.filter((team) => matchesAnswers(team, answers, now))
  // Non-classified teams go to the end of the list, after a separator
  const isDeclassified = (team: KillTeam) => getLegality(team.legal_until, now) === 'declassified'
  const classifiedTeams = visibleTeams.filter((team) => !isDeclassified(team))
  const declassifiedTeams = visibleTeams.filter(isDeclassified)
  const selectedTeam = teams.find((team) => team.slug === selectedSlug)
  const hasAnswers = Object.keys(answers).length > 0

  const toggleAnswer = (key: AnswerKey, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev }
      if (next[key] === value) {
        delete next[key]
      } else {
        ;(next as Record<string, string>)[key] = value
      }
      return next
    })
  }

  const resultCount = labels.result_count
    .replace('{shown}', String(visibleTeams.length))
    .replace('{total}', String(teams.length))

  const detail = selectedTeam && (
    <TeamDetail team={selectedTeam} labels={labels} locale={locale} now={now} factionNames={factionNames} onClose={closeDetail} />
  )

  const renderCard = (team: KillTeam) => (
    <TeamCard
      key={team.slug}
      team={team}
      labels={labels}
      factionNames={factionNames}
      selected={team.slug === selectedSlug}
      onSelect={(slug) => setSelectedSlug((current) => (current === slug ? null : slug))}
    />
  )

  return (
    <div data-testid="kt-chooser">
      <QuestionFilters questions={questions} answers={answers} onAnswer={toggleAnswer} />

      <div className="flex flex-wrap items-center justify-between gap-2 my-4 font-poppins text-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <p aria-live="polite" data-testid="kt-result-count">{resultCount}</p>
          <p className="italic" data-testid="kt-under-construction">{labels.under_construction}</p>
        </div>
        {hasAnswers && (
          <button
            type="button"
            onClick={() => setAnswers({})}
            className="inline-flex items-center gap-2 min-h-11 px-3 rounded-lg underline underline-offset-4 hover:no-underline focus-visible:outline-3 focus-visible:outline-[var(--hero-secondary-background)]"
            data-testid="kt-reset"
          >
            <FontAwesomeIcon icon={faRotateLeft} className="w-3.5 h-3.5" aria-hidden="true" />
            {labels.reset}
          </button>
        )}
      </div>

      {/* On desktop the detail is the first grid item and spans the full width */}
      {visibleTeams.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(10rem,100%),1fr))] md:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-3 md:gap-4" data-testid="kt-grid">
          {detail}
          {classifiedTeams.map(renderCard)}
          {declassifiedTeams.length > 0 && (
            <div className="col-span-full flex items-center gap-4 mt-4 font-poppins text-sm" data-testid="kt-declassified-separator">
              <hr className="flex-1 border-current opacity-30" />
              <span>{labels.declassified_separator}</span>
              <hr className="flex-1 border-current opacity-30" />
            </div>
          )}
          {declassifiedTeams.map(renderCard)}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {detail}
          <p className="font-poppins rounded-xl border border-dashed p-6 text-center" data-testid="kt-empty">
            {labels.empty_state}
          </p>
        </div>
      )}
    </div>
  )
}
