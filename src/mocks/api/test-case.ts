import type { ProblemTestCase } from '@/mocks/schema/problem-detail'
import testCaseData from '@/mocks/db/test-case.json'

const inputsByTestCaseId = testCaseData.testCaseInputs.reduce<Map<string, ProblemTestCase['inputs']>>(
  (acc, input) => {
    if (!acc.has(input.testCaseId)) {
      acc.set(input.testCaseId, [])
    }
    acc.get(input.testCaseId)!.push({
      id: input.field,
      label: input.label,
      value: input.value,
    })
    return acc
  },
  new Map(),
)

const casesByProblemId = testCaseData.testCases.reduce<Map<number, ProblemTestCase[]>>(
  (acc, testCase) => {
    if (!acc.has(testCase.problemId)) {
      acc.set(testCase.problemId, [])
    }
    acc.get(testCase.problemId)!.push({
      id: testCase.id,
      label: testCase.label,
      explanation: testCase.explanation || undefined,
      inputs: inputsByTestCaseId.get(testCase.id) ?? [],
    })
    return acc
  },
  new Map(),
)

export function fetchTestCasesByProblemId(problemId: number): ProblemTestCase[] {
  return casesByProblemId.get(problemId) ?? []
}
