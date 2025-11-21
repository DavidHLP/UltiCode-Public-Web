import submissionsData from "@/mocks/db/submission";
import type {
  SubmissionRow,
  SubmissionTestRow,
  SubmissionRecordRow,
  SubmissionMetricRow,
  SubmissionStatus,
  SubmissionTestCaseRow,
} from "@/mocks/schema/submission";
import type { ProblemId } from "@/mocks/schema/problem";
import type { UserId } from "@/mocks/schema/user";
import { fetchCurrentUserId } from "@/mocks/api/user";

export type { SubmissionStatus };

export type SubmissionMetric = SubmissionMetricRow;
export type SubmissionTestCaseSummary = SubmissionTestCaseRow;
export type SubmissionRecord = SubmissionRecordRow;

const submissionRows = submissionsData.submissions as SubmissionRow[];
const submissionTests = submissionsData.submission_tests as SubmissionTestRow[];

// Build a map of submission tests by submission_id
const testsBySubmissionId = submissionTests.reduce<
  Map<string, SubmissionTestCaseRow[]>
>((acc, test) => {
  if (!acc.has(test.submission_id)) {
    acc.set(test.submission_id, []);
  }
  acc.get(test.submission_id)!.push({
    id: test.id,
    label: test.label,
    status: test.status,
    runtime: test.runtime,
  });
  return acc;
}, new Map());

// Transform SubmissionRow to SubmissionRecordRow
function transformSubmission(row: SubmissionRow): SubmissionRecordRow {
  return {
    id: row.id,
    problemId: row.problem_id,
    userId: row.user_id,
    status: row.status,
    runtime: row.runtime,
    memory: row.memory,
    language: row.language,
    submittedAt: row.submitted_at,
    runtimePercentile: row.runtime_percentile,
    memoryPercentile: row.memory_percentile,
    code: row.code,
    tags: Array.isArray(row.tags_json) ? row.tags_json : [],
    notes: row.notes || undefined,
    metrics: [], // Metrics are computed elsewhere or not stored in DB
    tests: testsBySubmissionId.get(row.id) ?? [],
    runtimeDist: Array.isArray(row.runtime_dist) ? row.runtime_dist : undefined,
    runtimeDistBinsMs: Array.isArray(row.runtime_dist_bins)
      ? row.runtime_dist_bins
      : undefined,
  };
}

export function fetchProblemSubmissions(
  problemId: ProblemId,
  userId?: UserId,
): SubmissionRecord[] {
  const uid = userId ?? fetchCurrentUserId();
  return submissionRows
    .filter(
      (submission) =>
        submission.problem_id === problemId && submission.user_id === uid,
    )
    .map(transformSubmission);
}

export function fetchSubmissionById(id: string): SubmissionRecord | undefined {
  const result = submissionRows.find((submission) => submission.id === id);
  return result ? transformSubmission(result) : undefined;
}
