import { apiGet } from "@/utils/request";
import type { SubmissionRecord } from "@/types/submission";

export async function fetchProblemSubmissions(
  problemId: number,
): Promise<SubmissionRecord[]> {
  return apiGet<SubmissionRecord[]>(`/problems/${problemId}/submissions`);
}
