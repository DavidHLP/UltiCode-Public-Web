export type ContestStatus = "upcoming" | "running" | "finished";
export type ContestType = "weekly" | "biweekly" | "special";

export interface ContestListItem {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: ContestStatus;
  participant_count: number;
  // Frontend specific or camelCase aliases
  startTime?: string;
  endTime?: string;
  type?: ContestType;
  isRated?: boolean;
  durationMinutes?: number;
  registeredCount?: number;
  canRegister?: boolean;
  canStart?: boolean;
}

export interface ContestProblemSummary {
  id: string;
  contest_id: string;
  problem_id: number;
  problem_index: string;
  score: number;
  solved_count: number;
  submission_count: number;
  // Optional aliases used in UI
  problemIndex?: string;
  problemId?: number;
  title?: string;
  difficulty?: string;
  acceptanceRate?: string | number;
  solvedCount?: number;
  submissionCount?: number;
}

export interface ContestDetail extends ContestListItem {
  description: string;
  problems: ContestProblemSummary[];
}

export interface ContestProblemResult {
  index: string;
  solved: boolean;
  time?: string;
}

export interface ContestRankingEntry {
  rank: number;
  username: string;
  score: number;
  finish_time: string;
  // Aliases
  finishTime?: string;
  problemResults?: ContestProblemResult[];
  ratingChange?: number;
  ratingBefore?: number;
  ratingAfter?: number;
  country?: string;
}

export interface GlobalRankingEntry {
  rank: number;
  username: string;
  rating: number;
  id?: string;
  avatar?: string;
  badge?: string;
  country?: string;
  contestsAttended?: number;
}

export interface ContestStats {
  total_participants: number;
  total_contests: number;
}
