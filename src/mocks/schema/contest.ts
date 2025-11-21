export type ContestId = string;
export type ContestEventId = string;
export type ContestParticipantId = string;
export type ContestProblemId = string;
export type ContestRankingId = string;

export type ContestType = "weekly" | "biweekly" | "special";
export type ContestStatus = "upcoming" | "running" | "finished";
export type ParticipationStatus = "registered" | "participated" | "virtual";

// ============================================
// 数据库表结构 (Database Schema)
// ============================================

/**
 * 竞赛表 - contests
 * 存储竞赛的基本信息
 */
export interface ContestRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  title: string; // VARCHAR(120) NOT NULL - 例如: "第 470 场周赛"
  slug: string; // VARCHAR(120) NOT NULL - 例如: "weekly-contest-470"
  contest_type: ContestType; // ENUM ('weekly','biweekly','special') NOT NULL
  start_time: string; // DATETIME NOT NULL - ISO 8601 格式
  duration_minutes: number; // INT NOT NULL - 竞赛时长(分钟)
  status: ContestStatus; // ENUM ('upcoming','running','finished') NOT NULL
  registered_count: number; // INT NOT NULL DEFAULT 0 - 报名人数
  participant_count: number; // INT NOT NULL DEFAULT 0 - 实际参赛人数
  is_rated: boolean; // TINYINT(1) NOT NULL DEFAULT 1 - 是否计入积分
  description?: string | null; // TEXT - 竞赛描述
  cover_image?: string | null; // VARCHAR(255) - 封面图片
}

/**
 * 竞赛题目关联表 - contest_problems
 * 多对多关系: 一场竞赛包含多个题目
 */
export interface ContestProblemRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  contest_id: string; // VARCHAR(40) NOT NULL (FK to contests.id)
  problem_id: number; // BIGINT NOT NULL (FK to problems.id)
  problem_index: string; // VARCHAR(10) NOT NULL - 题目编号 (Q1, Q2, Q3, Q4)
  score: number; // INT NOT NULL DEFAULT 100 - 题目分值
  solved_count: number; // INT NOT NULL DEFAULT 0 - 通过人数
  submission_count: number; // INT NOT NULL DEFAULT 0 - 提交次数
}

/**
 * 参赛记录表 - contest_participants
 * 记录用户参赛信息
 */
export interface ContestParticipantRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  contest_id: string; // VARCHAR(40) NOT NULL (FK to contests.id)
  user_id: string; // VARCHAR(40) NOT NULL (FK to users.id)
  username: string; // VARCHAR(120) NOT NULL
  status: ParticipationStatus; // ENUM ('registered','participated','virtual')
  registered_at: string; // DATETIME NOT NULL
  started_at?: string | null; // DATETIME - 开始时间(虚拟竞赛可能延后)
  finished_at?: string | null; // DATETIME - 完成时间
  rank?: number | null; // INT - 排名
  score: number; // INT NOT NULL DEFAULT 0 - 总分
  finish_time_seconds?: number | null; // INT - 完赛用时(秒)
  is_virtual: boolean; // TINYINT(1) NOT NULL DEFAULT 0 - 是否虚拟竞赛
}

/**
 * 竞赛排行榜 - contest_rankings  
 * 存储用户在竞赛中的排名和成绩
 */
export interface ContestRankingRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  contest_id: string; // VARCHAR(40) NOT NULL (FK to contests.id)
  user_id: string; // VARCHAR(40) NOT NULL (FK to users.id)
  username: string; // VARCHAR(120) NOT NULL
  rank: number; // INT NOT NULL - 场内排名
  score: number; // INT NOT NULL - 总分
  finish_time_seconds: number; // INT NOT NULL - 完赛用时(秒)
  q1_time_seconds?: number | null; // INT - Q1 用时
  q2_time_seconds?: number | null; // INT - Q2 用时
  q3_time_seconds?: number | null; // INT - Q3 用时  
  q4_time_seconds?: number | null; // INT - Q4 用时
  rating_before: number; // INT NOT NULL - 竞赛前积分
  rating_after: number; // INT NOT NULL - 竞赛后积分
  rating_change: number; // INT NOT NULL - 积分变化
  country: string; // VARCHAR(10) NOT NULL DEFAULT 'CN'
}

/**
 * 全球用户排名表 - global_rankings
 * 存储用户的全球竞赛排名信息
 */
export interface GlobalRankingRow {
  id: string; // VARCHAR(40) PRIMARY KEY
  user_id: string; // VARCHAR(40) NOT NULL UNIQUE (FK to users.id)
  username: string; // VARCHAR(120) NOT NULL
  global_rank: number; // INT NOT NULL - 全球排名
  rating: number; // INT NOT NULL DEFAULT 1500 - 当前积分
  max_rating: number; // INT NOT NULL DEFAULT 1500 - 历史最高积分
  contests_attended: number; // INT NOT NULL DEFAULT 0 - 参赛场次
  avatar?: string | null; // VARCHAR(255) - 头像
  country: string; // VARCHAR(10) NOT NULL DEFAULT 'CN'
  badge?: string | null; // VARCHAR(50) - 徽章
}

// ============================================
// API 响应类型 (API Response Types)
// ============================================

/**
 * 竞赛列表项
 */
export interface ContestListItem {
  id: ContestId;
  title: string;
  slug: string;
  type: ContestType;
  startTime: string;
  durationMinutes: number;
  status: ContestStatus;
  registeredCount: number;
  participantCount: number;
  isRated: boolean;
  coverImage?: string;
}

/**
 * 竞赛详情
 */
export interface ContestDetail extends ContestListItem {
  description?: string;
  problems: ContestProblemInfo[];
  canRegister: boolean;
  canStart: boolean;
  userStatus?: {
    isRegistered: boolean;
    isParticipated: boolean;
    rank?: number;
    score?: number;
  };
}

/**
 * 竞赛题目信息
 */
export interface ContestProblemInfo {
  id: ContestProblemId;
  problemId: number;
  problemIndex: string;
  title: string;
  difficulty: string;
  score: number;
  solvedCount: number;
  submissionCount: number;
  acceptanceRate: string;
}

/**
 * 竞赛排行榜条目
 */
export interface ContestRankingEntry {
  id: ContestRankingId;
  rank: number;
  username: string;
  score: number;
  finishTime: string; // 格式化后的用时, 例如: "1:23:45"
  problemResults: {
    index: string;
    solved: boolean;
    time?: string;
    attempts?: number;
  }[];
  ratingBefore: number;
  ratingAfter: number;
  ratingChange: number;
  country: string;
}

/**
 * 全球排名条目
 */
export interface GlobalRankingEntry {
  id: string;
  globalRank: number;
  username: string;
  rating: number;
  maxRating: number;
  contestsAttended: number;
  avatar?: string;
  country: string;
  badge?: string;
}

/**
 * 竞赛统计信息
 */
export interface ContestStats {
  totalContests: number;
  upcomingContests: number;
  runningContests: number;
  totalParticipants: number;
  averageRating: number;
}
