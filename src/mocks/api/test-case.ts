import type { ProblemTestCase } from "@/mocks/schema/problem-detail";
import type {
  TestCaseRow,
  TestCaseInputRow,
} from "@/mocks/schema/problem-detail";
import testCaseData from "@/mocks/db/test-case.json";

const testCases = testCaseData.test_cases as TestCaseRow[];
const testCaseInputs = testCaseData.test_case_inputs as TestCaseInputRow[];

const inputsByTestCaseId = testCaseInputs.reduce<
  Map<string, ProblemTestCase["inputs"]>
>((acc, input) => {
  if (!acc.has(input.test_case_id)) {
    acc.set(input.test_case_id, []);
  }
  acc.get(input.test_case_id)!.push({
    id: input.id,
    fieldName: input.field_name,
    label: input.label,
    value: input.value,
  });
  return acc;
}, new Map());

const casesByProblemId = testCases.reduce<Map<number, ProblemTestCase[]>>(
  (acc, testCase) => {
    if (!acc.has(testCase.problem_id)) {
      acc.set(testCase.problem_id, []);
    }
    acc.get(testCase.problem_id)!.push({
      id: testCase.id,
      label: testCase.label,
      explanation: testCase.explanation || undefined,
      inputs: inputsByTestCaseId.get(testCase.id) ?? [],
    });
    return acc;
  },
  new Map()
);

export function fetchTestCasesByProblemId(
  problemId: number
): ProblemTestCase[] {
  return casesByProblemId.get(problemId) ?? [];
}
