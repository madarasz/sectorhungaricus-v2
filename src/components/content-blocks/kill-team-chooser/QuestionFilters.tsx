import { ReactNode } from 'react'
import { KillTeamStyle } from '@/types/content'
import { Answers, SingleAnswerKey } from './filters'

interface Option {
  value: string
  label: string
  icon?: ReactNode
}

export interface OptionQuestion {
  key: SingleAnswerKey
  label: string
  options: Option[]
  // Single option shown as a checkbox instead of answer buttons
  checkbox?: boolean
}

// Multiple choice main factions; sub factions of the selected main factions show below them
export interface FactionQuestion {
  key: 'faction'
  label: string
  mains: Option[]
  subs: Option[]
}

// Multiple choice play styles; a team must have all selected styles
export interface StyleQuestion {
  key: 'style'
  label: string
  options: (Option & { value: KillTeamStyle; description: string })[]
}

export type Question = OptionQuestion | FactionQuestion | StyleQuestion

interface QuestionFiltersProps {
  // Questions per column on tablet and desktop, one column on mobile
  columns: Question[][]
  answers: Answers
  onAnswer: (key: SingleAnswerKey, value: string) => void
  onFaction: (main: string) => void
  onSub: (sub: string) => void
  onStyle: (style: KillTeamStyle) => void
}

interface AnswerButtonProps {
  label: string
  icon?: ReactNode
  active: boolean
  testId: string
  onClick: () => void
  // Smaller pill shape for the sub faction answers
  pill?: boolean
}

const ACTIVE_ANSWER = 'bg-[var(--hero-text)] text-[var(--hero-background)] border-[var(--hero-text)] font-semibold'

function AnswerButton({ label, icon, active, testId, onClick, pill }: AnswerButtonProps) {
  const shape = pill
    ? `px-3.5 rounded-full ${active ? ACTIVE_ANSWER : 'border-[var(--hero-text)]/35 hover:border-[var(--hero-text)] hover:bg-[var(--hero-secondary-background)]/40'}`
    : `px-4 rounded-lg ${active ? ACTIVE_ANSWER : 'border-[var(--hero-secondary-background)] bg-[var(--hero-secondary-background)]/40 hover:bg-[var(--hero-secondary-background)]'}`
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 border text-sm transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--hero-text)] ${shape}`}
      data-testid={testId}
    >
      {icon ? (
        <span className="inline-flex items-center gap-2">
          {icon}
          {label}
        </span>
      ) : label}
    </button>
  )
}

export default function QuestionFilters({ columns, answers, onAnswer, onFaction, onSub, onStyle }: QuestionFiltersProps) {
  const renderFaction = (question: FactionQuestion) => {
    const selectedMains = question.mains.filter((main) => answers.faction?.includes(main.value))
    return (
      <>
        <div className="flex flex-wrap gap-2">
          {question.mains.map((main) => (
            <AnswerButton
              key={main.value}
              label={main.label}
              active={selectedMains.includes(main)}
              onClick={() => onFaction(main.value)}
              testId={`kt-answer-faction-${main.value}`}
            />
          ))}
        </div>
        {/* Sub factions branch off the main factions like a tree level */}
        {question.subs.length > 0 && (
          <div
            role="group"
            aria-label={selectedMains.map((main) => main.label).join(', ')}
            className="relative mt-2 ml-4 pl-4 pt-2 border-l-2 border-[var(--hero-text)]/40"
            data-testid="kt-subfactions"
          >
            <span aria-hidden="true" className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-[var(--hero-text)]/60" />
            <div className="flex flex-wrap gap-2">
              {question.subs.map((sub) => (
                <AnswerButton
                  key={sub.value}
                  label={sub.label}
                  active={answers.sub?.includes(sub.value) ?? false}
                  onClick={() => onSub(sub.value)}
                  testId={`kt-answer-sub-${sub.value}`}
                  pill
                />
              ))}
            </div>
          </div>
        )}
      </>
    )
  }

  const renderStyle = (question: StyleQuestion) => {
    const selected = question.options.filter((option) => answers.style?.includes(option.value))
    return (
      <>
        <div className="flex flex-wrap gap-2">
          {question.options.map((option) => (
            <AnswerButton
              key={option.value}
              label={option.label}
              icon={option.icon}
              active={selected.includes(option)}
              onClick={() => onStyle(option.value)}
              testId={`kt-answer-style-${option.value}`}
            />
          ))}
        </div>
        {selected.length > 0 && (
          <ul className="mt-2 flex flex-col gap-0.5 text-xs italic opacity-85" aria-live="polite" data-testid="kt-style-descriptions">
            {selected.map((option) => (
              <li key={option.value}>
                <span className="font-semibold">{option.label}:</span> {option.description}
              </li>
            ))}
          </ul>
        )}
      </>
    )
  }

  const renderOptions = (question: OptionQuestion) =>
    question.checkbox ? (
      question.options.map((option) => (
        <label key={option.value} className="inline-flex items-center gap-3 min-h-11 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={answers[question.key] === option.value}
            onChange={() => onAnswer(question.key, option.value)}
            className="w-5 h-5 shrink-0 accent-[var(--hero-text)]"
            data-testid={`kt-answer-${question.key}-${option.value}`}
          />
          {option.label}
        </label>
      ))
    ) : (
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => (
          <AnswerButton
            key={option.value}
            label={option.label}
            active={answers[question.key] === option.value}
            onClick={() => onAnswer(question.key, option.value)}
            testId={`kt-answer-${question.key}-${option.value}`}
          />
        ))}
      </div>
    )

  return (
    <div className="grid gap-x-6 gap-y-4 md:grid-cols-2 rounded-2xl p-4 md:p-5 hero-colors font-poppins" data-testid="kt-questions">
      {columns.map((questions, index) => (
        <div key={index} className="flex flex-col gap-4" data-testid={`kt-question-column-${index + 1}`}>
          {questions.map((question) => (
            <fieldset key={question.key} data-testid={`kt-question-${question.key}`}>
              <legend className="text-sm font-medium mb-2">{question.label}</legend>
              {question.key === 'faction' ? renderFaction(question) : question.key === 'style' ? renderStyle(question) : renderOptions(question)}
            </fieldset>
          ))}
        </div>
      ))}
    </div>
  )
}
