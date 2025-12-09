import type { Problem } from "./problem";

export interface ProblemList {
  id: string;
  name: string;
  description: string;
  problem_count: number;
  problems?: Problem[];
}

export interface ProblemListGroup {
  id: string;
  name: string;
  lists: ProblemList[];
}

export interface ProblemListStats {
  listId: string;
  totalCount: number;
  solvedCount: number;
  attemptedCount: number;
  todoCount: number;
  progress: number;
  total_lists?: number; // Keep these if needed for other components
  total_problems?: number;
}

export type ProblemListId = string;

export interface ProblemListItem {
  id: number | string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  title?: string; // Keep title if used elsewhere, but component uses name
  difficulty?: "Easy" | "Medium" | "Hard";
}
