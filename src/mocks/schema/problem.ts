export type ProblemId = number
export type ProblemTagId = string
export type ProblemStatus = 'solved' | 'attempted' | 'todo'
export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard'

export interface ProblemRow {
  id: ProblemId
  title: string
  status: ProblemStatus
  acceptanceRate: number
  difficulty: ProblemDifficulty
  isPremium: boolean
  solution: boolean
  completedTime?: string
}

export interface ProblemTagRow {
  id: ProblemTagId
  label: string
}

export interface ProblemTagRelationRow {
  problemId: ProblemId
  tagId: ProblemTagId
}

export interface Problem extends ProblemRow {
  tags: string[]
}
