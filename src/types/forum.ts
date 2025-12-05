export interface ForumUser {
  id: string;
  username: string;
  avatar?: string;
  karma?: number;
}

export interface ForumCommunity {
  id: string;
  name: string;
  description: string;
  member_count: number;
  slug?: string;
  icon?: string;
  banner?: string;
  isNew?: boolean;
  isOfficial?: boolean;
  members?: number;
  online?: number;
  foundedAt?: string;
  tags?: string[];
  accentColor?: string;
  rules?: { id: string; title: string; summary: string }[];
  links?: { label: string; url: string; description?: string }[];
}

export type ForumFlairType =
  | "discussion"
  | "question"
  | "announcement"
  | "showcase"
  | "hiring";

export interface ForumFlair {
  type: ForumFlairType;
  text?: string;
}

export interface ForumAward {
  id: string;
  icon: string;
  label: string;
  count: number;
}

export interface ForumMediaBase {
  id?: string;
}

export interface ForumMediaImage extends ForumMediaBase {
  type: "image";
  kind?: "image";
  url: string;
  src?: string; // alias for url
  alt?: string;
  ratio?: number;
  caption?: string;
  thumbnail?: string;
}

export interface ForumMediaVideo extends ForumMediaBase {
  type: "video";
  kind?: "video";
  url: string;
  src?: string;
  thumbnail?: string;
  controls?: boolean;
  autoplay?: boolean;
  duration?: string;
  ratio?: number;
}

export interface ForumMediaLink extends ForumMediaBase {
  type: "link";
  kind?: "link";
  url: string;
  title?: string;
  domain?: string;
  thumbnail?: string;
  description?: string;
}

export interface ForumMediaPollOption {
  id: string;
  label: string;
  votes: number;
}

export interface ForumMediaPoll extends ForumMediaBase {
  type: "poll";
  kind?: "poll";
  question: string;
  options: ForumMediaPollOption[];
  totalVotes: number;
  closesAt?: string;
}

export interface ForumMediaText extends ForumMediaBase {
  type: "text";
  kind?: "text";
  markdown: string;
  body?: string;
}

export type ForumPostMedia =
  | ForumMediaImage
  | ForumMediaVideo
  | ForumMediaLink
  | ForumMediaPoll
  | ForumMediaText;

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: ForumUser;
  created_at: string;
  likes: number;
  comments_count: number;
  // Frontend specific or extended properties
  excerpt?: string;
  tags?: string[];
  community?: ForumCommunity;
  flair?: ForumFlair;
  stats?: {
    views: number;
    likes: number;
    comments: number;
    score?: number;
    saves?: number;
    shares?: number;
    upvote_ratio?: number;
    awards?: number;
  };
  isPinned?: boolean;
  isLocked?: boolean;
  createdAt?: string;
  views?: number;
  media?: ForumPostMedia[];
  commentPreview?: {
    id: string;
    author: string; // Changed to string based on usage in ForumPostCard (u/{{ comment.author }})
    avatar?: string;
    content?: string;
    body?: string; // Component uses body
    createdAt: string;
    upvotes: number;
  }[];
  isSaved?: boolean;
  impressions?: number;
  voteState?: "upvoted" | "downvoted" | "neutral";
  recommendation?: { label?: string };
  awards?: ForumAward[];
}

export interface ForumComment {
  id: string;
  content: string;
  author: ForumUser;
  created_at: string;
  // Frontend specific
  body?: string;
  upvotes?: number;
  replies?: ForumComment[];
  isPinned?: boolean;
  isLocked?: boolean;
  createdAt?: string;
}

export interface ForumThread extends ForumPost {
  comments: ForumComment[];
  recommendation?: { label?: string };
  awards?: ForumAward[];
  voteState?: "upvoted" | "downvoted" | "neutral";
}

export interface ForumModerator extends ForumUser {
  role: "moderator" | "admin";
  timezone?: string;
  availability?: string;
  focus?: string[];
}

export interface ForumTrendingTopic {
  id: string;
  name: string;
  posts_count: number;
  title?: string; // alias for name
  communityId?: string;
  trend?: "up" | "down" | "stable";
  delta?: string;
}
