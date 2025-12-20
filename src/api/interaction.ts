import { apiGet, apiPost } from "@/utils/request";

export enum FavoriteTargetType {
  SOLUTION = "SOLUTION",
  FORUM_POST = "FORUM_POST",
  PROBLEM = "PROBLEM",
}

export enum VoteTargetType {
  SOLUTION = "SOLUTION",
  SOLUTION_COMMENT = "SOLUTION_COMMENT",
  FORUM_POST = "FORUM_POST",
  FORUM_COMMENT = "FORUM_COMMENT",
  PROBLEM = "PROBLEM",
}

export async function toggleFavorite(
  targetType: FavoriteTargetType,
  targetId: string,
): Promise<{ isFavorited: boolean }> {
  return apiPost<{ isFavorited: boolean }>("/favorites/toggle", {
    targetType,
    targetId,
  });
}

export async function toggleVote(
  targetType: VoteTargetType,
  targetId: string,
  voteType: number,
): Promise<{ likes: number; dislikes: number; userVote: number }> {
  return apiPost<{ likes: number; dislikes: number; userVote: number }>(
    "/votes",
    {
      targetType,
      targetId,
      voteType,
    },
  );
}

export async function fetchProblemNote(
  problemId: number,
): Promise<{ content: string } | null> {
  return apiGet<{ content: string } | null>(`/problems/${problemId}/note`);
}

export async function saveProblemNote(
  problemId: number,
  content: string,
): Promise<{ content: string }> {
  return apiPost<{ content: string }>(`/problems/${problemId}/note`, {
    content,
  });
}
