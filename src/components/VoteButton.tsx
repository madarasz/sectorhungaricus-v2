'use client'

import { useVotingContext } from '@/contexts/VotingContext'

interface VoteButtonProps {
  artistId: string
  locale: string
}

const labels = {
  en: {
    vote: 'Vote',
    voted: 'Voted',
  },
  hu: {
    vote: 'Szavazok',
    voted: 'Szavaztam',
  },
}

export default function VoteButton({ artistId, locale }: VoteButtonProps) {
  const { vote, getVoteCount, hasVoted, isLoading } = useVotingContext()

  const voted = hasVoted(artistId)
  const count = getVoteCount(artistId)
  const localeLabels = labels[locale as keyof typeof labels] || labels.en

  const handleClick = async () => {
    if (voted || isLoading) return
    await vote(artistId)
  }

  return (
    <button
      onClick={handleClick}
      disabled={voted || isLoading}
      data-testid="vote-button"
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium
        transition-colors duration-200
        ${voted
          ? 'bg-pink-100 text-pink-600 cursor-default'
          : 'bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-pink-600 cursor-pointer'
        }
        ${isLoading ? 'opacity-50' : ''}
      `}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={voted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={voted ? 0 : 2}
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      <span data-testid="vote-count">{count}</span>
      <span>{voted ? localeLabels.voted : localeLabels.vote}</span>
    </button>
  )
}
