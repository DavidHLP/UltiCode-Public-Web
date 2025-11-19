import type { ProblemId } from '@/mocks/schema/problem'
import type { ProblemTestCaseInput, ProblemTestResult } from '@/mocks/schema/problem-detail'
import type { UserId } from '@/mocks/schema/user'

export type ProblemRunResultId = string
export type ProblemCaseResultId = string

export interface ProblemRunResultRow {
  id: ProblemRunResultId
  problemId: ProblemId
  userId: UserId
  verdict: ProblemTestResult['status']
  runtime: string
  memory: string
}

export interface ProblemRunCaseRow extends ProblemTestResult {
  runId: ProblemRunResultId
  testCaseId?: string
  output: string
  expectedOutput: string
}

export interface ProblemCaseResultDetail extends ProblemRunCaseRow {
  inputs: ProblemTestCaseInput[]
}

export interface ProblemRunResult extends ProblemRunResultRow {
  cases: ProblemCaseResultDetail[]
}
