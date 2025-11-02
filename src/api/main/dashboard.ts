import { requestData } from '@/utils/request'

export interface SummaryCard {
  key: string
  title: string
  value: string
  description: string
}

export interface SubmissionTrendPoint {
  date: string
  total: number
  accepted: number
}

export interface RecentSubmission {
  id: number
  username: string
  displayName?: string | null
  email?: string | null
  avatarUrl?: string | null
  problemTitle: string
  verdict: string
  submittedAt: string
}

export interface DashboardOverviewResponse {
  summaryCards: SummaryCard[]
  submissionTrend: SubmissionTrendPoint[]
  recentSubmissions: RecentSubmission[]
}

export interface FetchDashboardOverviewParams {
  startDate?: string
  endDate?: string
  lang?: string
  recentLimit?: number
}

export function fetchDashboardOverview(params?: FetchDashboardOverviewParams) {
  return requestData<DashboardOverviewResponse>({
    url: '/api/public/dashboard/overview',
    method: 'GET',
    params,
  })
}
