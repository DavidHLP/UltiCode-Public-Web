import { apiPost } from "@/utils/request";

export enum VoteTargetType {
  SOLUTION = "SOLUTION",
  SOLUTION_COMMENT = "SOLUTION_COMMENT",
  FORUM_POST = "FORUM_POST",
  FORUM_COMMENT = "FORUM_COMMENT",
}

export interface VoteResponse {
  likes: number;
  dislikes: number;
  userVote: 0 | 1 | -1;
}

export const vote = async (
  targetType: VoteTargetType,
  targetId: string,
  voteType: 1 | -1,
): Promise<VoteResponse> => {
  return apiPost<VoteResponse>(`/votes`, {
    targetType,
    targetId,
    voteType,
  });
};
