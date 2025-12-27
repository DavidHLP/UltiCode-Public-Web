import { apiGet, apiPost, apiDelete } from "@/utils/request";
import type {
  ContestListItem,
  ContestDetail,
  ContestRankingEntry,
  GlobalRankingEntry,
  ContestStats,
  ParticipationStatus,
  VirtualContestSession,
  UserContestHistory,
  RatingHistoryEntry,
  PaginatedResult,
} from "@/types/contest";

// ============================================================================
// CONTEST QUERIES
// ============================================================================

export async function fetchContestList(): Promise<ContestListItem[]> {
  const result = await apiGet<{ items: ContestListItem[] }>("/contest/list");
  return result.items || [];
}

export async function fetchUpcomingContests(): Promise<ContestListItem[]> {
  return apiGet<ContestListItem[]>("/contest/upcoming");
}

export async function fetchRunningContests(): Promise<ContestListItem[]> {
  return apiGet<ContestListItem[]>("/contest/running");
}

export async function fetchPastContests(
  page: number = 1,
  pageSize: number = 10,
): Promise<{ data: ContestListItem[]; total: number }> {
  return apiGet<{ data: ContestListItem[]; total: number }>(
    `/contest/past?page=${page}&limit=${pageSize}`,
  );
}

export async function fetchContestDetail(
  contestId: string,
): Promise<ContestDetail> {
  return apiGet<ContestDetail>(`/contest/${contestId}`);
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
  return apiGet<ContestListItem[]>(`/contest/user/my-contests?type=${type}`);
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
