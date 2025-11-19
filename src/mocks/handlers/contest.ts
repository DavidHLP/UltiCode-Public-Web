import { http, HttpResponse } from 'msw'
import {
  fetchContestCrew,
  fetchContestFaq,
  fetchContestFeaturedEvent,
  fetchContestInsights,
  fetchContestLeaderboard,
  fetchContestOpsCheckpoints,
  fetchContestResources,
  fetchContestSchedule,
  fetchContestTracks,
} from '@/mocks/api/contest'

export const contestHandlers = [
  http.get('/api/contest/featured', () => HttpResponse.json(fetchContestFeaturedEvent())),
  http.get('/api/contest/insights', () => HttpResponse.json(fetchContestInsights())),
  http.get('/api/contest/schedule', () => HttpResponse.json(fetchContestSchedule())),
  http.get('/api/contest/leaderboard', () => HttpResponse.json(fetchContestLeaderboard())),
  http.get('/api/contest/tracks', () => HttpResponse.json(fetchContestTracks())),
  http.get('/api/contest/resources', () => HttpResponse.json(fetchContestResources())),
  http.get('/api/contest/faq', () => HttpResponse.json(fetchContestFaq())),
  http.get('/api/contest/ops-checkpoints', () =>
    HttpResponse.json(fetchContestOpsCheckpoints()),
  ),
  http.get('/api/contest/crew', () => HttpResponse.json(fetchContestCrew())),
]
