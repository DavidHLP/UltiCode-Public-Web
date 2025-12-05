import type { ProblemDetail } from "@/types/problem-detail";
import { apiGet } from "@/utils/request";

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

interface BackendProblemResponse extends ProblemDetail {
  detail: BackendProblemDetail;
  examples: BackendExample[];
}

export async function fetchProblemDetailById(
  id: number | string,
): Promise<ProblemDetail> {
  const response = await apiGet<BackendProblemResponse>(`/problems/${id}`);
  
  // Map backend naming to frontend interface
  // The backend returns a nested 'detail' object containing much of this info
  const detail = response.detail;

  response.content = detail.summary || '';
  response.constraints = detail.constraints_json || [];
  response.followUp = detail.follow_up;
  response.companies = detail.companies || [];
  response.starterNotes = detail.hints || [];
  
  if (response.examples && response.examples.length > 0) {
    const originalExamples = response.examples;

    // Map for TestCaseView (expecting inputs array)
    response.testCases = originalExamples.map((ex: BackendExample, index: number) => ({
      id: ex.id || `case-${index}`,
      label: `Case ${index + 1}`,
      explanation: ex.explanation,
      inputs: ex.inputs ? ex.inputs.map((input: BackendExampleInput) => ({
        name: input.name,
        value: input.value,
        label: input.name,
      })) : [],
      // Use outputText as the expected output for reference if needed
      output: ex.outputText, 
    }));

    // Map for DescriptionView (expecting input/output/explanation)
    (response as ProblemDetail).examples = originalExamples.map((ex: BackendExample) => ({
      input: ex.inputText || '', 
      output: ex.outputText || '',
      explanation: ex.explanation,
    }));
  }
  
  return response;
}
