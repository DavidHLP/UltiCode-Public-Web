export interface SubmissionRecord {
  id: string;
  problem_id: number;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
  language: string;
  runtime: number;
  memory: number;
  created_at: string;
}
