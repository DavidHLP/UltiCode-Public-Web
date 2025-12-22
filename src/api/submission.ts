import { apiGet, apiPost } from "@/utils/request";
import type { SubmissionRecord } from "@/types/submission";

// Helper to map backend snake_case to frontend camelCase
function mapSubmission(sub: unknown): SubmissionRecord {
  if (!sub || typeof sub !== "object") return sub as SubmissionRecord;
  const s = sub as Record<string, unknown>;
  return {
    ...s,
    runtimePercentile: (s.runtime_percentile ?? s.runtimePercentile) as
      | number
      | undefined,
    memoryPercentile: (s.memory_percentile ?? s.memoryPercentile) as
      | number
      | undefined,
  } as SubmissionRecord;
}

export async function fetchProblemSubmissions(
  problemId: number,
  userId?: string,
): Promise<SubmissionRecord[]> {
  const query = userId ? `?userId=${userId}` : "";
  const data = await apiGet<unknown[]>(
    `/problems/${problemId}/submissions${query}`,
  );
  return data.map(mapSubmission);
}

export async function fetchSubmission(
  submissionId: string,
): Promise<SubmissionRecord> {
  const data = await apiGet<unknown>(`/submissions/${submissionId}`);
  return mapSubmission(data);
}

export async function fetchBestSubmission(
  problemId: string,
): Promise<SubmissionRecord> {
  const data = await apiGet<unknown>(`/problems/${problemId}/submissions/best`);
  return mapSubmission(data);
}

export async function fetchUserSubmissions(
  userId: string,
): Promise<SubmissionRecord[]> {
  const data = await apiGet<unknown[]>(`/submissions?userId=${userId}`);
  return data.map(mapSubmission);
}

export async function createSubmission(
  problemId: number,
  data: { language: string; code: string },
): Promise<SubmissionRecord> {
  const response = await apiPost<unknown>(
    `/problems/${problemId}/submissions`,
    data,
  );
  return mapSubmission(response);
}
export async function fetchUserProblemStatusMap(
  userId: string,
): Promise<
  Record<
    number,
    { status: "solved" | "attempted" | "todo"; completed_time?: string }
  >
> {
  return apiGet<
    Record<
      number,
      { status: "solved" | "attempted" | "todo"; completed_time?: string }
    >
  >(`/submissions/status/map?userId=${userId}`);
}
