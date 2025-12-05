export interface SubmissionTestRecord {
  id: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
  runtime: number;
  memory: number;
}

export interface SubmissionRecord {
  id: string;
  problem_id: number;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
  language: string;
  runtime: number;
  memory: number;
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
