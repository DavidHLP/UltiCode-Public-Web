import { ref } from "vue";
import type { ProblemTestCase } from "@/mocks/schema/problem-detail";

const activeCaseLabel = ref<string | null>(null);
const testCases = ref<ProblemTestCase[]>([]);
const lastRunToken = ref<number>(0);

const requestRun = () => {
  lastRunToken.value = Date.now();
};

const updateTestCases = (cases: ProblemTestCase[]) => {
  testCases.value = cases;
};

export const useBottomPanelStore = () => {
  return {
    activeCaseLabel,
    testCases,
    lastRunToken,
    requestRun,
    updateTestCases,
  };
};
