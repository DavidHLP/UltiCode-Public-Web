import type { Problem, ProblemId } from '@/mocks/schema/problem'

export type ProblemDetailId = string
export type ProblemExampleId = string
export type ProblemApproachId = string
export type ProblemSubmissionId = string
export type ProblemLanguageId = string
export type ProblemStarterNoteId = string

export type SubmissionStatus = 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded'
export type ResultStatus = SubmissionStatus | 'Pending'

export interface ProblemDetailRow {
  id: ProblemDetailId
  problemId: ProblemId
  slug: string
  summary: string
  companies: string[]
  likes: number
  dislikes: number
  difficultyRating: number
  updatedAt: string
  followUp: string
  constraints: string[]
}

export interface ProblemExampleRow {
  id: ProblemExampleId
  problemId: ProblemId
  exampleOrder: number
  inputText: string
  outputText: string
  explanation?: string
}

export interface ProblemApproachRow {
  id: ProblemApproachId
  problemId: ProblemId
  title: string
  summary: string
  timeComplexity: string
  spaceComplexity: string
  code: string
  language: string
}

export interface ProblemApproachStepRow {
  id: string
  approachId: ProblemApproachId
  order: number
  content: string
}

export interface ProblemSubmissionRow {
  id: ProblemSubmissionId
  problemId: ProblemId
  status: SubmissionStatus
  runtime: string
  memory: string
  language: string
  submittedAt: string
}

export interface ProblemLanguageRow {
  id: ProblemLanguageId
  problemId: ProblemId
  label: string
  value: string
  starterCode: string
}

export interface ProblemStarterNoteRow {
  id: ProblemStarterNoteId
  problemId: ProblemId
  content: string
}

export interface ProblemExample {
  id: ProblemExampleId
  order: number
  input: string
  output: string
  explanation?: string
}

export interface ProblemApproach
  extends Omit<ProblemApproachRow, 'problemId' | 'timeComplexity' | 'spaceComplexity'> {
  complexity: {
    time: string
    space: string
  }
  steps: string[]
}

export type ProblemSubmission = Omit<ProblemSubmissionRow, 'problemId'>

export type ProblemLanguageOption = Omit<ProblemLanguageRow, 'problemId'>

export interface ProblemTestCaseInput {
  id: string
  fieldName: string
  label: string
  value: string
}

export interface ProblemTestCase {
  id: string
  label: string
  inputs: ProblemTestCaseInput[]
  explanation?: string
}

export interface ProblemTestResult {
  id: string
  caseLabel: string
  status: ResultStatus
  runtime: string
  memory: string
  detail: string
}

export interface ProblemDetailRecord extends ProblemDetailRow {
  examples: ProblemExample[]
  approaches: ProblemApproach[]
  submissions: ProblemSubmission[]
  languages: ProblemLanguageOption[]
  starterNotes: string[]
  recentResults: ProblemTestResult[]
}

export interface ProblemDetail
  extends Problem,
    Omit<ProblemDetailRecord, 'id' | 'problemId' | 'submissions'> {
  submissions: ProblemSubmission[]
  testCases: ProblemTestCase[]
}
