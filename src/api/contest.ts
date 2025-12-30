import { apiGet, apiPost, apiDelete } from "@/utils/request";
import type {
  ContestListItem,
  ContestDetail,
  ContestRankingEntry,
  ContestProblemSummary,
  GlobalRankingEntry,
  ContestStats,
  ParticipationStatus,
  VirtualContestSession,
  UserContestHistory,
  RatingHistoryEntry,
  PaginatedResult,
} from "@/types/contest";

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function mapContestListItem(data: unknown): ContestListItem {
  if (!data || typeof data !== "object") return data as ContestListItem;
  const contest = data as Record<string, unknown>;
  const base = data as ContestListItem;
  const startTime = (contest.start_time ?? contest.startTime) as
    | string
    | undefined;
  const durationMinutes = toNumber(
    contest.duration_minutes ?? contest.durationMinutes,
  );
  const endTimeRaw = (contest.end_time ?? contest.endTime) as
    | string
    | undefined;
  let endTime = endTimeRaw;

  if (!endTime && startTime && durationMinutes) {
    const startMs = new Date(startTime).getTime();
    if (!Number.isNaN(startMs)) {
      endTime = new Date(startMs + durationMinutes * 60 * 1000).toISOString();
    }
  }

  const isRated =
    typeof contest.is_rated === "boolean"
      ? contest.is_rated
      : (contest.isRated as boolean | undefined);

  return {
    ...base,
    start_time: startTime ?? (contest.start_time as string | undefined),
    duration_minutes:
      durationMinutes ?? (contest.duration_minutes as number | undefined),
    startTime,
    endTime,
    end_time: endTime ?? (contest.end_time as string | undefined),
    durationMinutes,
    type: (contest.contest_type ?? contest.type) as ContestListItem["type"],
    isRated,
    registeredCount: toNumber(
      contest.registered_count ?? contest.registeredCount,
    ),
    participantCount: toNumber(
      contest.participant_count ?? contest.participantCount,
    ),
    canRegister: (contest.can_register ??
      contest.canRegister ??
      contest.status === "upcoming") as boolean,
    canStart: (contest.can_start ??
      contest.canStart ??
      contest.status === "running") as boolean,
  } as ContestListItem;
}

function mapContestProblem(data: unknown): ContestProblemSummary {
  if (!data || typeof data !== "object") return data as ContestProblemSummary;
  const problem = data as Record<string, unknown>;
  return {
    ...problem,
    problemIndex: (problem.problem_index ?? problem.problemIndex) as
      | string
      | undefined,
    problemId: toNumber(problem.problem_id ?? problem.problemId),
    solvedCount: toNumber(problem.solved_count ?? problem.solvedCount),
    submissionCount: toNumber(
      problem.submission_count ?? problem.submissionCount,
    ),
    acceptanceRate: toNumber(problem.acceptance_rate ?? problem.acceptanceRate),
  } as ContestProblemSummary;
}

function mapContestDetail(data: unknown): ContestDetail {
  if (!data || typeof data !== "object") return data as ContestDetail;
  const contest = data as Record<string, unknown>;
  const mapped = mapContestListItem(contest) as ContestDetail;
  const problems = Array.isArray(contest.problems)
    ? contest.problems.map(mapContestProblem)
    : [];
  return {
    ...mapped,
    problems,
  };
}

// ============================================================================
// CONTEST QUERIES
// ============================================================================

export async function fetchContestList(): Promise<ContestListItem[]> {
  const result = await apiGet<{ items: ContestListItem[] }>("/contest/list");
  return (result.items || []).map(mapContestListItem);
}

export async function fetchUpcomingContests(): Promise<ContestListItem[]> {
  const result = await apiGet<ContestListItem[]>("/contest/upcoming");
  return result.map(mapContestListItem);
}

export async function fetchRunningContests(): Promise<ContestListItem[]> {
  const result = await apiGet<ContestListItem[]>("/contest/running");
  return result.map(mapContestListItem);
}

export async function fetchPastContests(
  page: number = 1,
  pageSize: number = 10,
): Promise<{ data: ContestListItem[]; total: number }> {
  const result = await apiGet<{ data: ContestListItem[]; total: number }>(
    `/contest/past?page=${page}&limit=${pageSize}`,
  );
  return {
    ...result,
    data: (result.data || []).map(mapContestListItem),
  };
}

export async function fetchContestDetail(
  contestId: string,
): Promise<ContestDetail> {
  const result = await apiGet<ContestDetail>(`/contest/${contestId}`);
  return mapContestDetail(result);
}

export async function fetchContestStats(): Promise<ContestStats> {
  return apiGet<ContestStats>("/contest/stats");
}

// ============================================================================
// RANKINGS
// ============================================================================

export async function fetchContestRanking(
  contestId: string,
  options?: { page?: number; limit?: number; includeVirtual?: boolean },
): Promise<PaginatedResult<ContestRankingEntry>> {
  const { page = 1, limit = 50, includeVirtual = true } = options || {};
  return apiGet<PaginatedResult<ContestRankingEntry>>(
    `/contest/${contestId}/ranking?page=${page}&limit=${limit}&include_virtual=${includeVirtual}`,
  );
}

export async function fetchLiveRanking(
  contestId: string,
  limit: number = 100,
): Promise<ContestRankingEntry[]> {
  return apiGet<ContestRankingEntry[]>(
    `/contest/${contestId}/live-ranking?limit=${limit}`,
  );
}

export async function fetchGlobalRankings(options?: {
  page?: number;
  limit?: number;
  country?: string;
}): Promise<PaginatedResult<GlobalRankingEntry>> {
  const { page = 1, limit = 50, country } = options || {};
  let url = `/rankings/global?page=${page}&limit=${limit}`;
  if (country) {
    url += `&country=${country}`;
  }
  return apiGet<PaginatedResult<GlobalRankingEntry>>(url);
}

// Legacy API for backward compatibility
export async function fetchGlobalRankingsLegacy(): Promise<
  GlobalRankingEntry[]
> {
  return apiGet<GlobalRankingEntry[]>("/contest/global-ranking");
}

// ============================================================================
// PARTICIPATION
// ============================================================================

export async function registerForContest(contestId: string): Promise<void> {
  return apiPost<void>(`/contest/${contestId}/register`);
}

export async function unregisterFromContest(contestId: string): Promise<void> {
  return apiDelete<void>(`/contest/${contestId}/register`);
}

export async function fetchParticipationStatus(
  contestId: string,
): Promise<ParticipationStatus> {
  return apiGet<ParticipationStatus>(`/contest/${contestId}/participation`);
}

// ============================================================================
// VIRTUAL CONTEST
// ============================================================================

export async function startVirtualContest(
  contestId: string,
): Promise<VirtualContestSession> {
  return apiPost<VirtualContestSession>(`/contest/${contestId}/virtual/start`);
}

export async function fetchVirtualSession(
  contestId: string,
): Promise<VirtualContestSession | null> {
  return apiGet<VirtualContestSession | null>(
    `/contest/${contestId}/virtual/session`,
  );
}

export async function finishVirtualContest(
  contestId: string,
  sessionId: string,
): Promise<void> {
  return apiPost<void>(`/contest/${contestId}/virtual/finish`, { sessionId });
}

// ============================================================================
// USER CONTESTS
// ============================================================================

export async function fetchUserContests(
  type: "registered" | "participated" | "virtual" = "participated",
): Promise<ContestListItem[]> {
  const result = await apiGet<ContestListItem[]>(
    `/contest/user/my-contests?type=${type}`,
  );
  return result.map(mapContestListItem);
}

export async function fetchUserContestHistory(): Promise<UserContestHistory[]> {
  return apiGet<UserContestHistory[]>("/contest/user/history");
}

export async function fetchUserRatingHistory(): Promise<RatingHistoryEntry[]> {
  return apiGet<RatingHistoryEntry[]>("/contest/user/rating-history");
}

// ============================================================================
// PUBLIC USER DATA
// ============================================================================

export async function fetchUserContestHistoryById(
  userId: string,
): Promise<UserContestHistory[]> {
  return apiGet<UserContestHistory[]>(`/rankings/user/${userId}`);
}

export async function fetchUserRatingHistoryById(
  userId: string,
): Promise<RatingHistoryEntry[]> {
  return apiGet<RatingHistoryEntry[]>(
    `/rankings/user/${userId}/rating-history`,
  );
}

// ============================================================================
// CONTEST SUBMISSIONS
// ============================================================================

export interface ContestSubmissionDto {
  language: string;
  code: string;
}

export interface ContestSubmissionResult {
  id: string;
  problem_id: number;
  user_id: string;
  language: string;
  status: string;
  runtime: number | null;
  memory: number | null;
  created_at: string;
  contest_info: {
    time_from_start: number;
    problem_index: string;
    score: number;
    is_accepted: boolean;
  };
}

/**
 * Submit code for a contest problem
 */
export async function submitContestProblem(
  contestId: string,
  problemId: number,
  dto: ContestSubmissionDto,
): Promise<ContestSubmissionResult> {
  return apiPost<ContestSubmissionResult>(
    `/contest/${contestId}/problems/${problemId}/submissions`,
    dto,
  );
}

/**
 * Get submissions for a specific contest problem
 */
export async function fetchContestProblemSubmissions(
  contestId: string,
  problemId: number,
): Promise<ContestSubmissionResult[]> {
  return apiGet<ContestSubmissionResult[]>(
    `/contest/${contestId}/problems/${problemId}/submissions`,
  );
}
