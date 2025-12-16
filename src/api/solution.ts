import { apiGet, apiPost } from "@/utils/request";
import type { SolutionFeedResponse } from "@/types/solution";
import type { ForumComment } from "@/types/forum";
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

export async function fetchSolutionComments(
  solutionId: string,
): Promise<ForumComment[]> {
  return apiGet<ForumComment[]>(`/solutions/${solutionId}/comments`);
}

export async function createSolutionComment(
  solutionId: string,
  content: string,
  parentId?: string,
): Promise<ForumComment> {
  return apiPost<ForumComment>(`/solutions/${solutionId}/comments`, {
    content,
    parentId,
    userId: "user-1", // TODO: Replace with actual auth user ID
  });
}
