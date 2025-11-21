import { apiGet } from "@/api/client";
import type { SolutionFeedResponse } from "@/mocks/schema/solution";

export async function fetchSolutionFeed(
  problemId: number,
): Promise<SolutionFeedResponse> {
  return apiGet<SolutionFeedResponse>(`/problems/${problemId}/solutions`);
}
