import type { SolutionTopicsResponse } from "@/mocks/schema/topic";
import solutionTopics from "@/mocks/db/topic";

export function fetchSolutionTopics(): SolutionTopicsResponse {
  return {
    topics: solutionTopics,
  };
}
