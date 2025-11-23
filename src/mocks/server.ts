import {
    fetchContestDetail,
    fetchContestList,
    fetchContestRanking,
    fetchContestStats,
    fetchGlobalRankings,
    fetchPastContests,
    fetchRunningContests,
    fetchUpcomingContests,
} from "@/mocks/api/contest";
import {
    createForumComment,
    fetchForumCommunities,
    fetchForumModerators,
    fetchForumPosts,
    fetchForumQuickFilters,
    fetchForumThread,
    fetchForumTrendingTopics,
} from "@/mocks/api/forum";
import {
    fetchProblemDetailById,
} from "@/mocks/api/problem-detail";
import {
    fetchProblemListItem,
    fetchProblemLists,
    getProblemListStats,
    getProblemsByListId
} from "@/mocks/api/problem-list";
import {fetchProblemById, fetchProblems} from "@/mocks/api/problem";
import {
    fetchSolutionFeedItems,
    fetchSolutionQuickFilterOptions,
    fetchSolutionSortOptions,
} from "@/mocks/api/solution";
import {fetchProblemSubmissions} from "@/mocks/api/submission";
import {fetchTestCasesByProblemId} from "@/mocks/api/test-case";
import {fetchProblemRunResultByProblemId} from "@/mocks/api/test-results";

export type MockMethod = "GET" | "POST";

export interface MockRequestContext {
    params: Record<string, string>;
    searchParams: URLSearchParams;
    body?: unknown;
}

export interface MockResult<T = unknown> {
    status: number;
    data: T;
}

export interface MockRoute<T = unknown> {
    method: MockMethod;
    /**
     * Route path without the API base prefix (e.g. /problems/:id).
     */
    path: string;
    handler: (ctx: MockRequestContext) => MockResult<T> | Promise<MockResult<T>>;
}

type ParamParseResult =
    | { value: number }
    | { error: MockResult<{ message: string }> };

const ok = <T>(data: T, status = 200): MockResult<T> => ({status, data});
const badRequest = (message: string) => ok({message}, 400);
const notFound = (message: string) => ok({message}, 404);

function parseNumericParam(raw: string | undefined, fieldLabel: string): ParamParseResult {
    const value = Number(raw);
    if (!Number.isFinite(value)) {
        return {error: badRequest(`Invalid ${fieldLabel}`)};
    }
    return {value};
}

function matchPath(pathname: string, routePath: string): Record<string, string> | null {
    const normalize = (input: string) =>
        input
            .split("/")
            .filter(Boolean)
            .map((segment) => segment.trim())
            .filter(Boolean);

    const pathSegments = normalize(pathname);
    const routeSegments = normalize(routePath);

    if (pathSegments.length !== routeSegments.length) return null;

    const params: Record<string, string> = {};

    for (let i = 0; i < routeSegments.length; i += 1) {
        const routeSegment = routeSegments[i]!;
        const pathSegment = pathSegments[i]!;

        if (routeSegment.startsWith(":")) {
            params[routeSegment.slice(1)] = decodeURIComponent(pathSegment);
            continue;
        }

        if (routeSegment !== pathSegment) {
            return null;
        }
    }

    return params;
}

function stripBasePath(pathname: string, basePath: string): string {
    if (!basePath || basePath === "/") {
        return pathname;
    }

    const normalizedBase = basePath.endsWith("/")
        ? basePath.slice(0, -1)
        : basePath;

    if (pathname.startsWith(normalizedBase)) {
        const stripped = pathname.slice(normalizedBase.length) || "/";
        return stripped.startsWith("/") ? stripped : `/${stripped}`;
    }

    return pathname;
}

function findRoute(
    method: MockMethod,
    pathname: string,
): { route: MockRoute; params: Record<string, string> } | null {
    for (const route of mockRoutes) {
        if (route.method !== method) continue;
        const params = matchPath(pathname, route.path);
        if (params) {
            return {route, params};
        }
    }
    return null;
}

function getErrorMessage(result: MockResult<unknown>, pathname: string): string {
    const data = result.data;
    if (data && typeof data === "object" && "message" in data) {
        const message = (data as { message?: unknown }).message;
        if (typeof message === "string" && message.trim()) {
            return message;
        }
    }
    return `Request failed for ${pathname} with status ${result.status}`;
}

export const mockRoutes: MockRoute[] = [
    {
        method: "GET",
        path: "/problems",
        handler: () => ok(fetchProblems()),
    },
    {
        method: "GET",
        path: "/problems/:id",
        handler: ({params}) => {
            const parsed = parseNumericParam(params.id, "problem id");
            if ("error" in parsed) return parsed.error;

            const problem = fetchProblemById(parsed.value);
            if (!problem) return notFound("Problem not found");
            return ok(problem);
        },
    },
    {
        method: "GET",
        path: "/problems/:id/detail",
        handler: ({params}) => {
            const parsed = parseNumericParam(params.id, "problem id");
            if ("error" in parsed) return parsed.error;

            try {
                return ok(fetchProblemDetailById(parsed.value));
            } catch (error) {
                return notFound((error as Error).message);
            }
        },
    },
    {
        method: "GET",
        path: "/problems/:id/results",
        handler: ({params}) => {
            const parsed = parseNumericParam(params.id, "problem id");
            if ("error" in parsed) return parsed.error;
            return ok(fetchProblemRunResultByProblemId(parsed.value));
        },
    },
    {
        method: "GET",
        path: "/problems/:id/submissions",
        handler: ({params}) => {
            const parsed = parseNumericParam(params.id, "problem id");
            if ("error" in parsed) return parsed.error;
            return ok(fetchProblemSubmissions(parsed.value));
        },
    },
    {
        method: "GET",
        path: "/problems/:id/test-cases",
        handler: ({params}) => {
            const parsed = parseNumericParam(params.id, "problem id");
            if ("error" in parsed) return parsed.error;
            return ok(fetchTestCasesByProblemId(parsed.value));
        },
    },
    {
        method: "GET",
        path: "/problems/:id/solutions",
        handler: ({params}) => {
            const parsed = parseNumericParam(params.id, "problem id");
            if ("error" in parsed) return parsed.error;

            try {
                const detail = fetchProblemDetailById(parsed.value);
                return ok({
                    items: fetchSolutionFeedItems(detail.approaches),
                    quickFilterOptions: fetchSolutionQuickFilterOptions(),
                    sortOptions: fetchSolutionSortOptions(),
                });
            } catch (error) {
                return notFound((error as Error).message);
            }
        },
    },
    {
        method: "GET",
        path: "/problem-lists",
        handler: () => ok(fetchProblemLists()),
    },
    {
        method: "GET",
        path: "/problem-lists/:id",
        handler: ({params}) => {
            if (!params.id) return badRequest("List id required");
            const list = fetchProblemListItem(params.id);
            if (!list) return notFound("List not found");
            return ok(list);
        },
    },
    {
        method: "GET",
        path: "/problem-lists/:id/problems",
        handler: ({params}) => {
            if (!params.id) return badRequest("List id required");
            return ok(getProblemsByListId(params.id));
        },
    },
    {
        method: "GET",
        path: "/problem-lists/stats",
        handler: () => ok(getProblemListStats()),
    },
    {
        method: "GET",
        path: "/contest/list",
        handler: () => ok(fetchContestList()),
    },
    {
        method: "GET",
        path: "/contest/upcoming",
        handler: () => ok(fetchUpcomingContests()),
    },
    {
        method: "GET",
        path: "/contest/running",
        handler: () => ok(fetchRunningContests()),
    },
    {
        method: "GET",
        path: "/contest/past",
        handler: () => ok(fetchPastContests()),
    },
    {
        method: "GET",
        path: "/contest/global-ranking",
        handler: () => ok(fetchGlobalRankings()),
    },
    {
        method: "GET",
        path: "/contest/stats",
        handler: () => ok(fetchContestStats()),
    },
    {
        method: "GET",
        path: "/contest/:contestId/ranking",
        handler: ({params}) => {
            if (!params.contestId) return badRequest("Contest id required");
            return ok(fetchContestRanking(params.contestId));
        },
    },
    {
        method: "GET",
        path: "/contest/:contestId",
        handler: ({params}) => {
            if (!params.contestId) return badRequest("Contest id required");
            const detail = fetchContestDetail(params.contestId);
            if (!detail) return notFound("Contest not found");
            return ok(detail);
        },
    },
    {
        method: "GET",
        path: "/forum/posts",
        handler: () => ok(fetchForumPosts()),
    },
    {
        method: "GET",
        path: "/forum/trending",
        handler: () => ok(fetchForumTrendingTopics()),
    },
    {
        method: "GET",
        path: "/forum/communities",
        handler: () => ok(fetchForumCommunities()),
    },
    {
        method: "GET",
        path: "/forum/moderators",
        handler: () => ok(fetchForumModerators()),
    },
    {
        method: "GET",
        path: "/forum/quick-filters",
        handler: () => ok(fetchForumQuickFilters()),
    },
    {
        method: "GET",
        path: "/forum/posts/:id/thread",
        handler: ({params}) => {
            if (!params.id) return badRequest("Post id required");
            try {
                return ok(fetchForumThread(params.id));
            } catch (error) {
                return notFound((error as Error).message);
            }
        },
    },
    {
        method: "POST",
        path: "/forum/posts/:id/comments",
        handler: ({params, body}) => {
            if (!params.id) return badRequest("Post id required");

            const payload = (body ?? {}) as Partial<{
                body: string;
                parentId: string | null;
            }>;
            const content = typeof payload.body === "string" ? payload.body : "";
            const parentId =
                typeof payload.parentId === "string" || payload.parentId === null
                    ? payload.parentId
                    : null;

            try {
                createForumComment(params.id, content, parentId);
                return ok({ok: true}, 201);
            } catch (error) {
                return badRequest((error as Error).message);
            }
        },
    },
];

export async function handleMockRequest<T>(
    method: MockMethod,
    url: string,
    body?: unknown,
    basePath = "/api",
): Promise<T> {
    const parsedUrl = new URL(url, "http://localhost");
    const pathname = stripBasePath(parsedUrl.pathname, basePath);
    const matched = findRoute(method, pathname);

    if (!matched) {
        throw new Error(`No mock route matched ${method} ${pathname}`);
    }

    const result = await matched.route.handler({
        params: matched.params,
        searchParams: parsedUrl.searchParams,
        body,
    });

    if (result.status >= 400) {
        throw new Error(getErrorMessage(result, pathname));
    }

    return result.data as T;
}
