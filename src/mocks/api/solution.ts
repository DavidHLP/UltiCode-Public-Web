import type { ProblemApproach } from "@/mocks/schema/problem-detail";
import type {
  SolutionFeedItem,
  SolutionFeedMeta,
} from "@/mocks/schema/solution";
import solutionDataRaw from "@/mocks/db/solution.json";

const solutionData = solutionDataRaw as {
  solution_filter_options: {
    id: string;
    label: string;
    value: string;
    kind: "quick" | "sort";
  }[];
  solution_authors: {
    id: string;
    name: string;
    role: string;
    avatar_color: string;
  }[];
  solution_badges: { id: string; label: string }[];
  solution_badge_relations: { badge_id: string; meta_id: string }[];
  solution_metas: {
    id: string;
    highlight: string;
    flair: string;
    author_id: string;
    views_text: string;
    likes: number;
    comments: number;
    created_at: string;
    published_at: string;
    topic: string;
    language_filter: string;
    score: number;
  }[];
  fallbackMetaId: string;
};

const quickFilterOptions = solutionData.solution_filter_options
  .filter((option) => option.kind === "quick")
  .map((option) => ({
    label: option.label,
    value: option.value,
  }));

const sortOptions = solutionData.solution_filter_options
  .filter((option) => option.kind === "sort")
  .map((option) => ({
    label: option.label,
    value: option.value,
  }));

const authorsById = new Map(
  solutionData.solution_authors.map((author) => [author.id, author])
);
const badgesById = new Map(
  solutionData.solution_badges.map((badge) => [badge.id, badge.label])
);

const badgesByMetaId = solutionData.solution_badge_relations.reduce<
  Map<string, string[]>
>((acc, relation) => {
  if (!acc.has(relation.meta_id)) {
    acc.set(relation.meta_id, []);
  }
  acc
    .get(relation.meta_id)!
    .push(badgesById.get(relation.badge_id) ?? relation.badge_id);
  return acc;
}, new Map());

const buildMeta = (
  metaRow: (typeof solutionData.solution_metas)[number]
): SolutionFeedMeta => {
  const author = authorsById.get(metaRow.author_id);
  if (!author) {
    throw new Error(`Missing solution author ${metaRow.author_id}`);
  }

  return {
    id: metaRow.id,
    highlight: metaRow.highlight,
    flair: metaRow.flair,
    authorId: metaRow.author_id,
    author: {
      id: author.id,
      name: author.name,
      role: author.role,
      avatar_color: author.avatar_color,
    },
    badges: badgesByMetaId.get(metaRow.id) ?? [],
    stats: {
      views: metaRow.views_text,
      likes: metaRow.likes,
      comments: metaRow.comments,
    },
    views: metaRow.views_text,
    likes: metaRow.likes,
    comments: metaRow.comments,
    createdAt: metaRow.created_at,
    publishedAt: metaRow.published_at,
    topic: metaRow.topic,
    languageFilter: metaRow.language_filter,
    score: metaRow.score,
  };
};

const metaRecords: SolutionFeedMeta[] =
  solutionData.solution_metas.map(buildMeta);
const fallbackMetaCandidate = metaRecords.find(
  (meta) => meta.id === solutionData.fallbackMetaId
);
if (!fallbackMetaCandidate) {
  throw new Error("Fallback solution meta missing");
}
const fallbackMeta = fallbackMetaCandidate;
const rotatingMetaSeed = metaRecords.filter(
  (meta) => meta.id !== fallbackMeta.id
) ?? [fallbackMeta];

export function fetchSolutionFeedItems(
  approaches: ProblemApproach[]
): SolutionFeedItem[] {
  if (!approaches.length) return [];

  const seed = rotatingMetaSeed.length ? rotatingMetaSeed : [fallbackMeta];

  return approaches.map((approach, index) => {
    const meta = seed[index % seed.length]!;
    const derivedTags = Array.from(
      new Set(
        [
          approach.language,
          ...approach.title.split(/\s+/).filter(Boolean),
          ...meta.badges,
        ]
          .map((tag) => tag.trim())
          .filter(Boolean)
      )
    );
    return {
      ...approach,
      ...meta,
      tags: derivedTags,
    };
  });
}

export function fetchSolutionLanguageOptions(items: SolutionFeedItem[]) {
  const uniqueLanguages = Array.from(
    new Set(
      items.map((item) => item.languageFilter || item.language).filter(Boolean)
    )
  );
  return [
    { label: "All languages", value: "all" },
    ...uniqueLanguages.map((lang) => ({
      label: lang,
      value: lang,
    })),
  ];
}

export function fetchSolutionTopicOptions(items: SolutionFeedItem[]) {
  const uniqueTopics = Array.from(
    new Set(items.map((item) => item.topic).filter(Boolean))
  );
  return [
    { label: "All topics", value: "all" },
    ...uniqueTopics.map((topic) => ({
      label: topic,
      value: topic,
    })),
  ];
}

export function fetchSolutionQuickFilterOptions() {
  return quickFilterOptions;
}

export function fetchSolutionSortOptions() {
  return sortOptions;
}
