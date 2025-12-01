import type { ProblemId } from "@/mocks/schema/problem";

export type ProblemListGroupId = string;
export type ProblemListId = string;

// Matches SQL: problem_list_groups table
export interface ProblemListGroupRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  name: string; // VARCHAR(120) NOT NULL
  sort_order: number; // INT NOT NULL DEFAULT 0
}

// Matches SQL: problem_lists table
export interface ProblemListRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  group_id: string; // VARCHAR(40) NOT NULL (FK to problem_list_groups.id)
  name: string; // VARCHAR(120) NOT NULL
  description?: string | null; // TEXT
  author_id: string; // VARCHAR(40) NOT NULL
  is_public: boolean; // TINYINT(1) NOT NULL DEFAULT 1
  created_at: string; // DATETIME NOT NULL
  updated_at: string; // DATETIME NOT NULL
}

// Matches SQL: problem_list_relations table
export interface ProblemListRelationRow {
  list_id: string; // VARCHAR(40) NOT NULL (FK to problem_lists.id)
  problem_id: number; // BIGINT NOT NULL (FK to problems.id)
}

// Matches SQL: problem_list_saved_relations table
export interface ProblemListSavedRelationRow {
  user_id: string; // VARCHAR(40) NOT NULL
  list_id: string; // VARCHAR(40) NOT NULL (FK to problem_lists.id)
}

// Matches SQL: problem_list_favorite_relations table
export interface ProblemListFavoriteRelationRow {
  user_id: string; // VARCHAR(40) NOT NULL
  list_id: string; // VARCHAR(40) NOT NULL (FK to problem_lists.id)
}

// Composite interfaces for API responses
export interface ProblemListItem
  extends Omit<
    ProblemListRow,
    "group_id" | "created_at" | "updated_at" | "author_id"
  > {
  problemCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProblemList {
  name: string;
  items: ProblemListItem[];
}

export interface ProblemListDetail
  extends Omit<ProblemListRow, "group_id" | "created_at" | "updated_at"> {
  problemIds: ProblemId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProblemListStats {
  listId: ProblemListId;
  totalCount: number;
  solvedCount: number;
  attemptedCount: number;
  todoCount: number;
  progress: number;
}
