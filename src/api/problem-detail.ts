import type { ProblemDetail } from "@/types/problem-detail";
import { apiGet } from "@/utils/request";

export async function fetchProblemDetailById(
  id: number | string,
): Promise<ProblemDetail> {
  return apiGet<ProblemDetail>(`/problems/${id}`);
}
