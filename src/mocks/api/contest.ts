import type {
  ContestRow,
  ContestProblemRow,
  ContestRankingRow,
  GlobalRankingRow,
  ContestListItem,
  ContestDetail,
  ContestProblemInfo,
  ContestRankingEntry,
  GlobalRankingEntry,
  ContestStats,
} from "@/mocks/schema/contest";
import contestData from "@/mocks/db/contest";

const contests = contestData.contests as ContestRow[];
const contestProblems = contestData.contest_problems as ContestProblemRow[];
const contestRankings = contestData.contest_rankings as ContestRankingRow[];
const globalRankings = contestData.global_rankings as GlobalRankingRow[];

/**
 * 格式化时间(秒)为 HH:MM:SS 格式
 */
function formatTime(seconds: number | null | undefined): string {
  if (seconds == null) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * 将数据库竞赛记录转换为 API 响应
 */
function mapContestToListItem(row: ContestRow): ContestListItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    type: row.contest_type,
    startTime: row.start_time,
    durationMinutes: row.duration_minutes,
    status: row.status,
    registeredCount: row.registered_count,
    participantCount: row.participant_count,
    isRated: row.is_rated,
    coverImage: row.cover_image ?? undefined,
  };
}

/**
 * 将竞赛题目记录转换为 API 响应
 */
function mapContestProblem(row: ContestProblemRow): ContestProblemInfo {
  const acceptanceRate =
    row.submission_count > 0
      ? ((row.solved_count / row.submission_count) * 100).toFixed(1) + "%"
      : "0.0%";

  // 根据 problem_id 查找题目信息 (这里模拟, 实际应从 problems 表中查询)
  const problemTitles: Record<number, { title: string; difficulty: string }> = {
    3001: { title: "找出数组中的重复元素", difficulty: "Easy" },
    3002: { title: "最长递增子序列", difficulty: "Medium" },
    3003: { title: "二叉树的最大路径和", difficulty: "Hard" },
    3004: { title: "极大极小值的最小差", difficulty: "Hard" },
  };

  const problemInfo = problemTitles[row.problem_id] ?? {
    title: `题目 ${row.problem_id}`,
    difficulty: "Medium",
  };

  return {
    id: row.id,
    problemId: row.problem_id,
    problemIndex: row.problem_index,
    title: problemInfo.title,
    difficulty: problemInfo.difficulty,
    score: row.score,
    solvedCount: row.solved_count,
    submissionCount: row.submission_count,
    acceptanceRate,
  };
}

/**
 * 将排名记录转换为 API 响应
 */
function mapContestRanking(row: ContestRankingRow): ContestRankingEntry {
  return {
    id: row.id,
    rank: row.rank,
    username: row.username,
    score: row.score,
    finishTime: formatTime(row.finish_time_seconds),
    problemResults: [
      {
        index: "Q1",
        solved: row.q1_time_seconds != null,
        time: formatTime(row.q1_time_seconds),
      },
      {
        index: "Q2",
        solved: row.q2_time_seconds != null,
        time: formatTime(row.q2_time_seconds),
      },
      {
        index: "Q3",
        solved: row.q3_time_seconds != null,
        time: formatTime(row.q3_time_seconds),
      },
      {
        index: "Q4",
        solved: row.q4_time_seconds != null,
        time: formatTime(row.q4_time_seconds),
      },
    ],
    ratingBefore: row.rating_before,
    ratingAfter: row.rating_after,
    ratingChange: row.rating_change,
    country: row.country,
  };
}

/**
 * 将全球排名记录转换为 API 响应
 */
function mapGlobalRanking(row: GlobalRankingRow): GlobalRankingEntry {
  return {
    id: row.id,
    globalRank: row.global_rank,
    username: row.username,
    rating: row.rating,
    maxRating: row.max_rating,
    contestsAttended: row.contests_attended,
    avatar: row.avatar ?? undefined,
    country: row.country,
    badge: row.badge ?? undefined,
  };
}

// ============================================
// API 函数
// ============================================

/**
 * 获取所有竞赛列表
 */
export function fetchContestList(): ContestListItem[] {
  return contests.map(mapContestToListItem);
}

/**
 * 获取即将开始的竞赛
 */
export function fetchUpcomingContests(): ContestListItem[] {
  return contests
    .filter((c) => c.status === "upcoming")
    .map(mapContestToListItem)
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
}

/**
 * 获取正在进行的竞赛
 */
export function fetchRunningContests(): ContestListItem[] {
  return contests
    .filter((c) => c.status === "running")
    .map(mapContestToListItem);
}

/**
 * 获取已结束的竞赛(往届竞赛)
 */
export function fetchPastContests(): ContestListItem[] {
  return contests
    .filter((c) => c.status === "finished")
    .map(mapContestToListItem)
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
}

/**
 * 根据 ID 获取竞赛详情
 */
export function fetchContestDetail(contestId: string): ContestDetail | null {
  const contest = contests.find((c) => c.id === contestId);
  if (!contest) return null;

  const problems = contestProblems
    .filter((p) => p.contest_id === contestId)
    .map(mapContestProblem)
    .sort((a, b) => a.problemIndex.localeCompare(b.problemIndex));

  const now = new Date();
  const startTime = new Date(contest.start_time);
  const endTime = new Date(
    startTime.getTime() + contest.duration_minutes * 60 * 1000
  );

  return {
    ...mapContestToListItem(contest),
    description: contest.description ?? undefined,
    problems,
    canRegister: contest.status === "upcoming" && now < startTime,
    canStart:
      contest.status === "running" ||
      (contest.status === "finished" && now > endTime),
    userStatus: {
      isRegistered: false,
      isParticipated: false,
    },
  };
}

/**
 * 获取竞赛排行榜
 */
export function fetchContestRanking(contestId: string): ContestRankingEntry[] {
  return contestRankings
    .filter((r) => r.contest_id === contestId)
    .map(mapContestRanking)
    .sort((a, b) => a.rank - b.rank);
}

/**
 * 获取全球排名榜
 */
export function fetchGlobalRankings(): GlobalRankingEntry[] {
  return globalRankings
    .map(mapGlobalRanking)
    .sort((a, b) => a.globalRank - b.globalRank);
}

/**
 * 获取竞赛统计信息
 */
export function fetchContestStats(): ContestStats {
  const totalParticipants = contests.reduce(
    (sum, c) => sum + c.participant_count,
    0
  );
  const totalRating = globalRankings.reduce((sum, r) => sum + r.rating, 0);

  return {
    totalContests: contests.length,
    upcomingContests: contests.filter((c) => c.status === "upcoming").length,
    runningContests: contests.filter((c) => c.status === "running").length,
    totalParticipants,
    averageRating: Math.round(totalRating / globalRankings.length),
  };
}
