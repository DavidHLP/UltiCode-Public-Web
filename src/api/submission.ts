import { apiGet } from "@/utils/request";
import type { SubmissionRecord } from "@/types/submission";

export async function fetchProblemSubmissions(
  problemId: number,
  userId?: string,
): Promise<SubmissionRecord[]> {
  const query = userId ? `?userId=${userId}` : "";
  return apiGet<SubmissionRecord[]>(
    `/problems/${problemId}/submissions${query}`,
  );
}

export async function fetchSubmission(
  submissionId: string,
): Promise<SubmissionRecord> {
  return apiGet<SubmissionRecord>(`/submissions/${submissionId}`);
}

export async function fetchBestSubmission(
  problemId: string,
): Promise<SubmissionRecord> {
  return apiGet<SubmissionRecord>(`/problems/${problemId}/submissions/best`);
}
