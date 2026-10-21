'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { ContentBlock } from '@/types/content'
import { AnswerKey, Answers, TEAM_PARAM, answersFromSearch, buildSearch, matchesAnswers } from './filters'
import QuestionFilters, { Question } from './QuestionFilters'
import TeamCard from './TeamCard'
import TeamDetail from './TeamDetail'

interface KillTeamChooserProps {
  block: ContentBlock & { type: 'kill_team_chooser' }
}

export default function KillTeamChooser({ block }: KillTeamChooserProps) {
  const { labels } = block
  const teams = useMemo(() => block.killTeams ?? [], [block.killTeams])

  const [answers, setAnswers] = useState<Answers>({})
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [urlLoaded, setUrlLoaded] = useState(false)

  const factionValues = useMemo(() => labels?.factions.map((f) => f.value) ?? [], [labels])

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
    ] },
    { key: 'boxes', label: labels.q_boxes, options: [
      { value: 'one', label: labels.a_boxes_one },
      { value: 'more', label: labels.a_boxes_more },
    ] },
    { key: 'faction', label: labels.q_faction, options: labels.factions },
  ]

  const factionNames = (values: string[]) =>
    labels.factions.filter((f) => values.includes(f.value)).map((f) => f.label).join(', ')

  const visibleTeams = teams.filter((team) => matchesAnswers(team, answers, labels.elite_max_operatives))
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

  return (
    <div data-testid="kt-chooser">
      <QuestionFilters questions={questions} answers={answers} onAnswer={toggleAnswer} />

      <div className="flex flex-wrap items-center justify-between gap-2 my-4 font-poppins text-sm">
        <p aria-live="polite" data-testid="kt-result-count">{resultCount}</p>
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

      <div className="flex items-start gap-5">
        {visibleTeams.length > 0 ? (
          <div className="flex-1 min-w-0 grid grid-cols-[repeat(auto-fill,minmax(min(10rem,100%),1fr))] md:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-3 md:gap-4" data-testid="kt-grid">
            {visibleTeams.map((team) => (
              <TeamCard
                key={team.slug}
                team={team}
                labels={labels}
                factionNames={factionNames}
                selected={team.slug === selectedSlug}
                onSelect={(slug) => setSelectedSlug((current) => (current === slug ? null : slug))}
              />
            ))}
          </div>
        ) : (
          <p className="flex-1 font-poppins rounded-xl border border-dashed p-6 text-center" data-testid="kt-empty">
            {labels.empty_state}
          </p>
        )}

        {selectedTeam && (
          <TeamDetail team={selectedTeam} labels={labels} factionNames={factionNames} onClose={closeDetail} />
        )}
      </div>
    </div>
  )
}
