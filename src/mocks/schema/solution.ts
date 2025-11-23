import type { ProblemApproach } from "@/mocks/schema/problem-detail";

export type SolutionFilterOptionId = string;
export type SolutionAuthorId = string;
export type SolutionBadgeId = string;
export type SolutionMetaId = string;
export type SolutionFilterKind = "quick" | "sort";

// Matches SQL: solution_authors table
export interface SolutionAuthorRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  name: string; // VARCHAR(120) NOT NULL
  role: string; // VARCHAR(120) NOT NULL
  avatar_color: string; // VARCHAR(16) NOT NULL
}

// Matches SQL: solution_filter_options table
export interface SolutionFilterOptionRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  label: string; // VARCHAR(60) NOT NULL
  value: string; // VARCHAR(60) NOT NULL
  kind: SolutionFilterKind; // ENUM ('quick','sort') NOT NULL
}

// Matches SQL: solution_badges table
export interface SolutionBadgeRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  label: string; // VARCHAR(60) NOT NULL
}

// Matches SQL: solution_metas table
export interface SolutionMetaRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  highlight: string; // VARCHAR(255) NOT NULL
  flair?: string | null; // VARCHAR(60) NULL
  author_id: string; // VARCHAR(40) NOT NULL (FK to solution_authors.id)
  views_text: string; // VARCHAR(40) NOT NULL
  likes: number; // INT NOT NULL DEFAULT 0
  comments: number; // INT NOT NULL DEFAULT 0
  created_at: string; // DATETIME NOT NULL
  published_at: string; // DATETIME NOT NULL
  topic: string; // VARCHAR(60) NOT NULL
  language_filter: string; // VARCHAR(40) NOT NULL
  score: number; // INT NOT NULL DEFAULT 0
}

// Matches SQL: solution_badge_relations table
export interface SolutionBadgeRelationRow {
  badge_id: string; // VARCHAR(40) NOT NULL (FK to solution_badges.id)
  meta_id: string; // VARCHAR(40) NOT NULL (FK to solution_metas.id)
}

// API response interface for solution author (camelCase)
export interface SolutionAuthor {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
}

export interface SolutionFeedMeta extends SolutionFeedMetaRow {
  badges: string[];
  author: SolutionAuthor;
  stats: {
    views: string;
    likes: number;
    comments: number;
  };
}

export interface SolutionFeedItem extends ProblemApproach, SolutionFeedMeta {
  tags: string[];
}

export interface SolutionFeedResponse {
  items: SolutionFeedItem[];
  quickFilterOptions: Array<{ label: string; value: string }>;
  sortOptions: Array<{ label: string; value: string }>;
}

// Composite interfaces for API responses
export interface SolutionFeedMetaRow {
  id: SolutionMetaId;
  highlight: string;
  flair: string;
  authorId: SolutionAuthorId;
  views: string;
  likes: number;
  comments: number;
  createdAt: string;
  publishedAt: string;
  topic: string;
  languageFilter: string;
  score: number;
}
