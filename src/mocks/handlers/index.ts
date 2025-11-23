import type { HttpHandler } from "msw";
import { HttpResponse, http } from "msw";
import { API_BASE_PATH } from "@/api/client";
import { mockRoutes } from "@/mocks/server";

function joinPath(base: string, routePath: string): string {
  const normalizedBase =
    base === "/"
      ? ""
      : base.endsWith("/")
        ? base.slice(0, -1)
        : base;
  const normalizedRoute = routePath.startsWith("/")
    ? routePath
    : `/${routePath}`;

  const fullPath = `${normalizedBase}${normalizedRoute}`.replace(
    /\/{2,}/g,
    "/",
  );

  return fullPath || "/";
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

export const handlers: HttpHandler[] = mockRoutes.map((route) => {
  const handlerFactory =
    route.method === "POST"
      ? http.post
      : http.get;

  return handlerFactory(
    joinPath(API_BASE_PATH, route.path),
    async ({ request, params }) => {
      const normalizedParams: Record<string, string> = {};
      for (const [key, value] of Object.entries(params)) {
        normalizedParams[key] = Array.isArray(value)
          ? value[0] ?? ""
          : value ?? "";
      }

      const result = await route.handler({
        params: normalizedParams,
        searchParams: new URL(request.url).searchParams,
        body: route.method === "POST" ? await readJson(request) : undefined,
      });

      return HttpResponse.json(result.data as Record<string, unknown>, { status: result.status });
    },
  );
});
