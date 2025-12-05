import type { Problem } from "@/types/problem";
import { apiGet } from "@/utils/request";

export async function fetchProblems(): Promise<Problem[]> {
  return apiGet<Problem[]>("/problems");
}

export async function fetchProblemById(id: number): Promise<Problem> {
  return apiGet<Problem>(`/problems/${id}`);
}
