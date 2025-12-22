import { ref, watch, type Ref } from "vue";
import type { ProblemDetail } from "@/types/problem-detail";
import type { ProblemRunResult } from "@/types/test-results";
import { fetchProblemDetailById } from "@/api/problem-detail";
import { fetchCurrentUserId } from "@/utils/auth";
import { problemHooks } from "@/hooks/problem-hooks";
import { useBottomPanelStore } from "./test/test";
import { buildRunResultFromCases } from "./test/run-result";

export function useProblemDetail(slug: Ref<string | null>) {
  const problem = ref<ProblemDetail | null>(null);
  const runResult = ref<ProblemRunResult | null>(null);
  const isLoading = ref(false);
  const bottomPanelStore = useBottomPanelStore();

  const loadProblem = async (value: string) => {
    await problemHooks.emit("problem:load:before", { slug: value });
    isLoading.value = true;
    try {
      const userId = fetchCurrentUserId();
      problem.value = await fetchProblemDetailById(value, userId ?? undefined);
      await problemHooks.emit("problem:load:after", {
        slug: value,
        problem: problem.value,
      });
    } catch (error) {
      console.error("Failed to load problem detail", error);
      problem.value = null;
      await problemHooks.emit("problem:load:error", { slug: value, error });
    } finally {
      isLoading.value = false;
    }
  };

  watch(
    slug,
    (value) => {
      if (!value) {
        problem.value = null;
        return;
      }
      void loadProblem(value);
    },
    { immediate: true },
  );

  watch(
    () => problem.value?.id,
    () => {
      runResult.value = null;
    },
  );

  watch(
    () => bottomPanelStore.lastRunToken.value,
    async () => {
      if (!problem.value) return;
      const cases =
        bottomPanelStore.testCases.value.length > 0
          ? bottomPanelStore.testCases.value
          : (problem.value.testCases ?? []);
      await problemHooks.emit("problem:run:before", {
        problemId: problem.value.id,
        caseCount: cases.length,
      });
      const result = buildRunResultFromCases(cases, problem.value.id);
      runResult.value = result;
      await problemHooks.emit("problem:run:after", {
        problemId: problem.value.id,
        runResult: result,
      });
    },
  );

  return {
    problem,
    runResult,
    isLoading,
    loadProblem,
  };
}
