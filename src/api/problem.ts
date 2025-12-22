import type { Problem } from "@/types/problem";
import { apiGet } from "@/utils/request";

function mapProblem(problem: unknown): Problem {
  if (!problem || typeof problem !== "object") return problem as Problem;
  const p = problem as Record<string, unknown>;
  const rawAcceptance = p.acceptanceRate ?? p.acceptance_rate;
  const parsedAcceptance =
    rawAcceptance === undefined || rawAcceptance === null
      ? undefined
      : Number(rawAcceptance);
  const acceptanceRate =
    parsedAcceptance === undefined || Number.isNaN(parsedAcceptance)
      ? undefined
      : parsedAcceptance;
  const completedRaw = p.completedTime ?? p.completed_time;
  const completedTime =
    completedRaw === null || completedRaw === undefined
      ? undefined
      : completedRaw instanceof Date
        ? completedRaw.toISOString()
        : String(completedRaw);
  return {
    ...p,
    acceptance_rate:
      acceptanceRate ??
      (typeof p.acceptance_rate === "number" ? p.acceptance_rate : undefined),
    acceptanceRate,
    isPremium: (p.isPremium ?? p.is_premium) as boolean | undefined,
    hasSolution: (p.hasSolution ?? p.has_solution) as boolean | undefined,
    completedTime,
  } as Problem;
}

export async function fetchProblems(userId?: string): Promise<Problem[]> {
  const query = userId ? `?userId=${userId}` : "";
  const data = await apiGet<unknown[]>(`/problems${query}`);
  return data.map(mapProblem);
}

export async function fetchProblemById(
  id: string | number,
  userId?: string,
): Promise<Problem> {
  const query = userId ? `?userId=${userId}` : "";
  const data = await apiGet<unknown>(`/problems/${id}${query}`);
  return mapProblem(data);
}

export async function fetchRandomProblem(): Promise<Problem> {
  const data = await apiGet<unknown>("/problems/random");
  return mapProblem(data);
}

export async function fetchAdjacentProblems(
  id: number,
): Promise<{ prev: string | null; next: string | null }> {
  return apiGet<{ prev: string | null; next: string | null }>(
    `/problems/${id}/adjacent`,
  );
}

export { mapProblem };
