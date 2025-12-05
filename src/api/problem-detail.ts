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

export async function fetchProblemDetailById(
  id: number | string,
): Promise<ProblemDetail> {
  const response = await apiGet<ProblemDetail & { examples: BackendExample[]; constraints_json: string[]; summary: string; follow_up: string }>(`/problems/${id}`);
  
  // Map backend naming to frontend interface
  response.content = response.summary || '';
  response.constraints = response.constraints_json || [];
  response.followUp = response.follow_up;
  
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
