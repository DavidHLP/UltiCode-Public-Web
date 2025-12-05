import { apiGet, apiPost } from "@/utils/request";
import type {
  ForumCommunity,
  ForumModerator,
  ForumPost,
  ForumThread,
  ForumTrendingTopic,
} from "@/types/forum";

export async function fetchForumPosts(): Promise<ForumPost[]> {
  return apiGet<ForumPost[]>("/forum/posts");
}

export async function fetchForumTrendingTopics(): Promise<
  ForumTrendingTopic[]
> {
  return apiGet<ForumTrendingTopic[]>("/forum/trending");
}

export async function fetchForumCommunities(): Promise<ForumCommunity[]> {
  return apiGet<ForumCommunity[]>("/forum/communities");
}

export async function fetchForumModerators(): Promise<ForumModerator[]> {
  return apiGet<ForumModerator[]>("/forum/moderators");
}

export async function fetchForumQuickFilters(): Promise<
  Array<{ label: string; value: string }>
> {
  return apiGet<Array<{ label: string; value: string }>>(
    "/forum/quick-filters",
  );
}

export async function fetchForumThread(postId: string): Promise<ForumThread> {
  return apiGet<ForumThread>(`/forum/posts/${postId}/thread`);
}

export async function createForumComment(
  postId: string,
  body: string,
  parentId?: string | null,
): Promise<void> {
  await apiPost<unknown>(`/forum/posts/${postId}/comments`, {
    body,
    parentId: parentId ?? null,
  });
}
