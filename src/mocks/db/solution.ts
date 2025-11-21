import type { MockDatabase } from "../validation/validator";

const data = {
  fallbackMetaId: "sol-two-sum",
  solution_filter_options: [
    {
      id: "quick-popular",
      kind: "quick",
      label: "Most popular",
      value: "popular",
    },
    { id: "quick-latest", kind: "quick", label: "Latest", value: "latest" },
    { id: "sort-likes", kind: "sort", label: "Most likes", value: "likes" },
  ],
  solution_authors: [
    {
      id: "author-system",
      name: "System",
      role: "Editorial",
      avatar_color: "#94a3b8",
    },
    {
      id: "author-lee",
      name: "Lee",
      role: "TypeScript · Demo",
      avatar_color: "#0ea5e9",
    },
  ],
  solution_badges: [
    { id: "badge-one-pass", label: "One pass" },
    { id: "badge-clear", label: "Clear reasoning" },
    { id: "badge-two-pointers", label: "Two pointers" },
  ],
  solution_metas: [
    {
      id: "sol-two-sum",
      highlight: "Two Sum: one-pass hashmap explained with diagrams",
      flair: "Featured",
      author_id: "author-lee",
      views_text: "12.3K",
      likes: 128,
      comments: 14,
      created_at: "2024-08-01T08:00:00.000Z",
      published_at: "2024-08-01T09:00:00.000Z",
      topic: "arrays",
      language_filter: "typescript",
      score: 90,
    },
    {
      id: "sol-container",
      highlight: "Container With Most Water: proof for the two-pointer shrink",
      flair: "Deep dive",
      author_id: "author-system",
      views_text: "9.1K",
      likes: 96,
      comments: 7,
      created_at: "2024-08-02T10:00:00.000Z",
      published_at: "2024-08-02T11:00:00.000Z",
      topic: "two-pointers",
      language_filter: "all",
      score: 86,
    },
  ],
  solution_badge_relations: [
    { badge_id: "badge-one-pass", meta_id: "sol-two-sum" },
    { badge_id: "badge-clear", meta_id: "sol-two-sum" },
    { badge_id: "badge-two-pointers", meta_id: "sol-container" },
  ],
} as const satisfies MockDatabase;

export default data;
