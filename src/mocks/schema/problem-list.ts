import type { ProblemId } from '@/mocks/schema/problem'
import type { UserId } from '@/mocks/schema/user'

export type ProblemListGroupId = string
export type ProblemListId = string

export interface ProblemListGroupRow {
  id: ProblemListGroupId
  name: string
  sortOrder: number
}

export interface ProblemListRow {
  id: ProblemListId
  groupId: ProblemListGroupId
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  authorId?: UserId
  isPublic?: boolean
}

export interface ProblemListProblemRow {
  listId: ProblemListId
  problemId: ProblemId
}

export interface ProblemListItem
  extends Omit<ProblemListRow, 'groupId' | 'createdAt' | 'updatedAt' | 'authorId'> {
  problemCount: number
  createdAt?: Date
  updatedAt?: Date
}

export interface ProblemList {
  name: string
  items: ProblemListItem[]
}

export interface ProblemListDetail
  extends Omit<ProblemListRow, 'groupId' | 'createdAt' | 'updatedAt'> {
  problemIds: ProblemId[]
  createdAt: Date
  updatedAt: Date
}

export interface ProblemListSavedRelationRow {
  userId: UserId
  listId: ProblemListId
}

export interface ProblemListFavoriteRelationRow {
  userId: UserId
  listId: ProblemListId
}
