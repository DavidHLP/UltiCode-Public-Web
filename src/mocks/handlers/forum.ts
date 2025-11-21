import { http, HttpResponse } from "msw";
import {
  createForumComment,
  fetchForumCommunities,
  fetchForumModerators,
  fetchForumPosts,
  fetchForumQuickFilters,
  fetchForumThread,
  fetchForumTrendingTopics,
} from "@/mocks/api/forum";

export const forumHandlers = [
  http.get("/api/forum/posts", () => HttpResponse.json(fetchForumPosts())),
  http.get("/api/forum/trending", () =>
    HttpResponse.json(fetchForumTrendingTopics()),
  ),
  http.get("/api/forum/communities", () =>
    HttpResponse.json(fetchForumCommunities()),
  ),
  http.get("/api/forum/moderators", () =>
    HttpResponse.json(fetchForumModerators()),
  ),
  http.get("/api/forum/quick-filters", () =>
    HttpResponse.json(fetchForumQuickFilters()),
  ),
  http.get("/api/forum/posts/:id/thread", ({ params }) => {
    const postId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!postId) {
      return HttpResponse.json(
        { message: "Post id required" },
        { status: 400 },
      );
    }
    try {
      return HttpResponse.json(fetchForumThread(postId));
    } catch (error) {
      return HttpResponse.json(
        { message: (error as Error).message },
        { status: 404 },
      );
    }
  }),
  http.post("/api/forum/posts/:id/comments", async ({ params, request }) => {
    const postId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!postId) {
      return HttpResponse.json(
        { message: "Post id required" },
        { status: 400 },
      );
    }
    const payload = (await request.json().catch(() => ({}))) as Partial<{
      body: string;
      parentId: string | null;
    }>;
    const content = typeof payload.body === "string" ? payload.body : "";
    const parentId = payload.parentId ?? null;
    try {
      createForumComment(postId, content, parentId);
      return HttpResponse.json({ ok: true }, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        { message: (error as Error).message },
        { status: 400 },
      );
    }
  }),
];
