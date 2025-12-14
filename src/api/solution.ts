import { apiGet } from "@/utils/request";
import type { SolutionFeedResponse } from "@/types/solution";
export type { SolutionFeedResponse };

export async function fetchSolutionFeed(
  problemId: number,
): Promise<SolutionFeedResponse> {
  return apiGet<SolutionFeedResponse>(`/problems/${problemId}/solutions`);
}

export async function fetchUserSolutions(
  userId: string,
): Promise<SolutionFeedResponse> {
  return apiGet<SolutionFeedResponse>(`/solutions?userId=${userId}`);
}
