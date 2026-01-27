export interface VoteCounts {
  [artistId: string]: number
}

export interface VoteCountsResponse {
  success: boolean
  votes: VoteCounts
  error?: string
}

export interface VoteSubmitResponse {
  success: boolean
  votes?: VoteCounts
  newCount?: number
  error?: string
  alreadyVoted?: boolean
}

export interface VotingContextValue {
  votes: VoteCounts
  votedArtists: Set<string>
  isLoading: boolean
  vote: (artistId: string) => Promise<boolean>
  getVoteCount: (artistId: string) => number
  hasVoted: (artistId: string) => boolean
}
