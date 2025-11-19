import type { ProblemApproach } from '@/mocks/schema/problem-detail'
import type { SolutionFeedItem, SolutionFeedMeta } from '@/mocks/schema/solution'
import solutionDataRaw from '@/mocks/db/solution.json'

const solutionData = solutionDataRaw as {
  filterOptions: { id: string; label: string; value: string; kind: 'quick' | 'sort' }[]
  authors: { id: string; name: string; role: string; avatarColor: string }[]
  badges: { id: string; label: string }[]
  badgeRelations: { badgeId: string; metaId: string }[]
  metas: {
    id: string
    highlight: string
    flair: string
    authorId: string
    views: string
    likes: number
    comments: number
    createdAt: string
    publishedAt: string
    topic: string
    languageFilter: string
    score: number
  }[]
  fallbackMetaId: string
}

const quickFilterOptions = solutionData.filterOptions
  .filter((option) => option.kind === 'quick')
  .map((option) => ({
    label: option.label,
    value: option.value,
  }))

const sortOptions = solutionData.filterOptions
  .filter((option) => option.kind === 'sort')
  .map((option) => ({
    label: option.label,
    value: option.value,
  }))

const authorsById = new Map(solutionData.authors.map((author) => [author.id, author]))
const badgesById = new Map(solutionData.badges.map((badge) => [badge.id, badge.label]))

const badgesByMetaId = solutionData.badgeRelations.reduce<Map<string, string[]>>(
  (acc, relation) => {
    if (!acc.has(relation.metaId)) {
      acc.set(relation.metaId, [])
    }
    acc
      .get(relation.metaId)!
      .push(badgesById.get(relation.badgeId) ?? relation.badgeId)
    return acc
  },
  new Map(),
)

const buildMeta = (metaRow: (typeof solutionData.metas)[number]): SolutionFeedMeta => {
  const author = authorsById.get(metaRow.authorId)
  if (!author) {
    throw new Error(`Missing solution author ${metaRow.authorId}`)
  }

  return {
    id: metaRow.id,
    highlight: metaRow.highlight,
    flair: metaRow.flair,
    authorId: metaRow.authorId,
    author,
    badges: badgesByMetaId.get(metaRow.id) ?? [],
    stats: {
      views: metaRow.views,
      likes: metaRow.likes,
      comments: metaRow.comments,
    },
    views: metaRow.views,
    likes: metaRow.likes,
    comments: metaRow.comments,
    createdAt: metaRow.createdAt,
    publishedAt: metaRow.publishedAt,
    topic: metaRow.topic,
    languageFilter: metaRow.languageFilter,
    score: metaRow.score,
  }
}

const metaRecords: SolutionFeedMeta[] = solutionData.metas.map(buildMeta)
const fallbackMetaCandidate = metaRecords.find(
  (meta) => meta.id === solutionData.fallbackMetaId,
)
if (!fallbackMetaCandidate) {
  throw new Error('Fallback solution meta missing')
}
const fallbackMeta = fallbackMetaCandidate
const rotatingMetaSeed =
  metaRecords.filter((meta) => meta.id !== fallbackMeta.id) ?? [fallbackMeta]

export function fetchSolutionFeedItems(approaches: ProblemApproach[]): SolutionFeedItem[] {
  if (!approaches.length) return []

  const seed = rotatingMetaSeed.length ? rotatingMetaSeed : [fallbackMeta]

  return approaches.map((approach, index) => {
    const meta = seed[index % seed.length]!
    const derivedTags = Array.from(
      new Set(
        [approach.language, ...approach.title.split(/\s+/).filter(Boolean), ...meta.badges]
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    )
    return {
      ...approach,
      ...meta,
      tags: derivedTags,
    }
  })
}

export function fetchSolutionLanguageOptions(items: SolutionFeedItem[]) {
  const uniqueLanguages = Array.from(
    new Set(items.map((item) => item.languageFilter || item.language).filter(Boolean)),
  )
  return [
    { label: 'All languages', value: 'all' },
    ...uniqueLanguages.map((lang) => ({
      label: lang,
      value: lang,
    })),
  ]
}

export function fetchSolutionTopicOptions(items: SolutionFeedItem[]) {
  const uniqueTopics = Array.from(new Set(items.map((item) => item.topic).filter(Boolean)))
  return [
    { label: 'All topics', value: 'all' },
    ...uniqueTopics.map((topic) => ({
      label: topic,
      value: topic,
    })),
  ]
}

export function fetchSolutionQuickFilterOptions() {
  return quickFilterOptions
}

export function fetchSolutionSortOptions() {
  return sortOptions
}
