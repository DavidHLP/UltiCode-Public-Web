export interface ProblemRunCase {
  id: string;
  runId: string;
  submissionTestId: string;
  testCaseId: string;
  caseLabel: string;
  status:
    | "Accepted"
    | "Wrong Answer"
    | "Time Limit Exceeded"
    | "Runtime Error"
    | "Compile Error"
    | "Pending";
  runtime: string;
  memory: string;
  detail?: string;
  output?: string;
  expectedOutput?: string;
  inputs?: { id: string; label: string; name: string; value: string }[];
}

export type ProblemCaseResultDetail = ProblemRunCase;

export interface ProblemRunResult {
  id: string;
  submissionId: string;
  problemId: number;
  userId: string;
  verdict:
    | "Accepted"
    | "Wrong Answer"
    | "Time Limit Exceeded"
    | "Runtime Error"
    | "Compile Error"
    | "Pending";
  runtime: string;
  memory: string;
  cases: ProblemRunCase[];
  // Legacy or optional fields
  passed_cases?: number;
  total_cases?: number;
  error_message?: string;
}
