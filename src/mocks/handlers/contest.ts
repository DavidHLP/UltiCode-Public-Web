import { http, HttpResponse } from "msw";
import {
  fetchContestList,
  fetchUpcomingContests,
  fetchRunningContests,
  fetchPastContests,
  fetchContestDetail,
  fetchContestRanking,
  fetchGlobalRankings,
  fetchContestStats,
} from "@/mocks/api/contest";

export const contestHandlers = [
  // 获取所有竞赛列表
  http.get("/api/contest/list", () => HttpResponse.json(fetchContestList())),

  // 获取即将开始的竞赛
  http.get("/api/contest/upcoming", () =>
    HttpResponse.json(fetchUpcomingContests()),
  ),

  // 获取正在进行的竞赛
  http.get("/api/contest/running", () =>
    HttpResponse.json(fetchRunningContests()),
  ),

  // 获取已结束的竞赛(往届竞赛)
  http.get("/api/contest/past", () => HttpResponse.json(fetchPastContests())),

  // 获取全球排名榜 - 必须在 :contestId 之前
  http.get("/api/contest/global-ranking", () =>
    HttpResponse.json(fetchGlobalRankings()),
  ),

  // 获取竞赛统计信息 - 必须在 :contestId 之前
  http.get("/api/contest/stats", () => HttpResponse.json(fetchContestStats())),

  // 获取竞赛排行榜 - 必须在 :contestId 之前
  http.get("/api/contest/:contestId/ranking", ({ params }) => {
    const { contestId } = params;
    return HttpResponse.json(fetchContestRanking(contestId as string));
  }),

  // 根据 ID 获取竞赛详情 - 放在最后，因为是最通用的模式
  http.get("/api/contest/:contestId", ({ params }) => {
    const { contestId } = params;
    const detail = fetchContestDetail(contestId as string);
    if (!detail) {
      return HttpResponse.json({ error: "Contest not found" }, { status: 404 });
    }
    return HttpResponse.json(detail);
  }),
];
