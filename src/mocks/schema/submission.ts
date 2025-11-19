import type { ProblemId } from '@/mocks/schema/problem'
import type { ProblemSubmission } from '@/mocks/schema/problem-detail'
import type { UserId } from '@/mocks/schema/user'

export type SubmissionStatus = ProblemSubmission['status']

export interface SubmissionMetricRow {
  label: string
  value: string
  helper?: string
}

export interface SubmissionTestCaseRow {
  id: string
  label: string
  status: SubmissionStatus
  runtime: string
}

export interface SubmissionRecordRow extends ProblemSubmission {
  problemId: ProblemId
  userId: UserId
  runtimePercentile: number
  memoryPercentile: number
  code: string
  tags: string[]
  notes?: string
  metrics: SubmissionMetricRow[]
  tests: SubmissionTestCaseRow[]
  // Optional performance distribution data (counts per bin)
  runtimeDist?: number[]
  // Optional bin labels (ms) matching runtimeDist length
  runtimeDistBinsMs?: number[]
}

export type SubmissionRecord = SubmissionRecordRow
