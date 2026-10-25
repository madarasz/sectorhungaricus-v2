'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { ContentBlock, KillTeam } from '@/types/content'
import { Answers, FACTION_TREE, SingleAnswerKey, TEAM_PARAM, answersFromSearch, buildSearch, matchesAnswers, subFactionsOf } from './filters'
import { getLegality } from './legality'
import FilterSheet from './FilterSheet'
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

  // Restore answers and selected team from the URL
  useEffect(() => {
    const search = window.location.search
    setAnswers(answersFromSearch(search))
    const team = new URLSearchParams(search).get(TEAM_PARAM)
    if (team && teams.some((t) => t.slug === team)) setSelectedSlug(team)
    setUrlLoaded(true)
  }, [teams])

  // Keep the URL in sync so filtered views can be shared
  useEffect(() => {
    if (!urlLoaded) return
    const url = `${window.location.pathname}${buildSearch(answers, selectedSlug)}`
    window.history.replaceState(window.history.state, '', url)
  }, [answers, selectedSlug, urlLoaded])

  const closeDetail = useCallback(() => setSelectedSlug(null), [])

  if (!labels) return null

  // Faction tags without a CMS label are not shown
  const factionOption = (value: string) => labels.factions.find((f) => f.value === value)
  const mainFactions = Object.keys(FACTION_TREE).flatMap((main) => factionOption(main) ?? [])
  const subFactions = subFactionsOf(answers.faction ?? []).flatMap((sub) => factionOption(sub) ?? [])

  const questionColumns: Question[][] = [[
    { key: 'exp', label: labels.q_experience, options: [
      { value: 'new', label: labels.a_experience_new },
      { value: 'played', label: labels.a_experience_played },
    ] },
    { key: 'faction', label: labels.q_faction, mains: mainFactions, subs: subFactions },
    { key: 'fight', label: labels.q_fight, options: [
      { value: 'ranged', label: labels.a_fight_ranged },
      { value: 'melee', label: labels.a_fight_melee },
      { value: 'mixed', label: labels.a_fight_mixed },
    ] },
  ], [
    { key: 'size', label: labels.q_size, options: [
      { value: 'few', label: labels.a_size_few },
      { value: 'many', label: labels.a_size_many },
      { value: 'horde', label: labels.a_size_horde },
    ] },
    { key: 'boxes', label: labels.q_boxes, checkbox: true, options: [
      { value: 'one', label: labels.a_boxes_one },
    ] },
    { key: 'legal', label: labels.q_legal, checkbox: true, options: [
      { value: 'classified', label: labels.a_legal_classified },
    ] },
  ]]

  const factionLabels = (values: string[]) =>
    labels.factions.filter((f) => values.includes(f.value)).map((f) => f.label)
  const factionNames = (values: string[]) => factionLabels(values).join(', ')

  const visibleTeams = teams.filter((team) => matchesAnswers(team, answers, now))
  // Non-classified teams go to the end of the list, after a separator
  const isDeclassified = (team: KillTeam) => getLegality(team.legal_until, now) === 'declassified'
  const classifiedTeams = visibleTeams.filter((team) => !isDeclassified(team))
  const declassifiedTeams = visibleTeams.filter(isDeclassified)
  const selectedTeam = teams.find((team) => team.slug === selectedSlug)
  const hasAnswers = Object.keys(answers).length > 0
  // Each selected faction counts as one answer
  const answerCount = Object.values(answers).reduce((count, value) => count + (Array.isArray(value) ? value.length : 1), 0)

  const toggleAnswer = (key: SingleAnswerKey, value: string) => {
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

  const toggleFaction = (main: string) => {
    setAnswers((prev) => {
      const next = { ...prev }
      const factions = prev.faction ?? []
      if (factions.includes(main)) {
        // Sub factions that no selected main faction has are deselected too
        next.faction = factions.filter((f) => f !== main)
        const validSubs = subFactionsOf(next.faction)
        next.sub = (prev.sub ?? []).filter((sub) => validSubs.includes(sub))
      } else {
        next.faction = [...factions, main]
      }
      if (!next.faction.length) delete next.faction
      if (!next.sub?.length) delete next.sub
      return next
    })
  }

  const toggleSub = (sub: string) => {
    setAnswers((prev) => {
      const subs = prev.sub ?? []
      const next: Answers = { ...prev, sub: subs.includes(sub) ? subs.filter((s) => s !== sub) : [...subs, sub] }
      if (!next.sub?.length) delete next.sub
      return next
    })
  }

  const resultCount = labels.result_count
    .replace('{shown}', String(visibleTeams.length))
    .replace('{total}', String(teams.length))

  const showResults = labels.show_results.replace('{shown}', String(visibleTeams.length))

  const detail = selectedTeam && (
    <TeamDetail team={selectedTeam} labels={labels} locale={locale} now={now} factionLabels={factionLabels} onClose={closeDetail} />
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
    <div className="flex flex-col" data-testid="kt-chooser">
      <FilterSheet
        buttonLabel={labels.filters_button}
        closeLabel={labels.filters_close_label}
        resetLabel={labels.reset}
        showResultsLabel={showResults}
        activeCount={answerCount}
        onReset={() => setAnswers({})}
      >
        <QuestionFilters columns={questionColumns} answers={answers} onAnswer={toggleAnswer} onFaction={toggleFaction} onSub={toggleSub} />
      </FilterSheet>

      <div className="flex flex-wrap items-center justify-between gap-2 my-4 font-poppins text-sm" data-testid="kt-result-bar">
        <p aria-live="polite" data-testid="kt-result-count">{resultCount}</p>
        {hasAnswers && (
          <button
            type="button"
            onClick={() => setAnswers({})}
            className="hidden md:inline-flex items-center gap-2 min-h-11 px-3 rounded-lg underline underline-offset-4 hover:no-underline focus-visible:outline-3 focus-visible:outline-[var(--hero-secondary-background)]"
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
