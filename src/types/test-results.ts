export interface ProblemRunResult {
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
  runtime: number;
  memory: number;
  passed_cases: number;
  total_cases: number;
  error_message?: string;
}
