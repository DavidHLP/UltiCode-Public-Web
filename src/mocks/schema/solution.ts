import type { ProblemApproach } from '@/mocks/schema/problem-detail'

export type SolutionFilterOptionId = string
export type SolutionAuthorId = string
export type SolutionBadgeId = string
export type SolutionMetaId = string

export interface SolutionFilterOptionRow {
  id: SolutionFilterOptionId
  label: string
  value: string
  kind: 'quick' | 'sort'
}

export interface SolutionAuthorRow {
  id: SolutionAuthorId
  name: string
  role: string
  avatarColor: string
}

export interface SolutionBadgeRow {
  id: SolutionBadgeId
  label: string
}

export interface SolutionBadgeRelationRow {
  badgeId: SolutionBadgeId
  metaId: SolutionMetaId
}

export interface SolutionFeedMetaRow {
  id: SolutionMetaId
  highlight: string
  flair: string
  authorId: SolutionAuthorId
  views: string
  likes: number
  comments: number
  createdAt: string
  publishedAt: string
  topic: string
  languageFilter: string
  score: number
}

export interface SolutionFeedMeta extends SolutionFeedMetaRow {
  badges: string[]
  author: SolutionAuthorRow
  stats: {
    views: string
    likes: number
    comments: number
  }
}

export interface SolutionFeedItem extends ProblemApproach, SolutionFeedMeta {
  tags: string[]
}

export interface SolutionFeedResponse {
  items: SolutionFeedItem[]
  languageOptions: Array<{ label: string; value: string }>
  topicOptions: Array<{ label: string; value: string }>
  quickFilterOptions: Array<{ label: string; value: string }>
  sortOptions: Array<{ label: string; value: string }>
}
