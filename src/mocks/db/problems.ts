import type { MockDatabase } from "../validation/validator";

const data = {
  problems: [
    {
      id: 1,
      slug: "two-sum",
      title: "Two Sum",
      difficulty: "Easy",
      acceptance_rate: 51.2,
      status: "solved",
      is_premium: false,
      has_solution: true,
      completed_time: "2024-11-15",
    },
    {
      id: 2,
      slug: "add-two-numbers",
      title: "Add Two Numbers",
      difficulty: "Medium",
      acceptance_rate: 41.5,
      status: "attempted",
      is_premium: false,
      has_solution: true,
    },
    {
      id: 3,
      slug: "container-with-most-water",
      title: "Container With Most Water",
      difficulty: "Medium",
      acceptance_rate: 55.1,
      status: "todo",
      is_premium: false,
      has_solution: true,
    },
    {
      id: 4,
      slug: "min-cost-to-connect-all-points",
      title: "Min Cost to Connect All Points",
      difficulty: "Hard",
      acceptance_rate: 46.3,
      status: "todo",
      is_premium: false,
      has_solution: true,
    },
  ],
  problem_tags: [
    { id: "tag-arrays", label: "Arrays" },
    { id: "tag-hashmap", label: "Hash Map" },
    { id: "tag-linked-list", label: "Linked List" },
    { id: "tag-two-pointers", label: "Two Pointers" },
    { id: "tag-graph", label: "Graph" },
    { id: "tag-union-find", label: "Union Find" },
  ],
  problem_tag_relations: [
    { problem_id: 1, tag_id: "tag-arrays" },
    { problem_id: 1, tag_id: "tag-hashmap" },
    { problem_id: 2, tag_id: "tag-linked-list" },
    { problem_id: 3, tag_id: "tag-two-pointers" },
    { problem_id: 4, tag_id: "tag-graph" },
    { problem_id: 4, tag_id: "tag-union-find" },
  ],
} as const satisfies MockDatabase;

export default data;
