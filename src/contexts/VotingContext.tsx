'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useVoting } from '@/hooks/useVoting'
import type { VotingContextValue } from '@/types/voting'

const VotingContext = createContext<VotingContextValue | null>(null)

export function VotingProvider({ children }: { children: ReactNode }) {
  const voting = useVoting()

  return (
    <VotingContext.Provider value={voting}>
      {children}
    </VotingContext.Provider>
  )
}

export function useVotingContext(): VotingContextValue {
  const context = useContext(VotingContext)
  if (!context) {
    throw new Error('useVotingContext must be used within a VotingProvider')
  }
  return context
}
