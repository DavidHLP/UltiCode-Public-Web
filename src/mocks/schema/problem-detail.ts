import type { Problem, ProblemId } from "@/mocks/schema/problem";

export type ProblemDetailId = string;
export type ProblemExampleId = string;
export type ProblemApproachId = string;
export type ProblemSubmissionId = string;
export type ProblemLanguageId = string;
export type ProblemStarterNoteId = string;
export type TestCaseId = string;
export type TestCaseInputId = string;

export type SubmissionStatus =
  | "Accepted"
  | "Wrong Answer"
  | "Runtime Error"
  | "Time Limit Exceeded";
export type ResultStatus = SubmissionStatus | "Pending";
export type ProblemReaction = "like" | "dislike" | null;

export interface ProblemInteractionCounts {
  likes: number;
  dislikes: number;
  favorites: number;
}

export interface ProblemInteractionSnapshot {
  counts: ProblemInteractionCounts;
  viewer: {
    reaction: ProblemReaction;
    isFavorite: boolean;
  };
}

// Matches SQL: problem_details table
export interface ProblemDetailRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  problem_id: number; // BIGINT NOT NULL UNIQUE (FK to problems.id)
  slug: string; // VARCHAR(120) NOT NULL
  summary: string; // TEXT NOT NULL
  companies?: any | null; // JSON
  difficulty_rating: number; // DECIMAL(4,1) NOT NULL DEFAULT 1500
  updated_at: string; // DATETIME NOT NULL
  follow_up?: string | null; // TEXT
  constraints_json: any; // JSON NOT NULL
}

// Matches SQL: problem_examples table
export interface ProblemExampleRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  problem_id: number; // BIGINT NOT NULL (FK to problems.id)
  example_order: number; // INT NOT NULL DEFAULT 0
  input_text: string; // TEXT NOT NULL
  output_text: string; // TEXT NOT NULL
  explanation?: string | null; // TEXT
}

// Matches SQL: problem_approaches table
export interface ProblemApproachRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  problem_id: number; // BIGINT NOT NULL (FK to problems.id)
  title: string; // VARCHAR(255) NOT NULL
  summary: string; // TEXT NOT NULL
  time_complexity: string; // VARCHAR(32) NOT NULL
  space_complexity: string; // VARCHAR(32) NOT NULL
  code_snippet: string; // MEDIUMTEXT NOT NULL
  language: string; // VARCHAR(40) NOT NULL
}

// Matches SQL: problem_approach_steps table
export interface ProblemApproachStepRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  approach_id: string; // VARCHAR(40) NOT NULL (FK to problem_approaches.id)
  step_order: number; // INT NOT NULL DEFAULT 0
  content: string; // TEXT NOT NULL
}

// Matches SQL: problem_languages table
export interface ProblemLanguageRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  problem_id: number; // BIGINT NOT NULL (FK to problems.id)
  label: string; // VARCHAR(40) NOT NULL
  value: string; // VARCHAR(40) NOT NULL
  starter_code: string; // MEDIUMTEXT NOT NULL
}

// Matches SQL: problem_starter_notes table
export interface ProblemStarterNoteRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  problem_id: number; // BIGINT NOT NULL (FK to problems.id)
  content: string; // TEXT NOT NULL
}

// Matches SQL: problem_recent_results table
export interface ProblemRecentResultRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  problem_id: number; // BIGINT NOT NULL (FK to problems.id)
  case_label: string; // VARCHAR(40) NOT NULL
  status: ResultStatus; // ENUM ('Accepted','Wrong Answer','Runtime Error','Time Limit Exceeded','Pending') NOT NULL
  runtime: string; // VARCHAR(32) NOT NULL
  memory: string; // VARCHAR(32) NOT NULL
  detail: string; // TEXT NOT NULL
}

// Matches SQL: test_cases table
export interface TestCaseRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  problem_id: number; // BIGINT NOT NULL (FK to problems.id)
  label: string; // VARCHAR(60) NOT NULL
  explanation?: string | null; // TEXT
}

// Matches SQL: test_case_inputs table
export interface TestCaseInputRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  test_case_id: string; // VARCHAR(40) NOT NULL (FK to test_cases.id)
  field_name: string; // VARCHAR(60) NOT NULL
  label: string; // VARCHAR(60) NOT NULL
  value: string; // TEXT NOT NULL
}

// Composite interfaces for API responses
export interface ProblemExample {
  id: ProblemExampleId;
  order: number;
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemApproach
  extends Omit<
    ProblemApproachRow,
    "problem_id" | "time_complexity" | "space_complexity" | "code_snippet"
  > {
  complexity: {
    time: string;
    space: string;
  };
  code: string;
  steps: string[];
}

export type ProblemLanguageOption = Omit<
  ProblemLanguageRow,
  "problem_id" | "starter_code"
> & {
  starterCode: string;
};

export interface ProblemTestCaseInput {
  id: string;
  fieldName: string;
  label: string;
  value: string;
}

export interface ProblemTestCase {
  id: string;
  label: string;
  inputs: ProblemTestCaseInput[];
  explanation?: string;
}

export interface ProblemTestResult {
  id: string;
  caseLabel: string;
  status: ResultStatus;
  runtime: string;
  memory: string;
  detail: string;
}

export interface ProblemDetailRecord
  extends Omit<
    ProblemDetailRow,
    | "problem_id"
    | "difficulty_rating"
    | "updated_at"
    | "follow_up"
    | "constraints_json"
    | "likes"
    | "dislikes"
  > {
  problemId: number;
  difficultyRating: number;
  updatedAt: string;
  followUp?: string;
  constraints: string[];
  examples: ProblemExample[];
  approaches: ProblemApproach[];
  languages: ProblemLanguageOption[];
  starterNotes: string[];
  recentResults: ProblemTestResult[];
  interactions: ProblemInteractionSnapshot;
}

export interface ProblemDetail
  extends Problem,
    Omit<ProblemDetailRecord, "id" | "problemId"> {
  testCases: ProblemTestCase[];
}
