export interface ForumUser {
  id: string;
  username: string;
  avatar?: string;
}

export interface ForumCommunity {
  id: string;
  name: string;
  description: string;
  member_count: number;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: ForumUser;
  created_at: string;
  likes: number;
  comments_count: number;
}

export interface ForumComment {
  id: string;
  content: string;
  author: ForumUser;
  created_at: string;
}

export interface ForumThread extends ForumPost {
  comments: ForumComment[];
}

export interface ForumModerator extends ForumUser {
  role: 'moderator' | 'admin';
}

export interface ForumTrendingTopic {
  id: string;
  name: string;
  posts_count: number;
}
