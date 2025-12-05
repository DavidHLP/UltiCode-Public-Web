import type { Problem } from './problem';

export interface ProblemDetail extends Problem {
  content: string;
  examples: any[];
  constraints: string[];
}
