import type { MockDatabase } from '../validation/validator'

const baseContestId = 'contest-weekly-1'

const data = {
  contests: [
    {
      id: baseContestId,
      name: 'UltiCode Weekly 1',
      featured_event_id: 'contest-weekly-1-event',
    },
  ],
  contest_events: [
    {
      id: 'contest-weekly-1-event',
      contest_id: baseContestId,
      title: 'Weekly Round #1',
      description: 'Three linked demo problems covering hash map, linked list, and two-pointer patterns.',
      status: 'registration',
      division: 'global',
      difficulty: 'Starter',
      tags: ['rated', 'editorial'],
      start_time: '2024-09-01T13:00:00Z',
      end_time: '2024-09-01T15:00:00Z',
      is_rated: true,
      mode: 'solo',
      registered: 420,
      slots: 1000,
    },
  ],
  contest_insights: [
    { id: 'insight-registrations', contest_id: baseContestId, label: 'Registrations', value: '420', delta: 5, status: 'up' },
    { id: 'insight-solve-rate', contest_id: baseContestId, label: 'Median solve rate', value: '63%', delta: -2, status: 'down' },
  ],
  contest_leaderboard: [
    { id: 'lb-1', contest_id: baseContestId, division_tag: 'Global', rank: 1, team_name: 'hashmap-herons', score: 300, solved: 3, penalty: 1 },
    { id: 'lb-2', contest_id: baseContestId, division_tag: 'Global', rank: 2, team_name: 'carry-check', score: 250, solved: 2, penalty: 2 },
    { id: 'lb-3', contest_id: baseContestId, division_tag: 'Global', rank: 3, team_name: 'two-pointers', score: 220, solved: 2, penalty: 3 },
  ],
  contest_tracks: [
    {
      id: 'track-warmup',
      contest_id: baseContestId,
      title: 'Warmup drills',
      summary: 'Short practice tasks aligned with the three featured problems.',
    },
  ],
  contest_resources: [
    {
      id: 'resource-editorial',
      contest_id: baseContestId,
      title: 'Editorial PDF',
      url: 'https://example.com/editorial',
      kind: 'editorial',
    },
  ],
  contest_faq: [
    {
      id: 'faq-1',
      contest_id: baseContestId,
      question: 'Is this round rated?',
      answer: 'Yes, all participants receive provisional ratings.',
    },
  ],
  contest_ops_checkpoints: [
    {
      id: 'ops-announce',
      contest_id: baseContestId,
      phase: 'announce',
      status: 'complete',
      description: 'Announcement posted with problem list.',
      timestamp: '2024-08-28T12:00:00Z',
    },
    {
      id: 'ops-started',
      contest_id: baseContestId,
      phase: 'live',
      status: 'pending',
      description: 'Contest starts with live scoreboard.',
      timestamp: '2024-09-01T13:00:00Z',
    },
  ],
  contest_crew: [
    { id: 'crew-host', contest_id: baseContestId, name: 'Nora', role: 'Host', contact: 'nora@example.com' },
    { id: 'crew-judge', contest_id: baseContestId, name: 'Dev', role: 'Judge', contact: 'dev@example.com' },
  ],
} as const satisfies MockDatabase

export default data
