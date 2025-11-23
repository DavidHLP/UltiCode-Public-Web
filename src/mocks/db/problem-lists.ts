

const data = {
  problem_list_groups: [
    { id: "group-created", name: "Created by me", sort_order: 0 },
    { id: "group-saved", name: "Saved by me", sort_order: 1 },
  ],
  problem_lists: [
    {
      id: "list-warmup",
      group_id: "group-created",
      name: "Warmup trio",
      description: "Three linked problems used across the mock pages.",
      author_id: "u-001",
      is_public: true,
      created_at: "2024-01-10T00:00:00.000Z",
      updated_at: "2024-02-01T00:00:00.000Z",
    },
    {
      id: "list-patterns",
      group_id: "group-saved",
      name: "Patterns to revisit",
      description: "Hash map, linked list, and two-pointer exemplars.",
      author_id: "u-001",
      is_public: true,
      created_at: "2024-01-15T00:00:00.000Z",
      updated_at: "2024-02-02T00:00:00.000Z",
    },
  ],
  problem_list_relations: [
    { list_id: "list-warmup", problem_id: 1 },
    { list_id: "list-warmup", problem_id: 2 },
    { list_id: "list-warmup", problem_id: 3 },
    { list_id: "list-patterns", problem_id: 1 },
    { list_id: "list-patterns", problem_id: 3 },
  ],
  problem_list_saved_relations: [
    { user_id: "u-001", list_id: "list-patterns" },
  ],
  problem_list_favorite_relations: [
    { user_id: "u-001", list_id: "list-warmup" },
  ],
} as const;

export default data;
