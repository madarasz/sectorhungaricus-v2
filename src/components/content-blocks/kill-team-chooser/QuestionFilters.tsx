import { AnswerKey, Answers } from './filters'

export interface Question {
  key: AnswerKey
  label: string
  options: { value: string; label: string }[]
}

interface QuestionFiltersProps {
  questions: Question[]
  answers: Answers
  onAnswer: (key: AnswerKey, value: string) => void
}

export default function QuestionFilters({ questions, answers, onAnswer }: QuestionFiltersProps) {
  return (
    <div className="grid gap-x-6 gap-y-4 md:grid-cols-2 rounded-2xl p-4 md:p-5 hero-colors font-poppins" data-testid="kt-questions">
      {questions.map((question) => (
        <fieldset key={question.key} className={question.key === 'faction' ? 'md:col-span-2' : ''} data-testid={`kt-question-${question.key}`}>
          <legend className="text-sm font-medium mb-2">{question.label}</legend>
          <div className="flex flex-wrap gap-2">
            {question.options.map((option) => {
              const active = answers[question.key] === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onAnswer(question.key, option.value)}
                  className={`min-h-11 px-4 rounded-lg border text-sm transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--hero-text)] ${
                    active
                      ? 'bg-[var(--hero-text)] text-[var(--hero-background)] border-[var(--hero-text)] font-semibold'
                      : 'border-[var(--hero-secondary-background)] bg-[var(--hero-secondary-background)]/40 hover:bg-[var(--hero-secondary-background)]'
                  }`}
                  data-testid={`kt-answer-${question.key}-${option.value}`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
