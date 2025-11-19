import type { ProblemRunResult } from '@/mocks/schema/test-results'
import testResultData from '@/mocks/db/test-results.json'
import type { ProblemTestCaseInput, ResultStatus } from '@/mocks/schema/problem-detail'
import type { UserId } from '@/mocks/schema/user'
import { fetchCurrentUserId } from '@/mocks/api/user'

const inputsByCaseId = testResultData.runCaseInputs.reduce<Map<string, ProblemTestCaseInput[]>>(
  (acc, input) => {
    if (!acc.has(input.runCaseId)) {
      acc.set(input.runCaseId, [])
    }
    acc.get(input.runCaseId)!.push({
      id: input.field,
      label: input.label,
      value: input.value,
    })
    return acc
  },
  new Map(),
)

const casesByRunId = testResultData.runCases.reduce<Map<string, ProblemRunResult['cases']>>(
  (acc, runCase) => {
    if (!acc.has(runCase.runId)) {
      acc.set(runCase.runId, [])
    }
    acc.get(runCase.runId)!.push({
      id: runCase.id,
      runId: runCase.runId,
      caseLabel: runCase.caseLabel,
      status: runCase.status as ResultStatus,
      runtime: runCase.runtime,
      memory: runCase.memory,
      detail: runCase.detail,
      output: runCase.output,
      expectedOutput: runCase.expectedOutput,
      inputs: inputsByCaseId.get(runCase.id) ?? [],
    })
    return acc
  },
  new Map(),
)

// Group results by problem, multiple users may have runs for the same problem
const runResultsByProblemId = testResultData.runResults.reduce<Map<number, ProblemRunResult[]>>(
  (acc, run) => {
    if (!acc.has(run.problemId)) acc.set(run.problemId, [])
    acc.get(run.problemId)!.push({
      id: run.id,
      problemId: run.problemId,
      userId: run.userId,
      verdict: run.verdict as ResultStatus,
      runtime: run.runtime,
      memory: run.memory,
      cases: casesByRunId.get(run.id) ?? [],
    })
    return acc
  },
  new Map(),
)

export function fetchProblemRunResultByProblemId(
  problemId: number,
  userId?: UserId,
): ProblemRunResult | null {
  const uid = userId ?? fetchCurrentUserId()
  const runs = runResultsByProblemId.get(problemId) ?? []
  return runs.find((r) => r.userId === uid) ?? null
}
