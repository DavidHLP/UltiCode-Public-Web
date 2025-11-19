import type { Problem } from '@/mocks/schema/problem'
import { apiGet } from '@/api/client'

export async function fetchProblems(): Promise<Problem[]> {
  return apiGet<Problem[]>('/problems')
}

export async function fetchProblemById(id: number): Promise<Problem> {
  return apiGet<Problem>(`/problems/${id}`)
}
