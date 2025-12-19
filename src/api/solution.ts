import { apiGet, apiPost } from "@/utils/request";
import type { SolutionFeedResponse } from "@/types/solution";
import type { ForumComment } from "@/types/forum";
import { fetchCurrentUserId } from "@/utils/auth";
export type { SolutionFeedResponse };

export async function fetchSolutionFeed(
  problemId: number,
  userId?: string,
): Promise<SolutionFeedResponse> {
  const url = userId
    ? `/problems/${problemId}/solutions?userId=${userId}`
    : `/problems/${problemId}/solutions`;
  return apiGet<SolutionFeedResponse>(url);
}

export async function fetchUserSolutions(
  userId: string,
): Promise<SolutionFeedResponse> {
  return apiGet<SolutionFeedResponse>(`/solutions?userId=${userId}`);
}

export async function fetchSolutionComments(
  solutionId: string,
  userId?: string,
): Promise<ForumComment[]> {
  const url = userId
    ? `/solutions/${solutionId}/comments?userId=${userId}`
    : `/solutions/${solutionId}/comments`;
  return apiGet<ForumComment[]>(url);
}

export async function createSolutionComment(
  solutionId: string,
  content: string,
  parentId?: string,
): Promise<ForumComment> {
  const userId = fetchCurrentUserId();
  if (!userId) {
    throw new Error("User must be logged in to create comments");
  }
  return apiPost<ForumComment>(`/solutions/${solutionId}/comments`, {
    content,
    parentId,
  });
}

export async function voteSolution(
  solutionId: string,
  voteType: 1 | -1 | 0,
): Promise<{ likes: number; dislikes: number }> {
  return apiPost<{ likes: number; dislikes: number }>(
    `/solutions/${solutionId}/vote`,
    {
      voteType,
    },
  );
}

export async function voteSolutionComment(
  commentId: string,
  voteType: 1 | -1 | 0,
): Promise<{ likes: number; dislikes: number }> {
  return apiPost<{ likes: number; dislikes: number }>(
    `/solutions/comments/${commentId}/vote`,
    {
      voteType,
    },
  );
}

export async function recordSolutionView(solutionId: string) {
  const userId = fetchCurrentUserId();
  if (!userId) return;
  return apiPost(`/views/solution/${solutionId}`, { userId });
}
