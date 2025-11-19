import { apiGet } from '@/api/client'
import type {
  ContestCrewMember,
  ContestEvent,
  ContestFaqItem,
  ContestInsight,
  ContestLeaderboardEntry,
  ContestOpsCheckpoint,
  ContestResource,
  ContestTrack,
} from '@/mocks/schema/contest'

export async function fetchContestFeaturedEvent(): Promise<ContestEvent> {
  return apiGet<ContestEvent>('/contest/featured')
}

export async function fetchContestInsights(): Promise<ContestInsight[]> {
  return apiGet<ContestInsight[]>('/contest/insights')
}

export async function fetchContestSchedule(): Promise<ContestEvent[]> {
  return apiGet<ContestEvent[]>('/contest/schedule')
}

export async function fetchContestLeaderboard(): Promise<ContestLeaderboardEntry[]> {
  return apiGet<ContestLeaderboardEntry[]>('/contest/leaderboard')
}

export async function fetchContestTracks(): Promise<ContestTrack[]> {
  return apiGet<ContestTrack[]>('/contest/tracks')
}

export async function fetchContestResources(): Promise<ContestResource[]> {
  return apiGet<ContestResource[]>('/contest/resources')
}

export async function fetchContestFaq(): Promise<ContestFaqItem[]> {
  return apiGet<ContestFaqItem[]>('/contest/faq')
}

export async function fetchContestOpsCheckpoints(): Promise<ContestOpsCheckpoint[]> {
  return apiGet<ContestOpsCheckpoint[]>('/contest/ops-checkpoints')
}

export async function fetchContestCrew(): Promise<ContestCrewMember[]> {
  return apiGet<ContestCrewMember[]>('/contest/crew')
}
