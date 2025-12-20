import type { Problem } from "@/types/problem";
import { apiGet } from "@/utils/request";

export async function fetchProblems(): Promise<Problem[]> {
  return apiGet<Problem[]>("/problems");
}

export async function fetchProblemById(id: string | number): Promise<Problem> {
  return apiGet<Problem>(`/problems/${id}`);
}

export async function fetchRandomProblem(): Promise<Problem> {
  return apiGet<Problem>("/problems/random");
}

export async function fetchAdjacentProblems(
  id: number,
): Promise<{ prev: string | null; next: string | null }> {
  return apiGet<{ prev: string | null; next: string | null }>(
    `/problems/${id}/adjacent`,
  );
}
