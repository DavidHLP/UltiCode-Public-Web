import type { MockDatabase } from "../validation/validator";

const data = {
  test_cases: [
    {
      id: "tc-two-sum",
      problem_id: 1,
      label: "Basic pair",
      explanation: "Simple complement lookup.",
    },
    {
      id: "tc-add-two",
      problem_id: 2,
      label: "Carry chain",
      explanation: "Multiple carries in a row.",
    },
    {
      id: "tc-container",
      problem_id: 3,
      label: "Wide span",
      explanation: "Max area near the edges.",
    },
    {
      id: "tc-min-cost",
      problem_id: 4,
      label: "Star bridge",
      explanation: "Forces MST to pick balanced Manhattan edges.",
    },
    {
      id: "tc-level-order",
      problem_id: 5,
      label: "Balanced tree BFS",
      explanation: "Three-level traversal with missing grandchildren.",
    },
    {
      id: "tc-lru-cache",
      problem_id: 6,
      label: "Eviction flow",
      explanation: "Exercises eviction after reordering recency.",
    },
  ],
  test_case_inputs: [
    {
      id: "tci-two-sum-nums",
      test_case_id: "tc-two-sum",
      field_name: "nums",
      label: "nums",
      value: "[2,7,11,15]",
    },
    {
      id: "tci-two-sum-target",
      test_case_id: "tc-two-sum",
      field_name: "target",
      label: "target",
      value: "9",
    },
    {
      id: "tci-add-two-l1",
      test_case_id: "tc-add-two",
      field_name: "l1",
      label: "l1",
      value: "[9,9,9]",
    },
    {
      id: "tci-add-two-l2",
      test_case_id: "tc-add-two",
      field_name: "l2",
      label: "l2",
      value: "[1]",
    },
    {
      id: "tci-container-height",
      test_case_id: "tc-container",
      field_name: "height",
      label: "height",
      value: "[1,8,6,2,5,4,8,3,7]",
    },
    {
      id: "tci-min-cost-points",
      test_case_id: "tc-min-cost",
      field_name: "points",
      label: "points",
      value: "[[0,0],[2,2],[3,10],[5,2],[7,0]]",
    },
    {
      id: "tci-level-root",
      test_case_id: "tc-level-order",
      field_name: "root",
      label: "root",
      value: "[3,9,20,null,null,15,7]",
    },
    {
      id: "tci-lru-ops",
      test_case_id: "tc-lru-cache",
      field_name: "operations",
      label: "operations",
      value:
        '["LRUCache","put","put","get","put","get","put","get","get","get"]',
    },
    {
      id: "tci-lru-values",
      test_case_id: "tc-lru-cache",
      field_name: "values",
      label: "values",
      value: "[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]",
    },
  ],
} as const satisfies MockDatabase;

export default data;
