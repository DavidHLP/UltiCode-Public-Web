import type { ProblemDetail } from "@/types/problem-detail";
import { apiGet } from "@/utils/request";

export async function fetchProblemDetailById(
  id: number | string,
): Promise<ProblemDetail> {
  const response = await apiGet<ProblemDetail & { examples: any[] }>(`/problems/${id}`);
  
  if (response.examples && response.examples.length > 0) {
    response.testCases = response.examples.map((ex, index) => ({
      id: ex.id || `case-${index}`,
      label: `Case ${index + 1}`,
      explanation: ex.explanation,
      inputs: ex.inputs ? ex.inputs.map((input: any) => ({
        name: input.name,
        value: input.value,
        label: input.name,
      })) : [],
      // Use outputText as the expected output for reference if needed
      output: ex.outputText, 
    }));
  }
  
  return response;
}
