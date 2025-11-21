import { apiGet } from "@/api/client";
import type { ProblemRunResult } from "@/mocks/schema/test-results";

export async function fetchProblemRunResultByProblemId(
  problemId: number,
): Promise<ProblemRunResult | null> {
  return apiGet<ProblemRunResult | null>(`/problems/${problemId}/results`);
}
