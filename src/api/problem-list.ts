import { apiGet, apiPost, apiDelete, apiPatch } from "@/utils/request";
import type { Problem } from "@/types/problem";
import { mapProblem } from "@/api/problem";
import type {
  ProblemListGroup,
  ProblemListStats,
  ProblemListId,
  ProblemListItem,
  ProblemList,
  ProblemListCategory,
  UserProblemListsResponse,
} from "@/types/problem-list";

// ============================================================================
// Mappers
// ============================================================================

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
    authorId:
      typeof raw.authorId === "string"
        ? raw.authorId
        : typeof raw.author_id === "string"
          ? raw.author_id
          : undefined,
    isPublic:
      typeof raw.isPublic === "boolean"
        ? raw.isPublic
        : typeof raw.is_public === "boolean"
          ? raw.is_public
          : undefined,
    isFeatured:
      typeof raw.isFeatured === "boolean"
        ? raw.isFeatured
        : typeof raw.is_featured === "boolean"
          ? raw.is_featured
          : undefined,
    isSaved: typeof raw.isSaved === "boolean" ? raw.isSaved : undefined,
    categoryId: typeof raw.categoryId === "string" ? raw.categoryId : undefined,
  };
}

function mapCategory(input: unknown): ProblemListCategory {
  if (!input || typeof input !== "object") {
    return { id: "", name: "", sortOrder: 0, lists: [] };
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
          : 0,
    lists: Array.isArray(raw.lists) ? raw.lists.map(mapProblemList) : [],
  };
}

function mapUserProblemListsResponse(input: unknown): UserProblemListsResponse {
  if (!input || typeof input !== "object") {
    return { myLists: [], savedLists: [], featured: [], categories: [] };
  }
  const raw = input as Record<string, unknown>;
  return {
    myLists: Array.isArray(raw.myLists) ? raw.myLists.map(mapProblemList) : [],
    savedLists: Array.isArray(raw.savedLists)
      ? raw.savedLists.map(mapProblemList)
      : [],
    featured: Array.isArray(raw.featured)
      ? raw.featured.map(mapProblemList)
      : [],
    categories: Array.isArray(raw.categories)
      ? raw.categories.map(mapCategory)
      : [],
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
    isPublic:
      typeof raw.isPublic === "boolean"
        ? raw.isPublic
        : typeof raw.is_public === "boolean"
          ? raw.is_public
          : undefined,
    isFeatured:
      typeof raw.isFeatured === "boolean"
        ? raw.isFeatured
        : typeof raw.is_featured === "boolean"
          ? raw.is_featured
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

// ============================================================================
// Main API: Get User's Problem Lists
// ============================================================================

export async function fetchUserProblemListsData(
  userId: string,
): Promise<UserProblemListsResponse> {
  const data = await apiGet<unknown>(`/problem-lists?userId=${userId}`);
  return mapUserProblemListsResponse(data);
}

// Legacy: For backward compatibility with old grouped structure
export async function fetchProblemLists(
  userId?: string,
): Promise<ProblemListGroup[]> {
  const query = userId ? `?userId=${userId}` : "";
  const data = await apiGet<unknown>(`/problem-lists${query}`);

  // Transform new response format to old grouped format for backward compatibility
  const response = mapUserProblemListsResponse(data);

  const groups: ProblemListGroup[] = [];

  if (response.myLists.length > 0) {
    groups.push({
      id: "my-lists",
      name: "My Lists",
      sortOrder: 0,
      lists: response.myLists,
    });
  }

  if (response.savedLists.length > 0) {
    groups.push({
      id: "saved-lists",
      name: "Saved Lists",
      sortOrder: 1,
      lists: response.savedLists,
    });
  }

  if (response.featured.length > 0) {
    groups.push({
      id: "featured",
      name: "Featured",
      sortOrder: 2,
      lists: response.featured,
    });
  }

  // Add user categories
  response.categories.forEach((cat, index) => {
    groups.push({
      id: cat.id,
      name: cat.name,
      sortOrder: 10 + index,
      lists: cat.lists,
    });
  });

  return groups;
}

export async function fetchFeaturedLists(): Promise<ProblemList[]> {
  const data = await apiGet<unknown[]>("/problem-lists/featured");
  return data.map(mapProblemList);
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

// ============================================================================
// List CRUD
// ============================================================================

export async function createProblemList(
  userId: string,
  data: { name: string; description?: string; isPublic?: boolean },
): Promise<ProblemListItem> {
  const res = await apiPost<unknown>(`/problem-lists?userId=${userId}`, data);
  return mapProblemListItem(res);
}

export async function updateProblemList(
  listId: string,
  userId: string,
  data: { name?: string; description?: string; isPublic?: boolean },
): Promise<void> {
  await apiPatch(`/problem-lists/${listId}?userId=${userId}`, data);
}

export async function deleteProblemList(
  listId: string,
  userId: string,
): Promise<void> {
  await apiDelete(`/problem-lists/${listId}?userId=${userId}`);
}

export async function forkProblemList(
  listId: string,
  userId: string,
): Promise<string> {
  const res = await apiPost<{ id: string }>(
    `/problem-lists/${listId}/fork?userId=${userId}`,
  );
  return res.id;
}

export async function fetchUserProblemLists(
  userId: string,
): Promise<ProblemListItem[]> {
  const data = await apiGet<unknown[]>(`/problem-lists/user/${userId}`);
  return data.map(mapProblemListItem);
}

// ============================================================================
// Problem Management in List
// ============================================================================

export async function addProblemToList(
  listId: string,
  userId: string,
  problemId: number,
): Promise<void> {
  await apiPost(`/problem-lists/${listId}/problems?userId=${userId}`, {
    problemId,
  });
}

export async function removeProblemFromList(
  listId: string,
  userId: string,
  problemId: number,
): Promise<void> {
  await apiDelete(
    `/problem-lists/${listId}/problems/${problemId}?userId=${userId}`,
  );
}

// ============================================================================
// Save/Unsave List
// ============================================================================

export async function saveList(
  listId: string,
  userId: string,
  categoryId?: string,
): Promise<void> {
  await apiPost(`/problem-lists/${listId}/save?userId=${userId}`, {
    categoryId,
  });
}

export async function unsaveList(
  listId: string,
  userId: string,
): Promise<void> {
  await apiDelete(`/problem-lists/${listId}/save?userId=${userId}`);
}

export async function isListSaved(
  listId: string,
  userId: string,
): Promise<boolean> {
  const res = await apiGet<{ saved: boolean }>(
    `/problem-lists/${listId}/saved?userId=${userId}`,
  );
  return res.saved;
}

export async function moveListToCategory(
  listId: string,
  userId: string,
  categoryId: string | null,
): Promise<void> {
  await apiPatch(`/problem-lists/${listId}/category?userId=${userId}`, {
    categoryId,
  });
}

// ============================================================================
// Category Management
// ============================================================================

export async function fetchCategories(
  userId: string,
): Promise<ProblemListCategory[]> {
  const data = await apiGet<unknown[]>(
    `/problem-lists/categories/user/${userId}`,
  );
  return data.map(mapCategory);
}

export async function createCategory(
  userId: string,
  data: { name: string; sortOrder?: number },
): Promise<ProblemListCategory> {
  const res = await apiPost<unknown>(
    `/problem-lists/categories?userId=${userId}`,
    data,
  );
  return mapCategory(res);
}

export async function updateCategory(
  categoryId: string,
  userId: string,
  data: { name?: string; sortOrder?: number },
): Promise<ProblemListCategory> {
  const res = await apiPatch<unknown>(
    `/problem-lists/categories/${categoryId}?userId=${userId}`,
    data,
  );
  return mapCategory(res);
}

export async function deleteCategory(
  categoryId: string,
  userId: string,
): Promise<void> {
  await apiDelete(`/problem-lists/categories/${categoryId}?userId=${userId}`);
}

// ============================================================================
// Legacy APIs - kept for backward compatibility but deprecated
// ============================================================================

/** @deprecated Use fetchCategories instead */
export async function fetchProblemListGroups(): Promise<ProblemListGroup[]> {
  // Redirect to new API
  return fetchProblemLists();
}

/** @deprecated Use createCategory instead */
export async function createProblemListGroup(data: {
  name: string;
  sortOrder?: number;
}): Promise<ProblemListGroup> {
  // This will fail - groups are now user-specific categories
  console.warn(
    "createProblemListGroup is deprecated, use createCategory instead",
  );
  return { id: "", name: data.name, lists: [] };
}

/** @deprecated Use updateCategory instead */
export async function updateProblemListGroup(
  groupId: string,
  data: { name?: string; sortOrder?: number },
): Promise<ProblemListGroup> {
  console.warn(
    "updateProblemListGroup is deprecated, use updateCategory instead",
  );
  return { id: groupId, name: data.name ?? "", lists: [] };
}

/** @deprecated Use deleteCategory instead */
export async function deleteProblemListGroup(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _groupId: string,
): Promise<void> {
  console.warn(
    "deleteProblemListGroup is deprecated, use deleteCategory instead",
  );
  // No-op
}

/** @deprecated Categories don't have the same moveListToGroup concept */
export async function moveListToGroup(
  listId: string,
  userId: string,
  _groupId: string,
): Promise<ProblemListItem> {
  console.warn("moveListToGroup is deprecated, use moveListToCategory instead");
  await moveListToCategory(listId, userId, _groupId);
  const item = await fetchProblemListItem(listId);
  return item ?? { id: listId, name: "" };
}
