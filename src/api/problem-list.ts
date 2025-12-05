import { apiGet } from "@/utils/request";
import type { Problem } from "@/types/problem";
import type {
  ProblemList,
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

export async function fetchProblemListStats(): Promise<ProblemListStats[]> {
  return apiGet<ProblemListStats[]>("/problem-lists/stats");
}

export async function fetchProblemsByListId(
  listId: ProblemListId,
): Promise<Problem[]> {
  return apiGet<Problem[]>(`/problem-lists/${listId}/problems`);
}
