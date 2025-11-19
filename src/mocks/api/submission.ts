import submissionsData from '@/mocks/db/submission.json'
import type {
  SubmissionRecordRow,
  SubmissionMetricRow,
  SubmissionStatus,
  SubmissionTestCaseRow,
} from '@/mocks/schema/submission'
import type { ProblemId } from '@/mocks/schema/problem'
import type { UserId } from '@/mocks/schema/user'
import { fetchCurrentUserId } from '@/mocks/api/user'

export type { SubmissionStatus }

export type SubmissionMetric = SubmissionMetricRow
export type SubmissionTestCaseSummary = SubmissionTestCaseRow
export type SubmissionRecord = SubmissionRecordRow

const submissionRows = submissionsData.submissions as SubmissionRecordRow[]

export function fetchProblemSubmissions(problemId: ProblemId, userId?: UserId): SubmissionRecord[] {
  const uid = userId ?? fetchCurrentUserId()
  return submissionRows
    .filter((submission) => submission.problemId === problemId && submission.userId === uid)
    .map((submission) => ({ ...submission }))
}

export function fetchSubmissionById(id: string): SubmissionRecord | undefined {
  const result = submissionRows.find((submission) => submission.id === id)
  return result ? { ...result } : undefined
}
