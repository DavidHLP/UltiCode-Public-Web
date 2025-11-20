import type { ProblemId } from "@/mocks/schema/problem";
import type { UserId } from "@/mocks/schema/user";

export type SubmissionStatus =
  | "Accepted"
  | "Wrong Answer"
  | "Runtime Error"
  | "Time Limit Exceeded";

// Matches SQL: submissions table
export interface SubmissionRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  problem_id: number; // BIGINT NOT NULL (FK to problems.id)
  user_id: string; // VARCHAR(40) NOT NULL
  status: SubmissionStatus; // ENUM ('Accepted','Wrong Answer','Runtime Error','Time Limit Exceeded') NOT NULL
  runtime: string; // VARCHAR(32) NOT NULL
  memory: string; // VARCHAR(32) NOT NULL
  language: string; // VARCHAR(40) NOT NULL
  submitted_at: string; // DATETIME NOT NULL
  runtime_percentile: number; // INT NOT NULL
  memory_percentile: number; // INT NOT NULL
  code: string; // MEDIUMTEXT NOT NULL
  notes?: string | null; // TEXT NULL
  tags_json?: any | null; // JSON
  runtime_dist?: any | null; // JSON
  runtime_dist_bins?: any | null; // JSON
}

// Matches SQL: submission_tests table
export interface SubmissionTestRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  submission_id: string; // VARCHAR(40) NOT NULL (FK to submissions.id)
  label: string; // VARCHAR(60) NOT NULL
  status: SubmissionStatus; // ENUM ('Accepted','Wrong Answer','Runtime Error','Time Limit Exceeded') NOT NULL
  runtime: string; // VARCHAR(32) NOT NULL
}

// Composite interfaces for API responses
export interface SubmissionMetricRow {
  label: string;
  value: string;
  helper?: string;
}

export interface SubmissionTestCaseRow {
  id: string;
  label: string;
  status: SubmissionStatus;
  runtime: string;
}

export interface SubmissionRecordRow {
  id: string;
  problemId: ProblemId;
  userId: UserId;
  status: SubmissionStatus;
  runtime: string;
  memory: string;
  language: string;
  submittedAt: string;
  runtimePercentile: number;
  memoryPercentile: number;
  code: string;
  tags: string[];
  notes?: string;
  metrics: SubmissionMetricRow[];
  tests: SubmissionTestCaseRow[];
  // Optional performance distribution data (counts per bin)
  runtimeDist?: number[];
  // Optional bin labels (ms) matching runtimeDist length
  runtimeDistBinsMs?: number[];
}

export type SubmissionRecord = SubmissionRecordRow;
