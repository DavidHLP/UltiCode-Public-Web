export type ContestId = string;
export type ContestEventId = string;
export type ContestResourceId = string;
export type ContestTrackId = string;
export type ContestFaqId = string;
export type ContestLeaderboardEntryId = string;
export type ContestInsightId = string;
export type ContestOpsCheckpointId = string;
export type ContestCrewId = string;

export type ContestStatus = "live" | "registration" | "upcoming" | "archived";
export type ContestMode = "solo" | "team";
export type ContestOpsStatus = "pending" | "in_progress" | "done";
export type ContestOpsPhase = "pre-flight" | "live" | "post";

// Matches SQL: contests table
export interface ContestRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  name: string; // VARCHAR(120) NOT NULL
  featured_event_id: string; // VARCHAR(40) NOT NULL
}

// Matches SQL: contest_events table
export interface ContestEventRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  contest_id: string; // VARCHAR(40) NOT NULL (FK to contests.id)
  title: string; // VARCHAR(120) NOT NULL
  description: string; // TEXT NOT NULL
  status: ContestStatus; // ENUM ('live','registration','upcoming','archived') NOT NULL
  division: string; // VARCHAR(40) NOT NULL
  difficulty: string; // VARCHAR(40) NOT NULL
  tags: any; // JSON NOT NULL
  start_time: string; // DATETIME NOT NULL
  end_time: string; // DATETIME NOT NULL
  is_rated: boolean; // TINYINT(1) NOT NULL DEFAULT 1
  mode: ContestMode; // ENUM ('solo','team') NOT NULL
  registered: number; // INT NOT NULL
  slots?: number | null; // INT NULL
}

// Matches SQL: contest_insights table
export interface ContestInsightRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  contest_id: string; // VARCHAR(40) NOT NULL (FK to contests.id)
  label: string; // VARCHAR(120) NOT NULL
  value: string; // VARCHAR(40) NOT NULL
  delta?: number | null; // DECIMAL(6,2) NULL
  status: string; // VARCHAR(40) NOT NULL
}

// Matches SQL: contest_leaderboard table
export interface ContestLeaderboardRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  contest_id: string; // VARCHAR(40) NOT NULL (FK to contests.id)
  division_tag: string; // VARCHAR(40) NOT NULL
  rank: number; // INT NOT NULL
  team_name: string; // VARCHAR(120) NOT NULL
  score: number; // INT NOT NULL
  solved: number; // INT NOT NULL
  penalty: number; // INT NOT NULL
}

// Matches SQL: contest_tracks table
export interface ContestTrackRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  contest_id: string; // VARCHAR(40) NOT NULL (FK to contests.id)
  title: string; // VARCHAR(120) NOT NULL
  summary: string; // TEXT NOT NULL
}

// Matches SQL: contest_resources table
export interface ContestResourceRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  contest_id: string; // VARCHAR(40) NOT NULL (FK to contests.id)
  title: string; // VARCHAR(120) NOT NULL
  url: string; // VARCHAR(255) NOT NULL
  kind: string; // VARCHAR(40) NOT NULL
}

// Matches SQL: contest_faq table
export interface ContestFaqRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  contest_id: string; // VARCHAR(40) NOT NULL (FK to contests.id)
  question: string; // VARCHAR(255) NOT NULL
  answer: string; // TEXT NOT NULL
}

// Matches SQL: contest_ops_checkpoints table
export interface ContestOpsCheckpointRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  contest_id: string; // VARCHAR(40) NOT NULL (FK to contests.id)
  phase: string; // VARCHAR(40) NOT NULL
  status: string; // VARCHAR(40) NOT NULL
  description: string; // TEXT NOT NULL
  timestamp: string; // DATETIME NOT NULL
}

// Matches SQL: contest_crew table
export interface ContestCrewRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  contest_id: string; // VARCHAR(40) NOT NULL (FK to contests.id)
  name: string; // VARCHAR(120) NOT NULL
  role: string; // VARCHAR(120) NOT NULL
  contact: string; // VARCHAR(120) NOT NULL
  avatar?: string | null; // VARCHAR(255)
}

// Composite interfaces for API responses
export interface ContestRegistrationInfo {
  open: boolean;
  closesAt?: string;
  slots: number;
  registered: number;
  mode: "solo" | "team";
}

export interface ContestEvent {
  id: ContestId;
  title: string;
  series: string;
  description: string;
  startTime: string;
  durationMinutes: number;
  timezone: string;
  status: ContestStatus;
  difficulty: "Starter" | "Intermediate" | "Advanced" | "Championship";
  ratingBand: string;
  tags: string[];
  rewards: string[];
  registration: ContestRegistrationInfo;
  division: "global" | "regional" | "college" | "team";
  host: string;
  isRated: boolean;
  prizePool?: string;
  coverImage?: string;
  broadcast?: string;
  editorialEta?: string;
}

export type ContestTrend = "up" | "down" | "steady";

export interface ContestInsight extends Omit<ContestInsightRow, "contest_id" | "status"> {
  trend: ContestTrend;
  delta: string;
  helper: string;
}

export interface ContestLeaderboardEntry {
  id: ContestLeaderboardEntryId;
  divisionTag: string;
  rank: number;
  handle: string;
  rating: number;
  ratingDelta: number;
  solved: number;
  penalty: number;
  country: string;
}

export interface ContestTrack {
  id: ContestTrackId;
  name: string;
  summary: string;
  difficulty: "Starter" | "Intermediate" | "Advanced";
  badge: string;
  cadence: string;
  targetRating: string;
  focus: string[];
  included: string[];
}

export interface ContestResource {
  id: ContestResourceId;
  title: string;
  description: string;
  url: string;
  category: "guide" | "video" | "playbook" | "announcement";
}

export interface ContestFaqItem extends Omit<ContestFaqRow, "contest_id"> {
  tags?: string[];
}

export interface ContestOpsCheckpoint {
  id: ContestOpsCheckpointId;
  title: string;
  category: ContestOpsPhase;
  status: ContestOpsStatus;
  notes: string;
  dueAt: string;
  owner: string;
  effort: "S" | "M" | "L";
}

export interface ContestCrewMember extends Omit<ContestCrewRow, "contest_id"> {
  timezone: string;
  focus: string;
  channel: string;
}
