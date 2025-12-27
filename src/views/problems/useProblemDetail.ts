import { ref, watch, type Ref } from "vue";
import type { ProblemDetail } from "@/types/problem-detail";
import type { ProblemRunResult } from "@/types/test-results";
import { fetchProblemDetailById } from "@/api/problem-detail";
import { fetchCurrentUserId } from "@/utils/auth";
import { problemHooks } from "@/hooks/problem-hooks";
import { useBottomPanelStore } from "./test/test";
import { runSubmission } from "@/api/submission";
import { useProblemEditorStore } from "@/stores/problemEditorStore";
import { storeToRefs } from "pinia";

const supportedRunLanguages = new Set(["javascript", "typescript", "js", "ts"]);

export function useProblemDetail(slug: Ref<string | null | undefined>) {
  const problem = ref<ProblemDetail | null>(null);
  const runResult = ref<ProblemRunResult | null>(null);
  const isLoading = ref(false);
  const bottomPanelStore = useBottomPanelStore();
  const editorStore = useProblemEditorStore();
  const { code, language } = storeToRefs(editorStore);

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
      const currentCode = code.value;
      const currentLanguage = language.value || "typescript";
      if (!currentCode.trim()) {
        runResult.value = null;
        return;
      }
      const normalizedLanguage = currentLanguage.toLowerCase();
      if (!supportedRunLanguages.has(normalizedLanguage)) {
        runResult.value = {
          id: `run-unsupported-${Date.now()}`,
          submissionId: `run-unsupported-${Date.now()}`,
          problemId: problem.value.id,
          userId: "anonymous",
          verdict: "Compile Error",
          runtime: "0 ms",
          memory: "0 MB",
          cases: [],
          error_message: `Language ${currentLanguage} is not supported.`,
        };
        await problemHooks.emit("problem:run:error", {
          problemId: problem.value.id,
          error: new Error(`Unsupported language: ${currentLanguage}`),
        });
        return;
      }
      const cases =
        bottomPanelStore.testCases.value.length > 0
          ? bottomPanelStore.testCases.value
          : (problem.value.testCases ?? []);
      await problemHooks.emit("problem:run:before", {
        problemId: problem.value.id,
        caseCount: cases.length,
      });
      try {
        const result = await runSubmission(problem.value.id, {
          language: currentLanguage,
          code: currentCode,
          testCases: cases,
        });
        runResult.value = result;
        await problemHooks.emit("problem:run:after", {
          problemId: problem.value.id,
          runResult: result,
        });
      } catch (error) {
        console.error("Failed to run submission", error);
        runResult.value = null;
        await problemHooks.emit("problem:run:error", {
          problemId: problem.value.id,
          error,
        });
      }
    },
  );

  return {
    problem,
    runResult,
    isLoading,
    loadProblem,
  };
}
