import type { Problem } from "@/mocks/schema/problem";
import {
  type ProblemApproach,
  type ProblemDetail,
  type ProblemDetailRecord,
  type ProblemExample,
  type ProblemLanguageOption,
  type ProblemTestCase,
  type ProblemTestCaseInput,
  type ProblemTestResult,
  type ProblemApproachRow,
  type ResultStatus,
} from "@/mocks/schema/problem-detail";
import problemDetailData from "@/mocks/db/problem-detail";
import { fetchProblemById } from "@/mocks/api/problem";
import { fetchTestCasesByProblemId } from "@/mocks/api/test-case";
import { fetchProblemSubmissions } from "@/mocks/api/submission";

type DetailRecordFields = Omit<ProblemDetailRecord, "problemId" | "id">;

// Simplified submission type for problem detail view
export interface ProblemSubmission {
  id: string;
  status: string;
  runtime: string;
  memory: string;
  language: string;
  submittedAt: string;
}

const detailRecords = new Map<number, ProblemDetailRecord>();

const approachStepsById = problemDetailData.problem_approach_steps.reduce<
  Map<string, { order: number; content: string }[]>
>((acc, step) => {
  if (!acc.has(step.approach_id)) {
    acc.set(step.approach_id, []);
  }
  acc
    .get(step.approach_id)!
    .push({ order: step.step_order, content: step.content });
  return acc;
}, new Map());

const normalizeApproach = (approach: ProblemApproachRow): ProblemApproach => ({
  id: approach.id,
  title: approach.title,
  summary: approach.summary,
  complexity: {
    time: approach.time_complexity,
    space: approach.space_complexity,
  },
  steps: (approachStepsById.get(approach.id) ?? [])
    .sort((a, b) => a.order - b.order)
    .map((step) => step.content),
  code: approach.code_snippet,
  language: approach.language,
});

const groupByProblemId = <T extends { problem_id: number }>(
  source: readonly T[],
): Map<number, T[]> => {
  return source.reduce<Map<number, T[]>>((acc, item) => {
    if (!acc.has(item.problem_id)) {
      acc.set(item.problem_id, []);
    }
    acc.get(item.problem_id)!.push(item);
    return acc;
  }, new Map());
};

const examplesByProblemId = groupByProblemId(
  problemDetailData.problem_examples,
);
const approachesByProblemId = groupByProblemId(
  problemDetailData.problem_approaches,
);
const languagesByProblemId = groupByProblemId(
  problemDetailData.problem_languages,
);
const starterNotesByProblemId = groupByProblemId(
  problemDetailData.problem_starter_notes,
);
const recentResultsByProblemId = groupByProblemId(
  problemDetailData.problem_recent_results,
);

problemDetailData.problem_details.forEach((detail) => {
  detailRecords.set(detail.problem_id, {
    id: detail.id,
    problemId: detail.problem_id,
    slug: detail.slug,
    summary: detail.summary,
    companies: detail.companies,
    likes: detail.likes,
    dislikes: detail.dislikes,
    difficultyRating: detail.difficulty_rating,
    updatedAt: detail.updated_at,
    followUp: detail.follow_up,
    constraints: [...detail.constraints_json],
    examples: (examplesByProblemId.get(detail.problem_id) ?? [])
      .sort((a, b) => a.example_order - b.example_order)
      .map((example) => ({
        id: example.id,
        order: example.example_order,
        input: example.input_text,
        output: example.output_text,
        explanation: example.explanation,
      })),
    approaches: (approachesByProblemId.get(detail.problem_id) ?? []).map(
      normalizeApproach,
    ),
    languages: (languagesByProblemId.get(detail.problem_id) ?? []).map(
      ({ id, label, value, starter_code }) => ({
        id,
        label,
        value,
        starterCode: starter_code,
      }),
    ),
    starterNotes: (starterNotesByProblemId.get(detail.problem_id) ?? []).map(
      (note) => note.content,
    ),
    recentResults: (recentResultsByProblemId.get(detail.problem_id) ?? []).map(
      ({ id, case_label, status, runtime, memory, detail }) => ({
        id,
        caseLabel: case_label,
        status: status as ResultStatus,
        runtime,
        memory,
        detail,
      }),
    ),
  });
});

const detailCache = new Map<number, ProblemDetail>();

function hydrateDetail(record: ProblemDetailRecord): ProblemDetail {
  const problem = fetchProblemById(record.problemId);
  if (!problem) {
    throw new Error(`Problem with id ${record.problemId} not found`);
  }

  const { id: __id, problemId: __problemId, ...detailFields } = record;
  void __id;
  void __problemId;
  const detailWithoutMeta = detailFields as DetailRecordFields;
  const testCases = fetchTestCasesByProblemId(record.problemId);

  return {
    ...problem,
    ...detailWithoutMeta,
    testCases,
  };
}

function getDetail(problemId: number): ProblemDetail {
  if (!detailCache.has(problemId)) {
    const record = detailRecords.get(problemId);
    if (!record) {
      throw new Error(`Problem detail missing for problem ${problemId}`);
    }
    detailCache.set(problemId, hydrateDetail(record));
  }

  return detailCache.get(problemId)!;
}

function getFallbackDetail(): ProblemDetail {
  const firstRecord = Array.from(detailRecords.values())[0];
  if (!firstRecord) {
    throw new Error("No problem detail records available");
  }
  return getDetail(firstRecord.problemId);
}

export function fetchProblemDetailById(
  id: number,
): ProblemDetail & { submissions: ProblemSubmission[] } {
  const base = detailRecords.has(id) ? getDetail(id) : getFallbackDetail();
  const submissions: ProblemSubmission[] = fetchProblemSubmissions(base.id).map(
    ({ id, status, runtime, memory, language, submittedAt }) => ({
      id,
      status,
      runtime,
      memory,
      language,
      submittedAt,
    }),
  );
  return { ...base, submissions };
}

export function fetchProblemDetailSummary() {
  return Array.from(detailRecords.values())
    .map((record) => {
      const problem = fetchProblemById(record.problemId);
      if (!problem) return undefined;
      return {
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        acceptance_rate: problem.acceptanceRate,
      };
    })
    .filter(
      (
        summary,
      ): summary is {
        id: number;
        title: string;
        difficulty: Problem["difficulty"];
        acceptance_rate: number;
      } => Boolean(summary),
    );
}

export type {
  ProblemApproach,
  ProblemExample,
  ProblemLanguageOption,
  ProblemTestCaseInput,
  ProblemTestCase,
  ProblemTestResult,
};
