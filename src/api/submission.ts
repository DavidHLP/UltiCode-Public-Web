import { apiGet } from "@/api/client";
import type { SubmissionRecord } from "@/mocks/schema/submission";

export async function fetchProblemSubmissions(
  problemId: number,
): Promise<SubmissionRecord[]> {
  return apiGet<SubmissionRecord[]>(`/problems/${problemId}/submissions`);
}
