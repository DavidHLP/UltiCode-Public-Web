import type { Problem } from "@/mocks/schema/problem";
import type { ProblemList, ProblemListItem } from "@/mocks/schema/problem-list";
import problemListData from "@/mocks/db/problem-lists";
import { fetchProblems } from "@/mocks/api/problem";
import { fetchCurrentUserId } from "@/mocks/api/user";

const relationsByListId = problemListData.problem_list_relations.reduce<
  Map<string, number[]>
>((acc, relation) => {
  if (!acc.has(relation.list_id)) {
    acc.set(relation.list_id, []);
  }
  acc.get(relation.list_id)!.push(relation.problem_id);
  return acc;
}, new Map());

const listsById = new Map(
  problemListData.problem_lists.map((list) => [list.id, list]),
);

function toItem(listId: string): ProblemListItem | undefined {
  const list = listsById.get(listId);
  if (!list) return undefined;
  return {
    id: list.id,
    name: list.name,
    description: list.description,
    problemCount: relationsByListId.get(list.id)?.length ?? 0,
    createdAt: list.created_at ? new Date(list.created_at) : undefined,
    updatedAt: list.updated_at ? new Date(list.updated_at) : undefined,
  };
}

function buildGroupedLists(): ProblemList[] {
  const uid = fetchCurrentUserId();

  const createdIds = problemListData.problem_lists
    .filter((l) => l.author_id === uid)
    .map((l) => l.id);

  const savedSet = new Set(
    (problemListData.problem_list_saved_relations || [])
      .filter((r) => r.user_id === uid)
      .map((r) => r.list_id),
  );
  const savedIds = problemListData.problem_lists
    .filter((l) => savedSet.has(l.id))
    .map((l) => l.id);

  const favoriteSet = new Set(
    (problemListData.problem_list_favorite_relations || [])
      .filter((r) => r.user_id === uid)
      .map((r) => r.list_id),
  );
  const favoriteIds = problemListData.problem_lists
    .filter((l) => favoriteSet.has(l.id))
    .map((l) => l.id);

  const groups = problemListData.problem_list_groups;
  return groups.map((group) => {
    let listIds: string[] = [];
    if (group.name.toLowerCase().includes("created")) listIds = createdIds;
    else if (group.name.toLowerCase().includes("saved")) listIds = savedIds;
    else if (group.name.toLowerCase().includes("favorite"))
      listIds = favoriteIds;

    const items = listIds
      .map((id) => toItem(id))
      .filter((x): x is ProblemListItem => Boolean(x));
    return { name: group.name, items };
  });
}

export function fetchProblemLists(): ProblemList[] {
  return buildGroupedLists();
}

export function fetchProblemListItem(
  listId: string,
): ProblemListItem | undefined {
  const list = listsById.get(listId);
  if (!list) return undefined;
  return {
    id: list.id,
    name: list.name,
    description: list.description,
    problemCount: relationsByListId.get(list.id)?.length ?? 0,
    createdAt: list.created_at ? new Date(list.created_at) : undefined,
    updatedAt: list.updated_at ? new Date(list.updated_at) : undefined,
  };
}

export function getProblemsByListId(listId: string): Problem[] {
  const problemIds = relationsByListId.get(listId) ?? [];
  const problemSet = new Set(problemIds);
  return fetchProblems().filter((problem) => problemSet.has(problem.id));
}

export function getProblemCountByListId(listId: string): number {
  return relationsByListId.get(listId)?.length ?? 0;
}

export function isProblemInList(problemId: number, listId: string): boolean {
  const problemIds = relationsByListId.get(listId) ?? [];
  return problemIds.includes(problemId);
}

export function getProblemListStats() {
  return Array.from(relationsByListId.entries()).map(([listId, problemIds]) => {
    const problemSet = new Set(problemIds);
    const listProblems = fetchProblems().filter((problem) =>
      problemSet.has(problem.id),
    );
    const solvedCount = listProblems.filter(
      (p) => p.status === "solved",
    ).length;
    const attemptedCount = listProblems.filter(
      (p) => p.status === "attempted",
    ).length;
    const todoCount = listProblems.filter((p) => p.status === "todo").length;

    return {
      listId,
      totalCount: problemIds.length,
      solvedCount,
      attemptedCount,
      todoCount,
      progress:
        problemIds.length > 0 ? (solvedCount / problemIds.length) * 100 : 0,
    };
  });
}

export function getProblemsByListIdAndTag(
  listId: string,
  tag: string,
): Problem[] {
  return getProblemsByListId(listId).filter((problem) =>
    problem.tags.includes(tag),
  );
}

export function getProblemsByListIdAndDifficulty(
  listId: string,
  difficulty: "Easy" | "Medium" | "Hard",
): Problem[] {
  return getProblemsByListId(listId).filter(
    (problem) => problem.difficulty === difficulty,
  );
}

export function getProblemsByListIdAndStatus(
  listId: string,
  status: "solved" | "attempted" | "todo",
): Problem[] {
  return getProblemsByListId(listId).filter(
    (problem) => problem.status === status,
  );
}
