import { http, HttpResponse } from "msw";
import { fetchProblemById, fetchProblems } from "@/mocks/api/problem";
import { fetchProblemDetailById } from "@/mocks/api/problem-detail";
import { fetchProblemRunResultByProblemId } from "@/mocks/api/test-results";
import { fetchProblemSubmissions } from "@/mocks/api/submission";
import { fetchTestCasesByProblemId } from "@/mocks/api/test-case";
import {
  fetchSolutionFeedItems,
  fetchSolutionLanguageOptions,
  fetchSolutionQuickFilterOptions,
  fetchSolutionSortOptions,
  fetchSolutionTopicOptions,
} from "@/mocks/api/solution";

export const problemHandlers = [
  http.get("/api/problems", () => {
    return HttpResponse.json(fetchProblems());
  }),

  http.get("/api/problems/:id", ({ params }) => {
    const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
    const id = Number(idParam);
    const problem = Number.isFinite(id) ? fetchProblemById(id) : undefined;
    if (!problem) {
      return HttpResponse.json(
        { message: "Problem not found" },
        { status: 404 },
      );
    }
    return HttpResponse.json(problem);
  }),

  http.get("/api/problems/:id/detail", ({ params }) => {
    const problemIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
    const problemId = Number(problemIdParam);
    if (!Number.isFinite(problemId)) {
      return HttpResponse.json(
        { message: "Invalid problem id" },
        { status: 400 },
      );
    }
    try {
      const detail = fetchProblemDetailById(problemId);
      return HttpResponse.json(detail);
    } catch (error) {
      return HttpResponse.json(
        { message: (error as Error).message },
        { status: 404 },
      );
    }
  }),

  http.get("/api/problems/:id/results", ({ params }) => {
    const problemIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
    const problemId = Number(problemIdParam);
    if (!Number.isFinite(problemId)) {
      return HttpResponse.json(
        { message: "Invalid problem id" },
        { status: 400 },
      );
    }
    const results = fetchProblemRunResultByProblemId(problemId);
    return HttpResponse.json(results);
  }),

  http.get("/api/problems/:id/submissions", ({ params }) => {
    const problemIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
    const problemId = Number(problemIdParam);
    if (!Number.isFinite(problemId)) {
      return HttpResponse.json(
        { message: "Invalid problem id" },
        { status: 400 },
      );
    }
    const submissions = fetchProblemSubmissions(problemId);
    return HttpResponse.json(submissions);
  }),

  http.get("/api/problems/:id/test-cases", ({ params }) => {
    const problemIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
    const problemId = Number(problemIdParam);
    if (!Number.isFinite(problemId)) {
      return HttpResponse.json(
        { message: "Invalid problem id" },
        { status: 400 },
      );
    }
    return HttpResponse.json(fetchTestCasesByProblemId(problemId));
  }),

  http.get("/api/problems/:id/solutions", ({ params }) => {
    const problemIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
    const problemId = Number(problemIdParam);
    if (!Number.isFinite(problemId)) {
      return HttpResponse.json(
        { message: "Invalid problem id" },
        { status: 400 },
      );
    }
    const detail = fetchProblemDetailById(problemId);
    const feedItems = fetchSolutionFeedItems(detail.approaches);
    const response = {
      items: feedItems,
      languageOptions: fetchSolutionLanguageOptions(feedItems),
      topicOptions: fetchSolutionTopicOptions(feedItems),
      quickFilterOptions: fetchSolutionQuickFilterOptions(),
      sortOptions: fetchSolutionSortOptions(),
    };
    return HttpResponse.json(response);
  }),
];
