import type {
  ProblemRunResult,
  RunCaseInputRow,
  RunCaseRow,
  RunResultRow,
} from '@/mocks/schema/test-results'
import testResultData from '@/mocks/db/test-results.json'
import testCaseData from '@/mocks/db/test-case.json'
import submissionData from '@/mocks/db/submission.json'
import type { TestCaseInputRow, TestCaseRow } from '@/mocks/schema/problem-detail'
import type { SubmissionRow } from '@/mocks/schema/submission'
import type { UserId } from '@/mocks/schema/user'
import { fetchCurrentUserId } from '@/mocks/api/user'

const runResults = testResultData.run_results as RunResultRow[]
const runCases = testResultData.run_cases as RunCaseRow[]
const runCaseInputs = testResultData.run_case_inputs as RunCaseInputRow[]

const testCases = testCaseData.test_cases as TestCaseRow[]
const testCaseInputs = testCaseData.test_case_inputs as TestCaseInputRow[]
const submissions = submissionData.submissions as SubmissionRow[]

const submissionById = new Map(submissions.map((row) => [row.id, row]))
const testCaseById = new Map(testCases.map((row) => [row.id, row]))
const testCaseInputById = new Map(testCaseInputs.map((row) => [row.id, row]))

const inputsByRunCaseId = runCaseInputs.reduce<
  Map<string, Array<{ id: string; fieldName: string; label: string; value: string }>>
>((acc, input) => {
  if (!acc.has(input.run_case_id)) {
    acc.set(input.run_case_id, [])
  }
  const boundInput = testCaseInputById.get(input.test_case_input_id)
  acc.get(input.run_case_id)!.push({
    id: input.test_case_input_id,
    fieldName: input.field_name,
    label: input.label ?? boundInput?.label ?? input.field_name,
    value: input.value,
  })
  return acc
}, new Map())

const casesByRunId = runCases.reduce<Map<string, ProblemRunResult['cases']>>((acc, runCase) => {
  if (!acc.has(runCase.run_result_id)) {
    acc.set(runCase.run_result_id, [])
  }
  const testCase = testCaseById.get(runCase.test_case_id)
  const caseLabel = testCase?.label ?? runCase.test_case_id

  acc.get(runCase.run_result_id)!.push({
    id: runCase.id,
    runId: runCase.run_result_id,
    submissionTestId: runCase.submission_test_id,
    testCaseId: runCase.test_case_id,
    caseLabel,
    status: runCase.status,
    runtime: runCase.runtime,
    memory: runCase.memory,
    detail: runCase.detail,
    output: runCase.output_text,
    expectedOutput: runCase.expected_output_text,
    inputs: inputsByRunCaseId.get(runCase.id) ?? [],
  })
  return acc
}, new Map())

const runResultsByProblemId = runResults.reduce<Map<number, RunResultRow[]>>(
  (acc, run) => {
    if (!acc.has(run.problem_id)) {
      acc.set(run.problem_id, [])
    }
    acc.get(run.problem_id)!.push(run)
    return acc
  },
  new Map(),
)

function buildRunSortKey(row: RunResultRow): number {
  const submission = submissionById.get(row.submission_id)
  const submittedAt = submission?.submitted_at
  return submittedAt ? Date.parse(submittedAt) : 0
}

export function fetchProblemRunResultByProblemId(
  problemId: number,
  userId?: UserId,
): ProblemRunResult | null {
  const uid = userId ?? fetchCurrentUserId()
  const grouped = runResultsByProblemId.get(problemId)
  if (!grouped) return null

  const runRow = grouped
    .filter((row) => row.user_id === uid)
    .sort((a, b) => buildRunSortKey(b) - buildRunSortKey(a))[0]

  if (!runRow) return null

  return {
    id: runRow.id,
    submissionId: runRow.submission_id,
    problemId: runRow.problem_id,
    userId: runRow.user_id,
    verdict: runRow.verdict,
    runtime: runRow.runtime,
    memory: runRow.memory,
    cases: (casesByRunId.get(runRow.id) ?? []).slice(),
  }
}
