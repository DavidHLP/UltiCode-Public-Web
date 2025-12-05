export interface ContestListItem {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: 'upcoming' | 'running' | 'finished';
  participant_count: number;
  // Frontend specific or camelCase aliases
  startTime?: string;
  endTime?: string;
  type?: string;
  isRated?: boolean;
  durationMinutes?: number;
  registeredCount?: number;
  canRegister?: boolean;
  canStart?: boolean;
}

export interface ContestDetail extends ContestListItem {
  description: string;
  problems: any[];
}

export interface ContestRankingEntry {
  rank: number;
  username: string;
  score: number;
  finish_time: string;
  // Aliases
  finishTime?: string;
  problemResults?: any[];
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
