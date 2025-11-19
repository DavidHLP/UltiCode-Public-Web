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
  ForumPostCommentPreviewRow,
  ForumPostMedia,
  ForumPostRow,
  ForumPostStatsRow,
  ForumTrendingTopic,
  ForumUser,
  ForumUserRow,
  ForumCommentRow,
  ForumComment,
  ForumThread,
} from '@/mocks/schema/forum'
import forumDataRaw from '@/mocks/db/forum.json'

const forumData = forumDataRaw as {
  communities: ForumCommunityRow[]
  communityRules: ForumCommunityRule[]
  communityLinks: ForumCommunityLink[]
  users: ForumUserRow[]
  moderators: ForumModerator[]
  posts: ForumPostRow[]
  postStats: ForumPostStatsRow[]
  awards: ForumAwardRow[]
  postAwards: { postId: string; awardId: string; count: number }[]
  comments: ForumPostCommentPreviewRow[]
  postComments: { postId: string; commentId: string }[]
  quickFilters: { label: string; value: string }[]
  trendingTopics: ForumTrendingTopic[]
  threadComments: ForumCommentRow[]
}

const groupBy = <T, K extends keyof T>(items: T[], key: K): Map<T[K], T[]> =>
  items.reduce((acc, item) => {
    const groupKey = item[key]
    if (!acc.has(groupKey)) acc.set(groupKey, [])
    acc.get(groupKey)!.push(item)
    return acc
  }, new Map<T[K], T[]>())

const rulesByCommunity = groupBy(forumData.communityRules, 'communityId')
const linksByCommunity = groupBy(forumData.communityLinks, 'communityId')

const communities: ForumCommunity[] = forumData.communities.map((community) => ({
  ...community,
  rules: rulesByCommunity.get(community.id) ?? [],
  links: linksByCommunity.get(community.id) ?? [],
}))

const communityMap = new Map(communities.map((community) => [community.id, community]))

const usersById = new Map<ForumUser['username'], ForumUser>(
  forumData.users.map((user) => [user.username, user]),
)

const postStatsById = new Map(forumData.postStats.map((stats) => [stats.id, stats]))
const awardsById = new Map<ForumAward['id'], ForumAward>(
  forumData.awards.map((award) => [award.id, award]),
)

const commentsById = new Map(
  forumData.comments.map((comment) => [
    comment.id,
    {
      ...comment,
      author: usersById.get(comment.authorId)?.username ?? comment.authorId,
    },
  ]),
)

const extraThreadComments: ForumCommentRow[] = []

const postAwardsByPost = groupBy(forumData.postAwards, 'postId')
const postCommentsByPost = groupBy(forumData.postComments, 'postId')

const posts: ForumPost[] = forumData.posts.map((post) => {
  const community = communityMap.get(post.communityId)
  const user = usersById.get(post.userId)
  const stats = postStatsById.get(post.statsId)
  if (!community || !user || !stats) {
    throw new Error(`Forum dataset is missing references for post ${post.id}`)
  }

  const awards =
    postAwardsByPost.get(post.id)?.map((relation) => ({
      ...awardsById.get(relation.awardId)!,
      count: relation.count,
    })) ?? []

  const commentPreview: ForumPostCommentPreview[] =
    postCommentsByPost
      .get(post.id)
      ?.map((link) => commentsById.get(link.commentId))
      .filter((comment): comment is NonNullable<typeof comment> => Boolean(comment))
      .map((comment) => ({
        id: comment.id,
        author: comment.author,
        avatar: comment.avatar || undefined,
        body: comment.body,
        upvotes: comment.upvotes,
        createdAt: comment.createdAt,
      })) ?? []

  const media = post.media ? (post.media as ForumPostMedia) : undefined

  return {
    id: post.id,
    permalink: post.permalink || '',
    title: post.title,
    community,
    flair:
      post.flairLabel && post.flairType
        ? { label: post.flairLabel, type: post.flairType as ForumFlairType }
        : undefined,
    tags: post.tags,
    excerpt: post.excerpt || undefined,
    media,
    recommendation: post.recommendation || undefined,
    user,
    stats,
    createdAt: post.createdAt,
    awards,
    commentPreview,
    voteState: post.voteState || undefined,
    isSaved: post.isSaved,
    impressions: post.impressions,
    isPinned: post.isPinned,
    isLocked: post.isLocked,
  }
})

export function fetchForumPosts(): ForumPost[] {
  return posts
}

export function fetchForumTrendingTopics(): ForumTrendingTopic[] {
  return forumData.trendingTopics.map((topic) => ({
    ...topic,
    trend: topic.trend as 'up' | 'down',
  }))
}

export function fetchForumCommunities(): ForumCommunity[] {
  return communities
}

export function fetchForumModerators(): ForumModerator[] {
  return forumData.moderators
}

export function fetchForumQuickFilters() {
  return forumData.quickFilters
}

function buildCommentTree(rows: ForumCommentRow[], postId: string): ForumComment[] {
  const byId = new Map<string, ForumComment>()
  const roots: ForumComment[] = []

  // Prepare nodes
  for (const row of rows) {
    if (row.postId !== postId) continue
    const author = usersById.get(row.authorId)
    if (!author) continue
    byId.set(row.id, {
      id: row.id,
      parentId: row.parentId ?? null,
      author,
      avatar: row.avatar || undefined,
      body: row.body,
      markdown: row.markdown || undefined,
      upvotes: row.upvotes,
      createdAt: row.createdAt,
      editedAt: row.editedAt || undefined,
      isPinned: row.isPinned || undefined,
      isLocked: row.isLocked || undefined,
      replies: [],
    })
  }

  // Link children
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.replies!.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

export function fetchForumPostById(id: string): ForumPost | undefined {
  return posts.find((p) => p.id === id)
}

export function fetchForumThread(postId: string): ForumThread {
  const post = fetchForumPostById(postId)
  if (!post) {
    throw new Error(`Post not found: ${postId}`)
  }
  const rows = [...(forumData.threadComments ?? []), ...extraThreadComments]
  const comments = buildCommentTree(rows, postId)
  const commentsCount = rows.filter((r) => r.postId === postId).length
  const postWithUpdatedStats: ForumPost = {
    ...post,
    stats: {
      ...post.stats,
      comments: commentsCount,
    },
  }
  return { post: postWithUpdatedStats, comments }
}

export function createForumComment(
  postId: string,
  body: string,
  parentId: string | null = null,
  authorId?: string,
): ForumComment {
  const trimmed = body.trim()
  if (!trimmed) {
    throw new Error('Comment body cannot be empty')
  }
  const fallbackAuthor = forumData.users[0]?.username ?? 'anonymous'
  const chosenAuthor = authorId ?? fallbackAuthor
  const id = `tc-${postId}-${Date.now()}`
  const createdAt = new Date().toISOString()

  const row: ForumCommentRow = {
    id,
    postId,
    parentId: parentId ?? null,
    authorId: chosenAuthor,
    avatar: '',
    body: trimmed,
    markdown: '',
    upvotes: 0,
    createdAt,
    isPinned: false,
    isLocked: false,
  }

  extraThreadComments.push(row)

  const author = usersById.get(chosenAuthor)
  return {
    id: row.id,
    parentId: row.parentId ?? null,
    author: author ?? { id: chosenAuthor, username: chosenAuthor, avatar: '', karma: 0 },
    avatar: row.avatar || undefined,
    body: row.body,
    markdown: row.markdown || undefined,
    upvotes: row.upvotes,
    createdAt: row.createdAt,
    editedAt: undefined,
    isPinned: undefined,
    isLocked: undefined,
    replies: [],
  }
}
