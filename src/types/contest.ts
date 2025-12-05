export interface ContestListItem {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: 'upcoming' | 'running' | 'finished';
  participant_count: number;
}

export interface ContestDetail extends ContestListItem {
  description: string;
  problems: any[]; // Define Problem type if needed
}

export interface ContestRankingEntry {
  rank: number;
  username: string;
  score: number;
  finish_time: string;
}

export interface GlobalRankingEntry {
  rank: number;
  username: string;
  rating: number;
}

export interface ContestStats {
  total_participants: number;
  total_contests: number;
}
