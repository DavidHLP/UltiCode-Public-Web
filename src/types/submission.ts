export interface SubmissionTestRecord {
  id: string;
  status: "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Runtime Error";
  runtime: number;
  memory: number;
}

export interface SubmissionRecord {
  id: string;
  problem_id: number;
  status: "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Runtime Error" | "Compile Error";
  language: string;
  runtime: number;
  memory: number;
  compiler_error?: string;
  input?: string;
  output?: string;
  expected_output?: string;
  created_at: string;
  submittedAt?: string; // alias
  notes?: string;
  code?: string;
  runtimeDistBinsMs?: { min: number; max: number; count: number }[];
  runtimeDist?: { distribution: [number, number][] };
  runtimePercentile?: number;
  memoryPercentile?: number;
  tests?: SubmissionTestRecord[];
}
