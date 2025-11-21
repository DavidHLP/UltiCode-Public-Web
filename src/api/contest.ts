import { apiGet } from "@/api/client";
import type {
  ContestListItem,
  ContestDetail,
  ContestRankingEntry,
  GlobalRankingEntry,
  ContestStats,
} from "@/mocks/schema/contest";

/**
 * 获取所有竞赛列表
 */
export async function fetchContestList(): Promise<ContestListItem[]> {
  return apiGet<ContestListItem[]>("/contest/list");
}

/**
 * 获取即将开始的竞赛
 */
export async function fetchUpcomingContests(): Promise<ContestListItem[]> {
  return apiGet<ContestListItem[]>("/contest/upcoming");
}

/**
 * 获取正在进行的竞赛
 */
export async function fetchRunningContests(): Promise<ContestListItem[]> {
  return apiGet<ContestListItem[]>("/contest/running");
}

/**
 * 获取已结束的竞赛(往届竞赛)
 */
export async function fetchPastContests(): Promise<ContestListItem[]> {
  return apiGet<ContestListItem[]>("/contest/past");
}

/**
 * 根据 ID 获取竞赛详情
 */
export async function fetchContestDetail(
  contestId: string,
): Promise<ContestDetail> {
  return apiGet<ContestDetail>(`/contest/${contestId}`);
}

/**
 * 获取竞赛排行榜
 */
export async function fetchContestRanking(
  contestId: string,
): Promise<ContestRankingEntry[]> {
  return apiGet<ContestRankingEntry[]>(`/contest/${contestId}/ranking`);
}

/**
 * 获取全球排名榜
 */
export async function fetchGlobalRankings(): Promise<GlobalRankingEntry[]> {
  return apiGet<GlobalRankingEntry[]>("/contest/global-ranking");
}

/**
 * 获取竞赛统计信息
 */
export async function fetchContestStats(): Promise<ContestStats> {
  return apiGet<ContestStats>("/contest/stats");
}
