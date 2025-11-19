import type {
  ContestEvent,
  ContestEventRow,
  ContestFaqItem,
  ContestFaqRow,
  ContestInsight,
  ContestInsightRow,
  ContestLeaderboardEntry,
  ContestLeaderboardEntryRow,
  ContestOpsCheckpoint,
  ContestOpsCheckpointRow,
  ContestResource,
  ContestResourceRow,
  ContestTrack,
  ContestTrackRow,
  ContestCrewMember,
  ContestCrewMemberRow,
} from '@/mocks/schema/contest'
import contestData from '@/mocks/db/contest.json'

const schedule = contestData.events as ContestEventRow[]
const derivedFeaturedContest =
  schedule.find((event) => event.id === contestData.featuredContestId) ?? schedule[0]

if (!derivedFeaturedContest) {
  throw new Error('Contest dataset is empty')
}
const featuredContest = derivedFeaturedContest

const mapRows = <T extends { contestId: string }, O>(
  rows: T[],
  mapper: (row: T) => O,
): O[] => rows.filter((row) => row.contestId === featuredContest.id).map(mapper)

export function fetchContestFeaturedEvent(): ContestEvent {
  return featuredContest
}

export function fetchContestInsights(): ContestInsight[] {
  return mapRows(contestData.insights as ContestInsightRow[], ({ contestId, ...row }) => row)
}

export function fetchContestSchedule(): ContestEvent[] {
  return schedule
}

export function fetchContestLeaderboard(): ContestLeaderboardEntry[] {
  return mapRows(
    contestData.leaderboard as ContestLeaderboardEntryRow[],
    ({ contestId, ...row }) => row,
  )
}

export function fetchContestTracks(): ContestTrack[] {
  return mapRows(contestData.tracks as ContestTrackRow[], ({ contestId, ...row }) => row)
}

export function fetchContestResources(): ContestResource[] {
  return mapRows(contestData.resources as ContestResourceRow[], ({ contestId, ...row }) => row)
}

export function fetchContestFaq(): ContestFaqItem[] {
  return mapRows(contestData.faqs as ContestFaqRow[], ({ contestId, ...row }) => row)
}

export function fetchContestOpsCheckpoints(): ContestOpsCheckpoint[] {
  return mapRows(contestData.ops as ContestOpsCheckpointRow[], ({ contestId, ...row }) => row)
}

export function fetchContestCrew(): ContestCrewMember[] {
  return mapRows(contestData.crew as ContestCrewMemberRow[], ({ contestId, ...row }) => row)
}
