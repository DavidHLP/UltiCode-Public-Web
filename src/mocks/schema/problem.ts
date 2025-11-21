export type ProblemId = number;
export type ProblemTagId = string;
export type ProblemStatus = "solved" | "attempted" | "todo";
export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

// Matches SQL: problems table
export interface ProblemRow {
  id: number; // BIGINT PRIMARY KEY
  slug: string; // VARCHAR(120) NOT NULL
  title: string; // VARCHAR(255) NOT NULL
  difficulty: ProblemDifficulty; // ENUM ('Easy','Medium','Hard') NOT NULL
  acceptance_rate: number; // DECIMAL(5,2) NOT NULL DEFAULT 0
  status: ProblemStatus; // ENUM ('solved','attempted','todo') NOT NULL DEFAULT 'todo'
  is_premium: boolean; // TINYINT(1) NOT NULL DEFAULT 0
  has_solution: boolean; // TINYINT(1) NOT NULL DEFAULT 0
  completed_time?: string | null; // DATE NULL
}

// Matches SQL: problem_tags table
export interface ProblemTagRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  label: string; // VARCHAR(120) NOT NULL
}

// Matches SQL: problem_tag_relations table
export interface ProblemTagRelationRow {
  problem_id: number; // BIGINT NOT NULL (FK to problems.id)
  tag_id: string; // VARCHAR(40) NOT NULL (FK to problem_tags.id)
}

// Composite interface for API responses
export interface Problem extends Omit<ProblemRow, "acceptance_rate" | "is_premium" | "has_solution" | "completed_time"> {
  acceptanceRate: number;
  isPremium: boolean;
  hasSolution: boolean;
  completedTime?: string | null;
  tags: string[];
}
