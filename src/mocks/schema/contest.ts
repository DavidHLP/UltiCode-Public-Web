export type ContestId = string
export type ContestResourceId = string
export type ContestTrackId = string
export type ContestFaqId = string
export type ContestLeaderboardEntryId = string

export type ContestStatus = 'live' | 'registration' | 'upcoming' | 'archived'
export type ContestOpsStatus = 'pending' | 'in_progress' | 'done'
export type ContestOpsPhase = 'pre-flight' | 'live' | 'post'

export interface ContestRegistrationInfo {
  open: boolean
  closesAt?: string
  slots: number
  registered: number
  mode: 'solo' | 'team'
}

export interface ContestEventRow {
  id: ContestId
  title: string
  series: string
  description: string
  startTime: string
  durationMinutes: number
  timezone: string
  status: ContestStatus
  difficulty: 'Starter' | 'Intermediate' | 'Advanced' | 'Championship'
  ratingBand: string
  tags: string[]
  rewards: string[]
  registration: ContestRegistrationInfo
  division: 'global' | 'regional' | 'college' | 'team'
  host: string
  isRated: boolean
  prizePool?: string
  coverImage?: string
  broadcast?: string
  editorialEta?: string
}

export interface ContestInsightRow {
  id: string
  contestId: ContestId
  label: string
  value: string
  helper: string
  trend?: 'up' | 'down' | 'steady'
  delta?: string
}

export interface ContestLeaderboardEntryRow {
  id: ContestLeaderboardEntryId
  contestId: ContestId
  divisionTag: string
  rank: number
  handle: string
  avatar?: string
  country: string
  rating: number
  ratingDelta: number
  solved: number
  penalty: number
  trend: 'up' | 'down' | 'steady'
}

export interface ContestTrackRow {
  id: ContestTrackId
  contestId: ContestId
  name: string
  summary: string
  cadence: string
  targetRating: string
  focus: string[]
  included: string[]
  badge: string
  difficulty: 'Starter' | 'Intermediate' | 'Advanced'
}

export interface ContestResourceRow {
  id: ContestResourceId
  contestId: ContestId
  title: string
  description: string
  href: string
  category: 'guide' | 'video' | 'playbook' | 'announcement'
}

export interface ContestFaqRow {
  id: ContestFaqId
  contestId: ContestId
  question: string
  answer: string
  tags?: string[]
}

export interface ContestOpsCheckpointRow {
  id: string
  contestId: ContestId
  title: string
  owner: string
  dueAt: string
  status: ContestOpsStatus
  category: ContestOpsPhase
  effort: 'Low' | 'Medium' | 'High'
  notes?: string
}

export interface ContestCrewMemberRow {
  id: string
  contestId: ContestId
  name: string
  role: string
  channel: string
  timezone: string
  focus: string
}

export type ContestEvent = ContestEventRow
export type ContestInsight = Omit<ContestInsightRow, 'contestId'>
export type ContestLeaderboardEntry = Omit<ContestLeaderboardEntryRow, 'contestId'>
export type ContestTrack = Omit<ContestTrackRow, 'contestId'>
export type ContestResource = Omit<ContestResourceRow, 'contestId'>
export type ContestFaqItem = Omit<ContestFaqRow, 'contestId'>
export type ContestOpsCheckpoint = Omit<ContestOpsCheckpointRow, 'contestId'>
export type ContestCrewMember = Omit<ContestCrewMemberRow, 'contestId'>
