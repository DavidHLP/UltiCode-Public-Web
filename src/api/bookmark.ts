import { apiGet, apiPost, apiPatch, apiDelete } from "@/utils/request";
import type {
  BookmarkFolder,
  BookmarkFolderWithItems,
  Bookmark,
  CreateFolderInput,
  UpdateFolderInput,
  AddBookmarkInput,
  UpdateBookmarkInput,
  BookmarkType,
} from "@/types/bookmark";

export { BookmarkType } from "@/types/bookmark";

export async function fetchFolders(): Promise<BookmarkFolder[]> {
  return apiGet<BookmarkFolder[]>("/bookmarks/folders");
}

export async function fetchFolder(
  id: string,
): Promise<BookmarkFolderWithItems> {
  return apiGet<BookmarkFolderWithItems>(`/bookmarks/folders/${id}`);
}

export async function createFolder(
  data: CreateFolderInput,
): Promise<BookmarkFolder> {
  return apiPost<BookmarkFolder>("/bookmarks/folders", data);
}

export async function updateFolder(
  id: string,
  data: UpdateFolderInput,
): Promise<BookmarkFolder> {
  return apiPatch<BookmarkFolder>(`/bookmarks/folders/${id}`, data);
}

export async function deleteFolder(id: string): Promise<void> {
  await apiDelete(`/bookmarks/folders/${id}`);
}

export async function addBookmark(
  folderId: string,
  data: AddBookmarkInput,
): Promise<Bookmark> {
  return apiPost<Bookmark>(`/bookmarks/folders/${folderId}/items`, data);
}

export async function removeBookmark(
  folderId: string,
  bookmarkId: string,
): Promise<void> {
  await apiDelete(`/bookmarks/folders/${folderId}/items/${bookmarkId}`);
}

export async function removeBookmarkByTarget(
  folderId: string,
  targetType: BookmarkType,
  targetId: string,
): Promise<void> {
  await apiDelete(
    `/bookmarks/folders/${folderId}/items/target/${targetType}/${targetId}`,
  );
}

export async function updateBookmark(
  folderId: string,
  bookmarkId: string,
  data: UpdateBookmarkInput,
): Promise<Bookmark> {
  return apiPatch<Bookmark>(
    `/bookmarks/folders/${folderId}/items/${bookmarkId}`,
    data,
  );
}

export async function getBookmarkFolders(
  targetType: BookmarkType,
  targetId: string,
): Promise<string[]> {
  return apiGet<string[]>(`/bookmarks/item/${targetType}/${targetId}`);
}

export async function reorderFolders(folderIds: string[]): Promise<void> {
  await apiPost("/bookmarks/folders/reorder", { folderIds });
}
