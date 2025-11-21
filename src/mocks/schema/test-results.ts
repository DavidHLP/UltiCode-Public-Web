import type { ProblemId } from "@/mocks/schema/problem";
import type {
  ProblemTestCaseInput,
  ResultStatus,
  TestCaseId,
  TestCaseInputId,
} from "@/mocks/schema/problem-detail";
import type { SubmissionStatus } from "@/mocks/schema/submission";
import type { UserId } from "@/mocks/schema/user";

export type RunResultId = string;
export type RunCaseId = string;

// Matches SQL-style run_results table
export interface RunResultRow {
  id: RunResultId;
  submission_id: string;
  problem_id: ProblemId;
  user_id: UserId;
  verdict: ResultStatus;
  runtime: string;
  memory: string;
}

// Matches SQL-style run_cases table
export interface RunCaseRow {
  id: RunCaseId;
  run_result_id: RunResultId;
  submission_test_id: string;
  test_case_id: TestCaseId;
  status: ResultStatus;
  runtime: string;
  memory: string;
  detail: string;
  output_text: string;
  expected_output_text: string;
}

// Matches SQL-style run_case_inputs table
export interface RunCaseInputRow {
  id: string;
  run_case_id: RunCaseId;
  test_case_input_id: TestCaseInputId;
  field_name: string;
  label: string;
  value: string;
}

// Composite interfaces for API responses
export interface ProblemCaseResultDetail {
  id: RunCaseId;
  runId: RunResultId;
  submissionTestId: string;
  testCaseId: TestCaseId;
  caseLabel: string;
  status: SubmissionStatus | "Pending";
  runtime: string;
  memory: string;
  detail: string;
  output: string;
  expectedOutput: string;
  inputs: ProblemTestCaseInput[];
}

export interface ProblemRunResult {
  id: RunResultId;
  submissionId: string;
  problemId: ProblemId;
  userId: UserId;
  verdict: ResultStatus;
  runtime: string;
  memory: string;
  cases: ProblemCaseResultDetail[];
}
