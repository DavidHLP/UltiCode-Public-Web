import { apiGet } from "@/utils/request";
import type { Problem } from "@/types/problem";
import { mapProblem } from "@/api/problem";
import type {
  ProblemListGroup,
  ProblemListStats,
  ProblemListId,
  ProblemListItem,
} from "@/types/problem-list";

export async function fetchProblemLists(): Promise<ProblemListGroup[]> {
  return apiGet<ProblemListGroup[]>("/problem-lists");
}

export async function fetchProblemListItem(
  id: ProblemListId,
): Promise<ProblemListItem> {
  return apiGet<ProblemListItem>(`/problem-lists/${id}`);
}

export async function fetchProblemListStats(
  userId?: string,
): Promise<ProblemListStats[]> {
  const query = userId ? `?userId=${userId}` : "";
  return apiGet<ProblemListStats[]>(`/problem-lists/stats${query}`);
}

export async function fetchProblemsByListId(
  listId: ProblemListId,
  userId?: string,
): Promise<Problem[]> {
  const query = userId ? `?userId=${userId}` : "";
  const data = await apiGet<unknown[]>(
    `/problem-lists/${listId}/problems${query}`,
  );
  return data.map(mapProblem);
}
