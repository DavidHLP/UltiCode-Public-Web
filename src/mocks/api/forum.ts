import type {
  ForumAward,
  ForumAwardRow,
  ForumCommunity,
  ForumCommunityLink,
  ForumCommunityRow,
  ForumCommunityRule,
  ForumFlairType,
  ForumModerator,
  ForumPost,
  ForumPostCommentPreview,
  ForumPostMedia,
  ForumPostRow,
  ForumPostStatsRow,
  ForumTrendingTopic,
  ForumUser,
  ForumUserRow,
  ForumCommentRow,
  ForumComment,
  ForumThread,
} from "@/mocks/schema/forum";
import forumDataRaw from "@/mocks/db/forum";

const forumData = forumDataRaw as any as {
  forum_communities: ForumCommunityRow[];
  forum_community_rules: {
    id: string;
    community_id: string;
    title: string;
    body: string;
  }[];
  forum_community_links: {
    id: string;
    community_id: string;
    label: string;
    url: string;
  }[];
  forum_users: ForumUserRow[];
  forum_moderators: {
    id: string;
    community_id: string;
    username: string;
    title: string;
  }[];
  forum_posts: any[];
  forum_post_stats: ForumPostStatsRow[];
  forum_awards: ForumAwardRow[];
  forum_post_awards: { post_id: string; award_id: string; count: number }[];
  forum_comments: any[];
  forum_quick_filters: { id: string; label: string; value: string }[];
  forum_trending_topics: {
    id: string;
    title: string;
    posts: number;
    trend: "up" | "down";
  }[];
};

const groupBy = <T, K extends keyof T>(items: T[], key: K): Map<T[K], T[]> =>
  items.reduce((acc, item) => {
    const groupKey = item[key];
    if (!acc.has(groupKey)) acc.set(groupKey, []);
    acc.get(groupKey)!.push(item);
    return acc;
  }, new Map<T[K], T[]>());

// Convert snake_case to camelCase for rules and links
const communityRules: ForumCommunityRule[] =
  forumData.forum_community_rules.map((rule) => ({
    id: rule.id,
    communityId: rule.community_id,
    title: rule.title,
    summary: rule.body,
  }));

const communityLinks: ForumCommunityLink[] =
  forumData.forum_community_links.map((link) => ({
    id: link.id,
    communityId: link.community_id,
    label: link.label,
    url: link.url,
  }));

const rulesByCommunity = groupBy(communityRules, "communityId");
const linksByCommunity = groupBy(communityLinks, "communityId");

const communities: ForumCommunity[] = forumData.forum_communities.map(
  (community) => ({
    ...community,
    rules: rulesByCommunity.get(community.id) ?? [],
    links: linksByCommunity.get(community.id) ?? [],
  })
);

const communityMap = new Map(
  communities.map((community) => [community.id, community])
);

const usersById = new Map<ForumUser["username"], ForumUser>(
  forumData.forum_users.map((user) => [user.username, user])
);

const awardsById = new Map<ForumAward["id"], ForumAward>(
  forumData.forum_awards.map((award) => [award.id, award])
);

const extraThreadComments: ForumCommentRow[] = [];

const postAwardsByPost = groupBy(forumData.forum_post_awards, "post_id");

const posts: ForumPost[] = forumData.forum_posts.map((post) => {
  const community = communityMap.get(post.community_id);
  const user = usersById.get(post.user_id);
  const stats = forumData.forum_post_stats.find((s) => s.post_id === post.id);
  if (!community || !user || !stats) {
    throw new Error(`Forum dataset is missing references for post ${post.id}`);
  }

  const awards =
    postAwardsByPost.get(post.id)?.map((relation) => ({
      ...awardsById.get(relation.award_id)!,
      count: relation.count,
    })) ?? [];

  // Get first few comments for preview
  const commentPreview: ForumPostCommentPreview[] = forumData.forum_comments
    .filter((c) => c.post_id === post.id && c.parent_id === null)
    .slice(0, 2)
    .map((comment) => ({
      id: comment.id,
      author: usersById.get(comment.author_id)?.username ?? comment.author_id,
      avatar: undefined,
      body: comment.body,
      upvotes: comment.upvotes,
      createdAt: comment.created_at,
    }));

  const media = post.media ? (post.media as ForumPostMedia) : undefined;

  return {
    id: post.id,
    permalink: post.permalink || "",
    title: post.title,
    community,
    flair:
      post.flair_label && post.flair_type
        ? { label: post.flair_label, type: post.flair_type as ForumFlairType }
        : undefined,
    tags: post.tags,
    excerpt: post.excerpt || undefined,
    media,
    recommendation: post.recommendation || undefined,
    user,
    stats: stats!,
    createdAt: post.created_at,
    awards,
    commentPreview,
    voteState: post.vote_state || undefined,
    isSaved: Boolean(post.is_saved),
    impressions: post.impressions,
    isPinned: Boolean(post.is_pinned),
    isLocked: Boolean(post.is_locked),
  };
});

export function fetchForumPosts(): ForumPost[] {
  return posts;
}

export function fetchForumTrendingTopics(): ForumTrendingTopic[] {
  return forumData.forum_trending_topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    communityId: "", // Not in the new schema
    delta: topic.posts,
    trend: topic.trend as "up" | "down",
  }));
}

export function fetchForumCommunities(): ForumCommunity[] {
  return communities;
}

export function fetchForumModerators(): ForumModerator[] {
  return forumData.forum_moderators.map((mod) => ({
    username: mod.username,
    avatar: usersById.get(mod.username)?.avatar || null,
    karma: usersById.get(mod.username)?.karma || 0,
    timezone: "",
    availability: "",
    focus: [],
  }));
}

export function fetchForumQuickFilters() {
  return forumData.forum_quick_filters;
}

function buildCommentTree(
  rows: ForumCommentRow[],
  postId: string
): ForumComment[] {
  const byId = new Map<string, ForumComment>();
  const roots: ForumComment[] = [];

  // Prepare nodes
  for (const row of rows) {
    if (row.post_id !== postId) continue;
    const author = usersById.get(row.author_id);
    if (!author) continue;
    byId.set(row.id, {
      id: row.id,
      parentId: row.parent_id ?? null,
      author,
      body: row.body,
      markdown: row.markdown || undefined,
      upvotes: row.upvotes,
      createdAt: row.created_at,
      editedAt: row.edited_at || undefined,
      isPinned: Boolean(row.is_pinned),
      isLocked: Boolean(row.is_locked),
      replies: [],
    });
  }

  // Link children
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.replies!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function fetchForumPostById(id: string): ForumPost | undefined {
  return posts.find((p) => p.id === id);
}

export function fetchForumThread(postId: string): ForumThread {
  const post = fetchForumPostById(postId);
  if (!post) {
    throw new Error(`Post not found: ${postId}`);
  }
  const rows = [...forumData.forum_comments, ...extraThreadComments];
  const comments = buildCommentTree(rows, postId);
  const commentsCount = rows.filter((r) => r.post_id === postId).length;
  const postWithUpdatedStats: ForumPost = {
    ...post,
    stats: {
      ...post.stats,
      comments: commentsCount,
    },
  };
  return { post: postWithUpdatedStats, comments };
}

export function createForumComment(
  postId: string,
  body: string,
  parentId: string | null = null,
  authorId?: string
): ForumComment {
  const trimmed = body.trim();
  if (!trimmed) {
    throw new Error("Comment body cannot be empty");
  }
  const fallbackAuthor = forumData.forum_users[0]?.username ?? "anonymous";
  const chosenAuthor = authorId ?? fallbackAuthor;
  const id = `tc-${postId}-${Date.now()}`;
  const createdAt = new Date().toISOString();

  const row: ForumCommentRow = {
    id,
    post_id: postId,
    parent_id: parentId ?? null,
    author_id: chosenAuthor,
    body: trimmed,
    markdown: null,
    upvotes: 0,
    created_at: createdAt,
    edited_at: null,
    is_pinned: false,
    is_locked: false,
  };

  extraThreadComments.push(row);

  const author = usersById.get(chosenAuthor);
  return {
    id: row.id,
    parentId: row.parent_id ?? null,
    author: author ?? {
      username: chosenAuthor,
      avatar: null,
      karma: 0,
    },
    body: row.body,
    markdown: row.markdown || undefined,
    upvotes: row.upvotes,
    createdAt: row.created_at,
    editedAt: undefined,
    isPinned: undefined,
    isLocked: undefined,
    replies: [],
  };
}
