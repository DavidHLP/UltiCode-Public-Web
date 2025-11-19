import type { Problem } from '@/mocks/schema/problem'
import {
  type ProblemApproach,
  type ProblemDetail,
  type ProblemDetailRecord,
  type ProblemExample,
  type ProblemLanguageOption,
  type ProblemSubmission,
  type ProblemTestCase,
  type ProblemTestCaseInput,
  type ProblemTestResult,
  type ProblemApproachRow,
  type ResultStatus,
} from '@/mocks/schema/problem-detail'
import problemDetailData from '@/mocks/db/problem-detail.json'
import { fetchProblemById } from '@/mocks/api/problem'
import { fetchTestCasesByProblemId } from '@/mocks/api/test-case'
import { fetchProblemSubmissions } from '@/mocks/api/submission'

type DetailRecordFields = Omit<ProblemDetailRecord, 'problemId' | 'id'>

const detailRecords = new Map<number, ProblemDetailRecord>()

const approachStepsById = problemDetailData.problemApproachSteps.reduce<
  Map<string, { order: number; content: string }[]>
>((acc, step) => {
  if (!acc.has(step.approachId)) {
    acc.set(step.approachId, [])
  }
  acc.get(step.approachId)!.push({ order: step.order, content: step.content })
  return acc
}, new Map())

const normalizeApproach = (approach: ProblemApproachRow): ProblemApproach => ({
  id: approach.id,
  title: approach.title,
  summary: approach.summary,
  complexity: {
    time: approach.timeComplexity,
    space: approach.spaceComplexity,
  },
  steps: (approachStepsById.get(approach.id) ?? [])
    .sort((a, b) => a.order - b.order)
    .map((step) => step.content),
  code: approach.code,
  language: approach.language,
})

const groupByProblemId = <T extends { problemId: number }>(source: T[]): Map<number, T[]> => {
  return source.reduce<Map<number, T[]>>((acc, item) => {
    if (!acc.has(item.problemId)) {
      acc.set(item.problemId, [])
    }
    acc.get(item.problemId)!.push(item)
    return acc
  }, new Map())
}

const examplesByProblemId = groupByProblemId(problemDetailData.problemExamples)
const approachesByProblemId = groupByProblemId(problemDetailData.problemApproaches)
const languagesByProblemId = groupByProblemId(problemDetailData.problemLanguages)
const starterNotesByProblemId = groupByProblemId(problemDetailData.problemStarterNotes)
const recentResultsByProblemId = groupByProblemId(problemDetailData.problemRecentResults)

problemDetailData.problemDetails.forEach((detail) => {
  detailRecords.set(detail.problemId, {
    id: detail.id,
    problemId: detail.problemId,
    slug: detail.slug,
    summary: detail.summary,
    companies: detail.companies,
    likes: detail.likes,
    dislikes: detail.dislikes,
    difficultyRating: detail.difficultyRating,
    updatedAt: detail.updatedAt,
    followUp: detail.followUp,
    constraints: detail.constraints,
    examples: (examplesByProblemId.get(detail.problemId) ?? []).map((example) => ({
      id: example.id,
      input: example.input,
      output: example.output,
      explanation: example.explanation,
    })),
    approaches: (approachesByProblemId.get(detail.problemId) ?? []).map(normalizeApproach),
    submissions: [],
    languages: (languagesByProblemId.get(detail.problemId) ?? []).map(
      ({ id, label, value, starterCode }) => ({ id, label, value, starterCode }),
    ),
    starterNotes: (starterNotesByProblemId.get(detail.problemId) ?? []).map((note) => note.content),
    recentResults: (recentResultsByProblemId.get(detail.problemId) ?? []).map(
      ({ id, caseLabel, status, runtime, memory, detail }) => ({
        id,
        caseLabel,
        status: status as ResultStatus,
        runtime,
        memory,
        detail,
      }),
    ),
  })
})

const detailCache = new Map<number, ProblemDetail>()

function hydrateDetail(record: ProblemDetailRecord): ProblemDetail {
  const problem = fetchProblemById(record.problemId)
  if (!problem) {
    throw new Error(`Problem with id ${record.problemId} not found`)
  }

  const { id: __id, problemId: __problemId, ...detailFields } = record
  void __id
  void __problemId
  const detailWithoutMeta = detailFields as DetailRecordFields
  const testCases = fetchTestCasesByProblemId(record.problemId)

  return {
    ...problem,
    ...detailWithoutMeta,
    testCases,
  }
}

function getDetail(problemId: number): ProblemDetail {
  if (!detailCache.has(problemId)) {
    const record = detailRecords.get(problemId)
    if (!record) {
      throw new Error(`Problem detail missing for problem ${problemId}`)
    }
    detailCache.set(problemId, hydrateDetail(record))
  }

  return detailCache.get(problemId)!
}

function getFallbackDetail(): ProblemDetail {
  const firstRecord = Array.from(detailRecords.values())[0]
  if (!firstRecord) {
    throw new Error('No problem detail records available')
  }
  return getDetail(firstRecord.problemId)
}

export function fetchProblemDetailById(id: number): ProblemDetail {
  const base = detailRecords.has(id) ? getDetail(id) : getFallbackDetail()
  const submissions: ProblemSubmission[] = fetchProblemSubmissions(base.id).map(
    ({ id, status, runtime, memory, language, submittedAt }) => ({
      id,
      status,
      runtime,
      memory,
      language,
      submittedAt,
    }),
  )
  return { ...base, submissions }
}

export function fetchProblemDetailSummary() {
  return Array.from(detailRecords.values())
    .map((record) => {
      const problem = fetchProblemById(record.problemId)
      if (!problem) return undefined
      return {
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        acceptanceRate: problem.acceptanceRate,
      }
    })
    .filter(
      (
        summary,
      ): summary is {
        id: number
        title: string
        difficulty: Problem['difficulty']
        acceptanceRate: number
      } => Boolean(summary),
    )
}

export type {
  ProblemApproach,
  ProblemExample,
  ProblemLanguageOption,
  ProblemSubmission,
  ProblemTestCaseInput,
  ProblemTestCase,
  ProblemTestResult,
}
