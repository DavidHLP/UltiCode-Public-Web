import type { ProblemDetail, ProblemTestCase } from "@/types/problem-detail";
import { apiGet } from "@/utils/request";
import { mapProblem } from "@/api/problem";

interface BackendExampleInput {
  name: string;
  value: string;
}

interface BackendExample {
  id: string;
  explanation: string;
  inputs?: BackendExampleInput[];
  inputText?: string;
  outputText?: string;
}

interface BackendProblemDetail {
  summary: string;
  companies: { id: string; name: string; logo?: string }[] | null;
  constraints_json: string[];
  follow_up: string;
  hints: string[] | null;
}

interface BackendProblemResponse {
  detail?: BackendProblemDetail | null;
  examples?: BackendExample[] | null;
  summary?: string | null;
  constraints?: string[] | null;
  followUp?: string | null;
  companies?: BackendProblemDetail["companies"] | null;
  starterNotes?: string[] | null;
  [key: string]: unknown;
}

export async function fetchProblemDetailById(
  id: number | string,
  userId?: string,
): Promise<ProblemDetail> {
  const query = userId ? `?userId=${userId}` : "";
  const response = await apiGet<BackendProblemResponse>(
    `/problems/${id}${query}`,
  );
  return mapProblemDetail(response);
}

const mapExamplesToTestCases = (
  examples: BackendExample[],
): ProblemTestCase[] =>
  examples.map((ex, index) => ({
    id: ex.id || `case-${index}`,
    label: `Case ${index + 1}`,
    explanation: ex.explanation,
    inputs: ex.inputs
      ? ex.inputs.map((input: BackendExampleInput) => ({
          name: input.name,
          value: input.value,
          label: input.name,
        }))
      : [],
    output: ex.outputText,
  }));

const mapExamplesToDescription = (examples: BackendExample[]) =>
  examples.map((ex) => ({
    input: ex.inputText || "",
    output: ex.outputText || "",
    explanation: ex.explanation,
  }));

export function mapProblemDetail(
  response: BackendProblemResponse,
): ProblemDetail {
  const base = mapProblem(response);
  const detail: BackendProblemDetail = response.detail ?? {
    summary: "",
    companies: null,
    constraints_json: [],
    follow_up: "",
    hints: null,
  };
  const examples = (response.examples ?? []).filter(
    Boolean,
  ) as BackendExample[];

  return {
    ...base,
    content: detail.summary ?? response.summary ?? "",
    summary: detail.summary ?? response.summary ?? "",
    constraints: detail.constraints_json ?? response.constraints ?? [],
    followUp: detail.follow_up ?? response.followUp ?? "",
    companies: detail.companies ?? response.companies ?? [],
    starterNotes: detail.hints ?? response.starterNotes ?? [],
    testCases: examples.length > 0 ? mapExamplesToTestCases(examples) : [],
    examples: examples.length > 0 ? mapExamplesToDescription(examples) : [],
  } as ProblemDetail;
}
