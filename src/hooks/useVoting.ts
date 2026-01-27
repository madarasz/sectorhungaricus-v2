'use client'

import { useState, useEffect, useCallback } from 'react'
import type { VoteCounts, VoteCountsResponse, VoteSubmitResponse } from '@/types/voting'

const LOCAL_STORAGE_KEY = 'artist_voted_ids'
const VOTE_API_URL = '/.netlify/functions/vote'

function getLocalStorageVoted(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function setLocalStorageVoted(artistIds: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(artistIds))
  } catch {
    // Ignore storage errors
  }
}

export function useVoting() {
  const [votes, setVotes] = useState<VoteCounts>({})
  const [votedArtists, setVotedArtists] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    const loadVotes = async () => {
      try {
        const response = await fetch(VOTE_API_URL)
        const data: VoteCountsResponse = await response.json()
        if (data.success) {
          setVotes(data.votes)
        }
      } catch (error) {
        console.error('Failed to load votes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Load localStorage voted artists
    const localVoted = getLocalStorageVoted()
    setVotedArtists(new Set(localVoted))

    loadVotes()
  }, [])

  const vote = useCallback(async (artistId: string): Promise<boolean> => {
    // Optimistic update
    setVotes(prev => ({
      ...prev,
      [artistId]: (prev[artistId] || 0) + 1,
    }))
    setVotedArtists(prev => new Set([...prev, artistId]))

    // Update localStorage immediately
    const localVoted = getLocalStorageVoted()
    if (!localVoted.includes(artistId)) {
      setLocalStorageVoted([...localVoted, artistId])
    }

    try {
      const response = await fetch(VOTE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId }),
        credentials: 'include',
      })

      const data: VoteSubmitResponse = await response.json()

      if (data.success && data.votes) {
        setVotes(data.votes)
        return true
      } else if (data.alreadyVoted) {
        // Already voted - keep optimistic state but restore vote count
        if (data.votes) {
          setVotes(data.votes)
        }
        return false
      } else {
        // Rollback optimistic update on error
        setVotes(prev => ({
          ...prev,
          [artistId]: Math.max(0, (prev[artistId] || 0) - 1),
        }))
        setVotedArtists(prev => {
          const next = new Set(prev)
          next.delete(artistId)
          return next
        })
        // Rollback localStorage
        const updatedLocalVoted = getLocalStorageVoted().filter(id => id !== artistId)
        setLocalStorageVoted(updatedLocalVoted)
        return false
      }
    } catch (error) {
      console.error('Vote failed:', error)
      // Rollback on error
      setVotes(prev => ({
        ...prev,
        [artistId]: Math.max(0, (prev[artistId] || 0) - 1),
      }))
      setVotedArtists(prev => {
        const next = new Set(prev)
        next.delete(artistId)
        return next
      })
      // Rollback localStorage
      const updatedLocalVoted = getLocalStorageVoted().filter(id => id !== artistId)
      setLocalStorageVoted(updatedLocalVoted)
      return false
    }
  }, [])

  const getVoteCount = useCallback((artistId: string): number => {
    return votes[artistId] || 0
  }, [votes])

  const hasVoted = useCallback((artistId: string): boolean => {
    return votedArtists.has(artistId)
  }, [votedArtists])

  return {
    votes,
    votedArtists,
    isLoading,
    vote,
    getVoteCount,
    hasVoted,
  }
}
