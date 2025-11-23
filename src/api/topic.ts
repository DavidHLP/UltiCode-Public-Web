import { apiGet } from "@/api/client";
import type { SolutionTopicsResponse } from "@/mocks/schema/topic";

export async function fetchSolutionTopics(): Promise<SolutionTopicsResponse> {
  return apiGet<SolutionTopicsResponse>("/solution-topics");
}
