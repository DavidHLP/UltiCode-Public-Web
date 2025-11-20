import type {
  ContestEvent,
  ContestEventRow,
  ContestFaqItem,
  ContestFaqRow,
  ContestInsight,
  ContestInsightRow,
  ContestLeaderboardEntry,
  ContestLeaderboardRow,
  ContestOpsCheckpoint,
  ContestOpsCheckpointRow,
  ContestResource,
  ContestResourceRow,
  ContestTrack,
  ContestTrackRow,
  ContestCrewMember,
  ContestCrewRow,
  ContestRow,
} from "@/mocks/schema/contest";
import contestData from "@/mocks/db/contest.json";

const contests = contestData.contests as ContestRow[];
const schedule = contestData.contest_events as ContestEventRow[];

// Get the main contest and its featured event
const mainContest = contests[0];
if (!mainContest) {
  throw new Error("Contest dataset is empty");
}

const derivedFeaturedContest =
  schedule.find((event) => event.id === mainContest.featured_event_id) ??
  schedule[0];

if (!derivedFeaturedContest) {
  throw new Error("Contest events dataset is empty");
}
const featuredContest = derivedFeaturedContest;

const mapRows = <T extends { contest_id: string }, O>(
  rows: T[],
  mapper: (row: T) => O
): O[] =>
  rows.filter((row) => row.contest_id === featuredContest.id).map(mapper);

export function fetchContestFeaturedEvent(): ContestEventRow {
  return featuredContest;
}

export function fetchContestInsights(): ContestInsight[] {
  return mapRows(
    contestData.contest_insights as ContestInsightRow[],
    ({ contest_id, ...row }) => {
      void contest_id;
      return row;
    }
  );
}

export function fetchContestSchedule(): ContestEventRow[] {
  return schedule;
}

export function fetchContestLeaderboard(): ContestLeaderboardEntry[] {
  return mapRows(
    contestData.contest_leaderboard as ContestLeaderboardRow[],
    ({ contest_id, ...row }) => {
      void contest_id;
      return row;
    }
  );
}

export function fetchContestTracks(): ContestTrack[] {
  return mapRows(
    contestData.contest_tracks as ContestTrackRow[],
    ({ contest_id, ...row }) => {
      void contest_id;
      return row;
    }
  );
}

export function fetchContestResources(): ContestResource[] {
  return mapRows(
    contestData.contest_resources as ContestResourceRow[],
    ({ contest_id, ...row }) => {
      void contest_id;
      return row;
    }
  );
}

export function fetchContestFaq(): ContestFaqItem[] {
  return mapRows(
    contestData.contest_faq as ContestFaqRow[],
    ({ contest_id, ...row }) => {
      void contest_id;
      return row;
    }
  );
}

export function fetchContestOpsCheckpoints(): ContestOpsCheckpoint[] {
  return mapRows(
    contestData.contest_ops_checkpoints as ContestOpsCheckpointRow[],
    ({ contest_id, ...row }) => {
      void contest_id;
      return row;
    }
  );
}

export function fetchContestCrew(): ContestCrewMember[] {
  return mapRows(
    contestData.contest_crew as ContestCrewRow[],
    ({ contest_id, ...row }) => {
      void contest_id;
      return row;
    }
  );
}
