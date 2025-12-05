export interface SolutionFeedItem {
  id: string;
  title: string;
  author: {
    username: string;
    avatar?: string;
  };
  votes: number;
  views: number;
  tags: string[];
}

export interface SolutionFeedResponse {
  items: SolutionFeedItem[];
  total: number;
}
