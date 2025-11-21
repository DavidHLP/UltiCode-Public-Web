import { http, HttpResponse } from "msw";
import {
  fetchProblemListItem,
  fetchProblemLists,
  getProblemListStats,
  getProblemsByListId,
} from "@/mocks/api/problem-list";

export const problemListHandlers = [
  http.get("/api/problem-lists", () => {
    return HttpResponse.json(fetchProblemLists());
  }),

  http.get("/api/problem-lists/:id", ({ params }) => {
    const listId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!listId) {
      return HttpResponse.json(
        { message: "List id required" },
        { status: 400 },
      );
    }
    const list = fetchProblemListItem(listId);
    if (!list) {
      return HttpResponse.json({ message: "List not found" }, { status: 404 });
    }
    return HttpResponse.json(list);
  }),

  http.get("/api/problem-lists/:id/problems", ({ params }) => {
    const listId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!listId) {
      return HttpResponse.json(
        { message: "List id required" },
        { status: 400 },
      );
    }
    return HttpResponse.json(getProblemsByListId(listId));
  }),

  http.get("/api/problem-lists/stats", () => {
    return HttpResponse.json(getProblemListStats());
  }),
];
