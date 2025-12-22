import type { Problem } from "./problem";

export interface ProblemList {
  id: string;
  name: string;
  description?: string;
  problemCount: number;
  problems?: Problem[];
}

export interface ProblemListGroup {
  id: string;
  name: string;
  sortOrder?: number;
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
  id: string;
  name: string;
  description?: string;
  authorId?: string;
  groupId?: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
