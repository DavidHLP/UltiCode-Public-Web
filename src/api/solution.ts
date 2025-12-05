import { apiGet } from "@/utils/request";
import type { SolutionFeedResponse } from "@/types/solution";

export async function fetchSolutionFeed(
  problemId: number,
): Promise<SolutionFeedResponse> {
  return apiGet<SolutionFeedResponse>(`/problems/${problemId}/solutions`);
}
