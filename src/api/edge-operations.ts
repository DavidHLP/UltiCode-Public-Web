import { apiPost } from "@/utils/request";

export enum EdgeOperationType {
  VOTE_UP = "VOTE_UP",
  VOTE_DOWN = "VOTE_DOWN",
  FAVORITE = "FAVORITE",
  CHARGE = "CHARGE",
  ANALYZE = "ANALYZE",
}

export enum EdgeOperationTargetType {
  SOLUTION = "SOLUTION",
  SOLUTION_COMMENT = "SOLUTION_COMMENT",
  FORUM_POST = "FORUM_POST",
  FORUM_COMMENT = "FORUM_COMMENT",
  PROBLEM = "PROBLEM",
}

export interface EdgeOperationResponse {
  likes: number;
  dislikes: number;
  favorites: number;
  userOperation: EdgeOperationType | null;
}

export const operateEdgeOperation = async (
  operationType: EdgeOperationType,
  targetType: EdgeOperationTargetType,
  targetId: string,
): Promise<EdgeOperationResponse> => {
  return apiPost<EdgeOperationResponse>(`/edge-operations`, {
    operationType,
    targetType,
    targetId,
  });
};
