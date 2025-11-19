export type ForumCommunityId = string
export type ForumPostId = string
export type ForumUserId = string
export type ForumModeratorId = string
export type ForumTopicId = string
export type ForumAwardId = string
export type ForumCommentId = string

export type ForumFlairType = 'announcement' | 'discussion' | 'showcase' | 'question' | 'hiring'
export type ForumVoteState = 'upvoted' | 'downvoted' | 'neutral'

export interface ForumAwardRow {
  id: ForumAwardId
  name: string
  icon: string
  description?: string
  count: number
}

export interface ForumPostCommentPreviewRow {
  id: ForumCommentId
  authorId: ForumUserId
  avatar?: string
  body: string
  upvotes: number
  createdAt: string
}

export interface ForumPollOption {
  id: string
  label: string
  votes: number
}

export interface ForumUserRow {
  id: ForumUserId
  username: string
  avatar?: string
  karma: number
  roleBadge?: string
}

export interface ForumCommunityRule {
  id: string
  communityId: ForumCommunityId
  title: string
  summary: string
}

export interface ForumCommunityLink {
  id?: string
  communityId: ForumCommunityId
  label: string
  url: string
  description?: string
}

export interface ForumCommunityRow {
  id: ForumCommunityId
  name: string
  slug: string
  icon: string
  banner?: string
  description: string
  members: number
  online: number
  tags: string[]
  isOfficial?: boolean
  isNew?: boolean
  accentColor?: string
  foundedAt?: string
}

export interface ForumCommunity extends ForumCommunityRow {
  rules?: ForumCommunityRule[]
  links?: ForumCommunityLink[]
}

export interface ForumPostMediaImage {
  kind: 'image'
  src: string
  alt?: string
  ratio?: number
  caption?: string
}

export interface ForumPostMediaLink {
  kind: 'link'
  url: string
  domain: string
  title?: string
  thumbnail?: string
  description?: string
}

export interface ForumPostMediaText {
  kind: 'text'
  body: string
  markdown?: string
}

export interface ForumPostMediaVideo {
  kind: 'video'
  src: string
  thumbnail?: string
  duration?: string
  autoplay?: boolean
  controls?: boolean
}

export interface ForumPostMediaPoll {
  kind: 'poll'
  question: string
  closesAt?: string
  options: ForumPollOption[]
  totalVotes: number
}

export type ForumPostMedia =
  | ForumPostMediaImage
  | ForumPostMediaLink
  | ForumPostMediaText
  | ForumPostMediaVideo
  | ForumPostMediaPoll

export interface ForumPostRecommendation {
  source: 'visited' | 'popular' | 'trending' | 'similar' | 'community'
  label: string
}

export interface ForumPostStatsRow {
  id: string
  score: number
  comments: number
  awards: number
  saves: number
  shares: number
  upvoteRatio?: number
  views?: number
}

export interface ForumPostRow {
  id: ForumPostId
  permalink: string
  communityId: ForumCommunityId
  userId: ForumUserId
  flairLabel?: string
  flairType?: ForumFlairType
  title: string
  tags: string[]
  excerpt?: string
  media?: ForumPostMedia
  recommendation?: ForumPostRecommendation
  statsId: string
  createdAt: string
  awardIds?: ForumAwardId[]
  commentIds?: ForumCommentId[]
  voteState?: ForumVoteState
  isSaved?: boolean
  impressions?: number
  isPinned?: boolean
  isLocked?: boolean
}

export type ForumPostStats = ForumPostStatsRow

export type ForumAward = ForumAwardRow

export interface ForumPostCommentPreview extends Omit<ForumPostCommentPreviewRow, 'authorId'> {
  author: string
}

export type ForumUser = ForumUserRow

export interface ForumPost
  extends Omit<
    ForumPostRow,
    'statsId' | 'awardIds' | 'commentIds' | 'communityId' | 'userId' | 'flairLabel' | 'flairType'
  > {
  community: ForumCommunity
  flair?: {
    label: string
    type: ForumFlairType
  }
  user: ForumUser
  stats: ForumPostStats
  awards?: ForumAward[]
  commentPreview?: ForumPostCommentPreview[]
}

export interface ForumTrendingTopic {
  id: ForumTopicId
  title: string
  communityId: ForumCommunityId
  delta: number
  trend: 'up' | 'down'
}

export interface ForumModerator extends ForumUserRow {
  timezone: string
  availability: string
  focus: string[]
}

export interface ForumCommentRow {
  id: ForumCommentId
  postId: ForumPostId
  parentId?: ForumCommentId | null
  authorId: ForumUserId
  avatar?: string
  body: string
  markdown?: string
  upvotes: number
  createdAt: string
  editedAt?: string
  isPinned?: boolean
  isLocked?: boolean
}

export interface ForumComment extends Omit<ForumCommentRow, 'postId' | 'authorId'> {
  author: ForumUser
  replies?: ForumComment[]
  voteState?: ForumVoteState
}

export interface ForumThread {
  post: ForumPost
  comments: ForumComment[]
}
