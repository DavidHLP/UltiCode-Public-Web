import { LayoutGrid, Code2, Database, Terminal, Cpu } from "lucide-vue-next";

export const PROBLEM_CATEGORIES = [
  {
    title: "All Problems",
    name: "All Topics", // Keep name for pills if we want distinction, or just use title?
    // Let's rely on title for "All Problems" if we want to align.
    // But user might want "All Topics" in the pill list.
    // The user screenshot has "All Topics" in pills.
    // To avoid transformation, I should probably have the properties ready.
    value: "all",
    slug: "",
    url: "/problemset",
    icon: LayoutGrid,
  },
  {
    title: "Algorithms",
    name: "Algorithms",
    value: "algorithms",
    slug: "algorithms",
    url: "/problemset/algorithms",
    icon: Code2,
  },
  {
    title: "Database",
    name: "Database",
    value: "database",
    slug: "database",
    url: "/problemset/database",
    icon: Database,
  },
  {
    title: "Shell",
    name: "Shell",
    value: "shell",
    slug: "shell",
    url: "/problemset/shell",
    icon: Terminal,
  },
  {
    title: "Concurrency",
    name: "Concurrency",
    value: "concurrency",
    slug: "concurrency",
    url: "/problemset/concurrency",
    icon: Cpu,
  },
] as const;

// Helper to get category by value
export function getCategoryByValue(value: string) {
  return PROBLEM_CATEGORIES.find((c) => c.value === value);
}
