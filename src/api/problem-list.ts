import { apiGet } from '@/api/client'
import type { Problem } from '@/mocks/schema/problem'
import type {
  ProblemList,
  ProblemListId,
  ProblemListItem,
  ProblemListStats,
} from '@/mocks/schema/problem-list'

export async function fetchProblemLists(): Promise<ProblemList[]> {
  return apiGet<ProblemList[]>('/problem-lists')
}

export async function fetchProblemListItem(id: ProblemListId): Promise<ProblemListItem> {
  return apiGet<ProblemListItem>(`/problem-lists/${id}`)
}

export async function fetchProblemListStats(): Promise<ProblemListStats[]> {
  return apiGet<ProblemListStats[]>('/problem-lists/stats')
}

export async function fetchProblemsByListId(listId: ProblemListId): Promise<Problem[]> {
  return apiGet<Problem[]>(`/problem-lists/${listId}/problems`)
}
