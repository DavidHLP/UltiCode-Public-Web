export interface Problem {
  id: number;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  acceptance_rate: number;
  tags: string[];
  status?: 'solved' | 'attempted' | 'todo';
}
