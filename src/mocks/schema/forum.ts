export type ForumCommunityId = string;
export type ForumPostId = string;
export type ForumUserId = string;
export type ForumModeratorId = string;
export type ForumTopicId = string;
export type ForumAwardId = string;
export type ForumCommentId = string;
export type ForumPostStatsId = string;
export type ForumCommunityRuleId = string;
export type ForumCommunityLinkId = string;
export type ForumQuickFilterId = string;

export type ForumFlairType =
  | "announcement"
  | "discussion"
  | "showcase"
  | "question"
  | "hiring";
export type ForumVoteState = "upvoted" | "downvoted" | "neutral";
export type ForumTrendDirection = "up" | "down";

// Matches SQL: forum_communities table
export interface ForumCommunityRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  name: string; // VARCHAR(120) NOT NULL
  slug: string; // VARCHAR(60) NOT NULL
  description: string; // TEXT NOT NULL
  members: number; // INT NOT NULL DEFAULT 0
  online: number; // INT NOT NULL DEFAULT 0
}

// Matches SQL: forum_community_rules table
export interface ForumCommunityRuleRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  community_id: string; // VARCHAR(40) NOT NULL (FK to forum_communities.id)
  title: string; // VARCHAR(180) NOT NULL
  body: string; // TEXT NOT NULL
}

// Matches SQL: forum_community_links table
export interface ForumCommunityLinkRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  community_id: string; // VARCHAR(40) NOT NULL (FK to forum_communities.id)
  label: string; // VARCHAR(120) NOT NULL
  url: string; // VARCHAR(255) NOT NULL
}

// Matches SQL: forum_users table
export interface ForumUserRow {
  username: string; // VARCHAR(60) PRIMARY KEY
  avatar?: string | null; // VARCHAR(255)
  karma: number; // INT NOT NULL DEFAULT 0
}

// Matches SQL: forum_moderators table
export interface ForumModeratorRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  community_id: string; // VARCHAR(40) NOT NULL (FK to forum_communities.id)
  username: string; // VARCHAR(60) NOT NULL (FK to forum_users.username)
  title: string; // VARCHAR(120) NOT NULL
}

// Matches SQL: forum_posts table
export interface ForumPostRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  community_id: string; // VARCHAR(40) NOT NULL (FK to forum_communities.id)
  user_id: string; // VARCHAR(60) NOT NULL (FK to forum_users.username)
  permalink?: string | null; // VARCHAR(255)
  title: string; // VARCHAR(255) NOT NULL
  flair_type?: ForumFlairType | null; // ENUM ('announcement','discussion','showcase','question','hiring') NULL
  flair_label?: string | null; // VARCHAR(60)
  tags: any; // JSON NOT NULL
  excerpt?: string | null; // TEXT
  media?: any | null; // JSON
  recommendation?: any | null; // JSON
  vote_state?: ForumVoteState; // ENUM ('upvoted','downvoted','neutral') DEFAULT 'neutral'
  is_saved: boolean; // TINYINT(1) NOT NULL DEFAULT 0
  impressions: number; // INT NOT NULL DEFAULT 0
  is_pinned: boolean; // TINYINT(1) NOT NULL DEFAULT 0
  is_locked: boolean; // TINYINT(1) NOT NULL DEFAULT 0
  created_at: string; // DATETIME NOT NULL
}

// Matches SQL: forum_post_stats table
export interface ForumPostStatsRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  post_id: string; // VARCHAR(40) NOT NULL UNIQUE (FK to forum_posts.id)
  score: number; // INT NOT NULL
  comments: number; // INT NOT NULL
  awards: number; // INT NOT NULL
  saves: number; // INT NOT NULL
  shares: number; // INT NOT NULL
  upvote_ratio?: number | null; // DECIMAL(4,2)
  views?: number | null; // INT
}

// Matches SQL: forum_awards table
export interface ForumAwardRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  label: string; // VARCHAR(120) NOT NULL
  icon?: string | null; // VARCHAR(120)
}

// Matches SQL: forum_post_awards table
export interface ForumPostAwardRow {
  post_id: string; // VARCHAR(40) NOT NULL (FK to forum_posts.id)
  award_id: string; // VARCHAR(40) NOT NULL (FK to forum_awards.id)
  count: number; // INT NOT NULL DEFAULT 1
}

// Matches SQL: forum_comments table
export interface ForumCommentRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  post_id: string; // VARCHAR(40) NOT NULL (FK to forum_posts.id)
  parent_id?: string | null; // VARCHAR(40) (FK to forum_comments.id)
  author_id: string; // VARCHAR(60) NOT NULL (FK to forum_users.username)
  body: string; // TEXT NOT NULL
  markdown?: string | null; // TEXT
  upvotes: number; // INT NOT NULL DEFAULT 0
  created_at: string; // DATETIME NOT NULL
  edited_at?: string | null; // DATETIME
  is_pinned: boolean; // TINYINT(1) DEFAULT 0
  is_locked: boolean; // TINYINT(1) DEFAULT 0
}

// Matches SQL: forum_quick_filters table
export interface ForumQuickFilterRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  label: string; // VARCHAR(60) NOT NULL
  value: string; // VARCHAR(40) NOT NULL
}

// Matches SQL: forum_trending_topics table
export interface ForumTrendingTopicRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  title: string; // VARCHAR(120) NOT NULL
  posts: number; // INT NOT NULL
  trend: ForumTrendDirection; // ENUM ('up','down') NOT NULL
}

// Composite interfaces for API responses
export interface ForumPostCommentPreviewRow {
  id: ForumCommentId;
  authorId: ForumUserId;
  avatar?: string;
  body: string;
  upvotes: number;
  createdAt: string;
}

export interface ForumPollOption {
  id: string;
  label: string;
  votes: number;
}

export interface ForumCommunityRule {
  id: string;
  communityId: ForumCommunityId;
  title: string;
  summary: string;
}

export interface ForumCommunityLink {
  id?: string;
  communityId: ForumCommunityId;
  label: string;
  url: string;
  description?: string;
}

export interface ForumCommunity extends ForumCommunityRow {
  rules?: ForumCommunityRule[];
  links?: ForumCommunityLink[];
  tags?: string[];
  isOfficial?: boolean;
  isNew?: boolean;
  accentColor?: string;
  foundedAt?: string;
  icon?: string;
  banner?: string;
}

export interface ForumPostMediaImage {
  kind: "image";
  src: string;
  alt?: string;
  ratio?: number;
  caption?: string;
}

export interface ForumPostMediaLink {
  kind: "link";
  url: string;
  domain: string;
  title?: string;
  thumbnail?: string;
  description?: string;
}

export interface ForumPostMediaText {
  kind: "text";
  body: string;
  markdown?: string;
}

export interface ForumPostMediaVideo {
  kind: "video";
  src: string;
  thumbnail?: string;
  duration?: string;
  autoplay?: boolean;
  controls?: boolean;
}

export interface ForumPostMediaPoll {
  kind: "poll";
  question: string;
  closesAt?: string;
  options: ForumPollOption[];
  totalVotes: number;
}

export type ForumPostMedia =
  | ForumPostMediaImage
  | ForumPostMediaLink
  | ForumPostMediaText
  | ForumPostMediaVideo
  | ForumPostMediaPoll;

export interface ForumPostRecommendation {
  source: "visited" | "popular" | "trending" | "similar" | "community";
  label: string;
}

export type ForumPostStats = ForumPostStatsRow;

export type ForumAward = ForumAwardRow;

export interface ForumPostCommentPreview
  extends Omit<ForumPostCommentPreviewRow, "authorId"> {
  author: string;
}

export type ForumUser = ForumUserRow;

export interface ForumPost
  extends Omit<
    ForumPostRow,
    | "community_id"
    | "user_id"
    | "flair_label"
    | "flair_type"
    | "is_saved"
    | "is_pinned"
    | "is_locked"
    | "created_at"
    | "vote_state"
  > {
  community: ForumCommunity;
  flair?: {
    label: string;
    type: ForumFlairType;
  };
  user: ForumUser;
  stats: ForumPostStats;
  awards?: ForumAward[];
  commentPreview?: ForumPostCommentPreview[];
  statsId?: string;
  awardIds?: ForumAwardId[];
  commentIds?: ForumCommentId[];
  voteState?: ForumVoteState;
  isSaved?: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
  createdAt: string;
}

export interface ForumTrendingTopic {
  id: ForumTopicId;
  title: string;
  communityId: ForumCommunityId;
  delta: number;
  trend: "up" | "down";
}

export interface ForumModerator extends ForumUserRow {
  timezone: string;
  availability: string;
  focus: string[];
}

export interface ForumComment
  extends Omit<
    ForumCommentRow,
    | "post_id"
    | "author_id"
    | "parent_id"
    | "created_at"
    | "edited_at"
    | "is_pinned"
    | "is_locked"
  > {
  author: ForumUser;
  replies?: ForumComment[];
  voteState?: ForumVoteState;
  parentId?: ForumCommentId | null;
  createdAt: string;
  editedAt?: string;
  isPinned?: boolean;
  isLocked?: boolean;
}

export interface ForumThread {
  post: ForumPost;
  comments: ForumComment[];
}
