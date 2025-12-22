import { apiGet } from "@/utils/request";
import type { Problem } from "@/types/problem";
import { mapProblem } from "@/api/problem";
import type {
  ProblemListGroup,
  ProblemListStats,
  ProblemListId,
  ProblemListItem,
  ProblemList,
} from "@/types/problem-list";

function mapProblemList(input: unknown): ProblemList {
  if (!input || typeof input !== "object") {
    return {
      id: "",
      name: "",
      description: undefined,
      problemCount: 0,
    };
  }
  const raw = input as Record<string, unknown>;
  const rawCount = raw.problemCount ?? raw.problem_count ?? 0;
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    description:
      typeof raw.description === "string" ? raw.description : undefined,
    problemCount: Number(rawCount) || 0,
  };
}

function mapProblemListGroup(input: unknown): ProblemListGroup {
  if (!input || typeof input !== "object") {
    return { id: "", name: "", lists: [] };
  }
  const raw = input as Record<string, unknown>;
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    sortOrder:
      typeof raw.sortOrder === "number"
        ? raw.sortOrder
        : typeof raw.sort_order === "number"
          ? raw.sort_order
          : undefined,
    lists: Array.isArray(raw.lists) ? raw.lists.map(mapProblemList) : [],
  };
}

function mapProblemListItem(input: unknown): ProblemListItem {
  if (!input || typeof input !== "object") {
    return {
      id: "",
      name: "",
    };
  }
  const raw = input as Record<string, unknown>;
  const createdRaw = raw.createdAt ?? raw.created_at;
  const updatedRaw = raw.updatedAt ?? raw.updated_at;
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    description:
      typeof raw.description === "string" ? raw.description : undefined,
    authorId:
      typeof raw.authorId === "string"
        ? raw.authorId
        : typeof raw.author_id === "string"
          ? raw.author_id
          : undefined,
    groupId:
      typeof raw.groupId === "string"
        ? raw.groupId
        : typeof raw.group_id === "string"
          ? raw.group_id
          : undefined,
    isPublic:
      typeof raw.isPublic === "boolean"
        ? raw.isPublic
        : typeof raw.is_public === "boolean"
          ? raw.is_public
          : undefined,
    createdAt:
      createdRaw instanceof Date
        ? createdRaw.toISOString()
        : typeof createdRaw === "string"
          ? createdRaw
          : undefined,
    updatedAt:
      updatedRaw instanceof Date
        ? updatedRaw.toISOString()
        : typeof updatedRaw === "string"
          ? updatedRaw
          : undefined,
  };
}

export async function fetchProblemLists(): Promise<ProblemListGroup[]> {
  const data = await apiGet<unknown[]>("/problem-lists");
  return data.map(mapProblemListGroup);
}

export async function fetchProblemListItem(
  id: ProblemListId,
): Promise<ProblemListItem | null> {
  const data = await apiGet<unknown>(`/problem-lists/${id}`);
  if (data === null || data === undefined) {
    return null;
  }
  return mapProblemListItem(data);
}

export async function fetchProblemListStats(
  userId?: string,
): Promise<ProblemListStats[]> {
  const query = userId ? `?userId=${userId}` : "";
  return apiGet<ProblemListStats[]>(`/problem-lists/stats${query}`);
}

export async function fetchProblemsByListId(
  listId: ProblemListId,
  userId?: string,
): Promise<Problem[]> {
  const query = userId ? `?userId=${userId}` : "";
  const data = await apiGet<unknown[]>(
    `/problem-lists/${listId}/problems${query}`,
  );
  return data.map(mapProblem);
}
