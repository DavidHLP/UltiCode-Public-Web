import type { ProblemDetail } from '@/mocks/schema/problem-detail'
import { apiGet } from '@/api/client'

export async function fetchProblemDetailById(id: number): Promise<ProblemDetail> {
  return apiGet<ProblemDetail>(`/problems/${id}/detail`)
}
