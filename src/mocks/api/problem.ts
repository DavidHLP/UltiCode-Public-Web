import type {
  Problem,
  ProblemRow,
  ProblemTagRelationRow,
  ProblemTagRow,
} from '@/mocks/schema/problem'
import rawProblemsData from '@/mocks/db/problems.json'

const problemsData = rawProblemsData as {
  problems: ProblemRow[]
  problemTags: ProblemTagRow[]
  problemTagRelations: ProblemTagRelationRow[]
}

const tagLookup = new Map(
  problemsData.problemTags.map((tag) => [tag.id, tag.label]),
)

const problemTagsMap = problemsData.problemTagRelations.reduce<Map<number, string[]>>(
  (acc, relation) => {
    const label = tagLookup.get(relation.tagId) ?? relation.tagId
    if (!acc.has(relation.problemId)) {
      acc.set(relation.problemId, [])
    }
    acc.get(relation.problemId)!.push(label)
    return acc
  },
  new Map(),
)

const problems: Problem[] = problemsData.problems.map((problem) => ({
  ...problem,
  tags: problemTagsMap.get(problem.id) ?? [],
}))

export function fetchProblems(): Problem[] {
  return problems
}

export function fetchProblemById(id: number): Problem | undefined {
  return problems.find((problem) => problem.id === id)
}

export function fetchProblemsByIds(ids: number[]): Problem[] {
  const idSet = new Set(ids)
  return problems.filter((problem) => idSet.has(problem.id))
}
