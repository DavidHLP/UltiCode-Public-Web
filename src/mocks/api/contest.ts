import type {
  ContestCrewMember,
  ContestCrewRow,
  ContestEvent,
  ContestEventRow,
  ContestFaqItem,
  ContestFaqRow,
  ContestInsight,
  ContestInsightRow,
  ContestLeaderboardEntry,
  ContestLeaderboardRow,
  ContestOpsCheckpoint,
  ContestOpsCheckpointRow,
  ContestOpsPhase,
  ContestOpsStatus,
  ContestResource,
  ContestResourceRow,
  ContestRow,
  ContestTrack,
  ContestTrackRow,
} from "@/mocks/schema/contest";
import contestData from "@/mocks/db/contest";

const contests = contestData.contests as ContestRow[];
const schedule = contestData.contest_events as ContestEventRow[];

const eventMeta: Record<
  string,
  Partial<
    Pick<
      ContestEvent,
      | "series"
      | "ratingBand"
      | "timezone"
      | "host"
      | "rewards"
      | "prizePool"
      | "coverImage"
      | "broadcast"
      | "editorialEta"
    >
  >
> = {
  "contest-global-sprint-47": {
    series: "Sprint League",
    ratingBand: "1700 - 2400",
    timezone: "UTC",
    host: "Contest Ops",
    rewards: ["$2k travel credits", "Coach review slot"],
    prizePool: "$2,000 + perks",
    coverImage:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
    editorialEta: "2024-08-31T21:30:00Z",
  },
  "contest-regional-apac-qualifiers": {
    series: "Regional Relay",
    ratingBand: "1500 - 2100",
    timezone: "UTC+8",
    host: "APAC Ops",
    rewards: ["Asia finals invite", "Team badge"],
    prizePool: "$1,000",
  },
  "contest-college-ladder-14": {
    series: "Campus Ladder",
    ratingBand: "800 - 1400",
    timezone: "UTC",
    host: "Campus Program",
    rewards: ["Mentor hour", "Profile badge"],
  },
  "contest-team-marathon-09": {
    series: "Marathon Lab",
    ratingBand: "2000+",
    timezone: "UTC",
    host: "RL Lab",
    rewards: ["Cloud credits", "Feature interview"],
    prizePool: "$5,000",
  },
  "contest-global-sprint-46": {
    series: "Sprint League",
    ratingBand: "1700 - 2400",
    timezone: "UTC",
    host: "Contest Ops",
    rewards: ["Archived trophy", "Editorial pack"],
    prizePool: "$1,500",
  },
  "contest-college-ladder-13": {
    series: "Campus Ladder",
    ratingBand: "800 - 1400",
    timezone: "UTC",
    host: "Campus Program",
    rewards: ["Mentor AMA", "Campus badge"],
  },
};

const difficultyBands: Record<string, string> = {
  Starter: "800 - 1400",
  Intermediate: "1400 - 1900",
  Advanced: "1700 - 2400",
  Championship: "2000+",
};

// Get the main contest and its featured event
const mainContest = contests[0];
if (!mainContest) {
  throw new Error("Contest dataset is empty");
}

const derivedFeaturedContest =
  schedule.find((event) => event.id === mainContest.featured_event_id) ?? schedule[0];

if (!derivedFeaturedContest) {
  throw new Error("Contest events dataset is empty");
}
const featuredContest = derivedFeaturedContest;

const minutesBetween = (start: string, end: string, fallback = 90) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf())) return fallback;
  return Math.max(30, Math.round((endDate.valueOf() - startDate.valueOf()) / (1000 * 60)));
};

const mapRows = <T extends { contest_id: string }, O>(
  rows: T[],
  mapper: (row: T) => O,
): O[] => rows.filter((row) => row.contest_id === featuredContest.id).map(mapper);

const mapEventRow = (row: ContestEventRow): ContestEvent => {
  const meta = eventMeta[row.id] ?? {};
  return {
    id: row.id,
    title: row.title,
    series: meta.series ?? "UltiCode Contest",
    description: row.description,
    startTime: row.start_time,
    durationMinutes: minutesBetween(row.start_time, row.end_time),
    timezone: meta.timezone ?? "UTC",
    status: row.status,
    difficulty: row.difficulty as ContestEvent["difficulty"],
    ratingBand: meta.ratingBand ?? difficultyBands[row.difficulty] ?? "All ratings",
    tags: Array.isArray(row.tags) ? row.tags : [],
    rewards: meta.rewards?.length ? meta.rewards : ["Digital badge"],
    registration: {
      open: row.status !== "archived",
      closesAt: meta.editorialEta ?? row.end_time,
      slots: row.slots ?? row.registered,
      registered: row.registered,
      mode: row.mode,
    },
    division: row.division as ContestEvent["division"],
    host: meta.host ?? "Ops Team",
    isRated: row.is_rated,
    prizePool: meta.prizePool,
    coverImage: meta.coverImage,
    broadcast: meta.broadcast,
    editorialEta: meta.editorialEta,
  };
};

const insightMeta: Record<
  string,
  {
    helper: string;
    unit?: string;
  }
> = {
  "insight-registrations": { helper: "vs last 7 days", unit: "%" },
  "insight-solve-rate": { helper: "median across last sprint", unit: "%" },
  "insight-editorial": { helper: "faster than last cycle", unit: "m" },
  "insight-newcomers": { helper: "new rated users this month" },
};

const mapInsightRow = ({ contest_id, ...row }: ContestInsightRow): ContestInsight => {
  void contest_id;
  const meta = insightMeta[row.id] ?? { helper: "vs last window" };
  const trend: ContestInsight["trend"] =
    row.status === "down" || (row.delta && row.delta < 0)
      ? "down"
      : row.status === "up" || (row.delta && row.delta > 0)
        ? "up"
        : "steady";
  const deltaText =
    typeof row.delta === "number"
      ? `${row.delta > 0 ? "+" : ""}${row.delta}${meta.unit ?? ""}`
      : row.delta ?? "0";

  return {
    id: row.id,
    label: row.label,
    value: row.value,
    trend,
    delta: deltaText,
    helper: meta.helper,
  };
};

const leaderboardMeta: Record<
  string,
  Partial<Pick<ContestLeaderboardEntry, "handle" | "rating" | "ratingDelta" | "country">>
> = {
  "leaderboard-01": { handle: "yuki.codes", rating: 2841, ratingDelta: 28, country: "JP" },
  "leaderboard-02": { handle: "bytewave", rating: 2720, ratingDelta: 12, country: "US" },
  "leaderboard-03": { handle: "algorhythm", rating: 2684, ratingDelta: -6, country: "DE" },
  "leaderboard-04": { handle: "falcon-squad", rating: 2210, ratingDelta: 18, country: "SG" },
  "leaderboard-05": { handle: "hkust-knit", rating: 2148, ratingDelta: 20, country: "HK" },
  "leaderboard-06": { handle: "deltafreshman", rating: 1538, ratingDelta: 9, country: "IN" },
  "leaderboard-07": { handle: "neonfox", rating: 2798, ratingDelta: 19, country: "CA" },
  "leaderboard-08": { handle: "bitra", rating: 2705, ratingDelta: 10, country: "ES" },
  "leaderboard-09": { handle: "solarium", rating: 2652, ratingDelta: -4, country: "PL" },
};

const mapLeaderboardRow = ({ contest_id, ...row }: ContestLeaderboardRow): ContestLeaderboardEntry => {
  void contest_id;
  const meta = leaderboardMeta[row.id] ?? {};
  return {
    id: row.id,
    divisionTag: row.division_tag,
    rank: row.rank,
    handle: meta.handle ?? row.team_name,
    rating: meta.rating ?? row.score,
    ratingDelta: meta.ratingDelta ?? 0,
    solved: row.solved,
    penalty: row.penalty,
    country: meta.country ?? "Global",
  };
};

const trackMeta: Record<string, Omit<ContestTrack, "id" | "summary">> = {
  "track-accelerator": {
    name: "Accelerator Track",
    badge: "High focus",
    difficulty: "Intermediate",
    cadence: "Daily drills",
    targetRating: "1400 → 1800",
    focus: ["Speed", "Templates", "Greedy"],
    included: ["Scrimmages", "Mentor review", "Code clinic"],
  },
  "track-foundations": {
    name: "Foundations Track",
    badge: "Onboarding",
    difficulty: "Starter",
    cadence: "3x week",
    targetRating: "800 → 1200",
    focus: ["Basics", "Simulation", "Two pointers"],
    included: ["Walkthroughs", "Playlists", "Office hours"],
  },
  "track-marathon-lab": {
    name: "Marathon Lab",
    badge: "Async",
    difficulty: "Advanced",
    cadence: "Weekly",
    targetRating: "1900 → 2300",
    focus: ["DP", "Graphs", "RL datasets"],
    included: ["Sandbox credits", "Review minutes", "Checkpoints"],
  },
};

const mapTrackRow = ({ contest_id, ...row }: ContestTrackRow): ContestTrack => {
  void contest_id;
  const meta = trackMeta[row.id] ?? {
    name: row.title,
    badge: "Prep",
    difficulty: "Intermediate",
    cadence: "Weekly",
    targetRating: "All levels",
    focus: ["Core skills"],
    included: ["Docs"],
  };

  return {
    id: row.id,
    name: meta.name,
    summary: row.summary,
    difficulty: meta.difficulty,
    badge: meta.badge,
    cadence: meta.cadence,
    targetRating: meta.targetRating,
    focus: meta.focus,
    included: meta.included,
  };
};

const resourceMeta: Record<string, Pick<ContestResource, "description" | "category">> = {
  "resource-playbook": { description: "Ops-ready prep checklist", category: "playbook" },
  "resource-editorial": { description: "Track editorial delivery", category: "announcement" },
  "resource-stream": { description: "Live strategy stream link", category: "video" },
  "resource-guide": { description: "Rating recovery guide", category: "guide" },
};

const mapResourceRow = ({ contest_id, ...row }: ContestResourceRow): ContestResource => {
  void contest_id;
  const meta = resourceMeta[row.id] ?? {
    description: row.title,
    category: row.kind as ContestResource["category"],
  };
  return {
    id: row.id,
    title: row.title,
    description: meta.description,
    url: row.url,
    category: meta.category,
  };
};

const faqMeta: Record<string, string[]> = {
  "faq-eligibility": ["rating", "policy"],
  "faq-team": ["team", "region"],
  "faq-editorial": ["editorial", "broadcast"],
};

const mapFaqRow = ({ contest_id, ...row }: ContestFaqRow): ContestFaqItem => {
  void contest_id;
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    tags: faqMeta[row.id] ?? [],
  };
};

const opsOwners: Record<string, string> = {
  "ops-problem-freeze": "Problem lead",
  "ops-broadcast-tech": "Broadcast",
  "ops-scoreboard-lock": "Control room",
  "ops-editorial-hand-off": "Editorial",
  "ops-prize-email": "Community",
};

const mapOpsRow = ({ contest_id, ...row }: ContestOpsCheckpointRow): ContestOpsCheckpoint => {
  void contest_id;
  const [title, ...rest] = row.description.split(" - ");
  return {
    id: row.id,
    title: title || row.description,
    category: row.phase as ContestOpsPhase,
    status: row.status as ContestOpsStatus,
    notes: rest.join(" - ") || row.description,
    dueAt: row.timestamp,
    owner: opsOwners[row.id] ?? "Ops",
    effort: "M",
  };
};

const crewMeta: Record<string, Pick<ContestCrewMember, "timezone" | "focus" | "channel">> = {
  "crew-director": { timezone: "UTC", focus: "End-to-end", channel: "@mira-c" },
  "crew-broadcast": { timezone: "UTC+5:30", focus: "Streaming & captions", channel: "@dev.stream" },
  "crew-judge": { timezone: "UTC-5", focus: "Appeals & QA", channel: "@ivy-o" },
  "crew-community": { timezone: "UTC+1", focus: "Community & prizes", channel: "@rahul" },
};

const mapCrewRow = (row: ContestCrewRow): ContestCrewMember => {
  const meta = crewMeta[row.id] ?? {
    timezone: "UTC",
    focus: "Contest ops",
    channel: row.contact,
  };
  return {
    ...row,
    timezone: meta.timezone,
    focus: meta.focus,
    channel: meta.channel,
  };
};

export function fetchContestFeaturedEvent(): ContestEvent {
  return mapEventRow(featuredContest);
}

export function fetchContestInsights(): ContestInsight[] {
  return mapRows(contestData.contest_insights as ContestInsightRow[], mapInsightRow);
}

export function fetchContestSchedule(): ContestEvent[] {
  return schedule.map(mapEventRow);
}

export function fetchContestLeaderboard(): ContestLeaderboardEntry[] {
  return mapRows(contestData.contest_leaderboard as ContestLeaderboardRow[], mapLeaderboardRow);
}

export function fetchContestTracks(): ContestTrack[] {
  return mapRows(contestData.contest_tracks as ContestTrackRow[], mapTrackRow);
}

export function fetchContestResources(): ContestResource[] {
  return mapRows(contestData.contest_resources as ContestResourceRow[], mapResourceRow);
}

export function fetchContestFaq(): ContestFaqItem[] {
  return mapRows(contestData.contest_faq as ContestFaqRow[], mapFaqRow);
}

export function fetchContestOpsCheckpoints(): ContestOpsCheckpoint[] {
  return mapRows(contestData.contest_ops_checkpoints as ContestOpsCheckpointRow[], mapOpsRow);
}

export function fetchContestCrew(): ContestCrewMember[] {
  return mapRows(contestData.contest_crew as ContestCrewRow[], mapCrewRow);
}
