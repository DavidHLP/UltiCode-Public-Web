import fs from 'fs'
import os from 'os'
import path from 'path'
import { buildSync } from 'esbuild'
import { createRequire } from 'module'

const projectRoot = process.cwd()
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mocks-json-'))
const tsconfigPath = path.join(projectRoot, 'tsconfig.app.json')

const ensureDir = (filePath) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

const writeJSON = (relativePath, data) => {
  const outputPath = path.join(projectRoot, relativePath)
  ensureDir(outputPath)
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
}

const requireFn = createRequire(import.meta.url)

const loadModule = (relativePath) => {
  const entry = path.join(projectRoot, relativePath)
  const outfile = path.join(
    tmpDir,
    relativePath.replace(/[/.]/g, '_') + '.cjs',
  )
  buildSync({
    entryPoints: [entry],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile,
    tsconfig: tsconfigPath,
    logLevel: 'silent',
  })
  delete requireFn.cache[outfile]
  return requireFn(outfile)
}

const slugify = (value, prefix) => {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const base = normalized || prefix
  return base
}

const transformProblems = () => {
  const { problems } = loadModule('src/mocks/db/problems.ts')
  const tags = new Map()
  const relations = []
  const rows = problems.map((problem) => {
    const { tags: problemTags = [], ...rest } = problem
    problemTags.forEach((label) => {
      const id = slugify(label, 'tag')
      if (!tags.has(id)) {
        tags.set(id, { id, label })
      }
      relations.push({ problemId: problem.id, tagId: id })
    })
    return rest
  })
  writeJSON('src/mocks/db/problems.json', {
    problems: rows,
    problemTags: Array.from(tags.values()),
    problemTagRelations: relations,
  })
}

const transformProblemLists = () => {
  const { myProblemLists, problemListMapping } = loadModule(
    'src/mocks/db/problem-lists.ts',
  )
  const groups = []
  const lists = []
  myProblemLists.forEach((group, index) => {
    const groupId = `group-${index + 1}`
    groups.push({
      id: groupId,
      name: group.name,
      sortOrder: index + 1,
    })
    group.items.forEach((item) => {
      lists.push({
        id: item.id,
        groupId,
        name: item.name,
        description: item.description,
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : '',
        updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : '',
        author: item.author,
        isPublic: item.isPublic ?? true,
      })
    })
  })
  const relations = []
  Object.entries(problemListMapping).forEach(([listId, problemIds]) => {
    problemIds.forEach((problemId) => {
      relations.push({ listId, problemId })
    })
  })
  writeJSON('src/mocks/db/problem-lists.json', {
    groups,
    lists,
    problemListRelations: relations,
  })
}

const transformProblemDetails = () => {
  const { problemDetailRecords } = loadModule(
    'src/mocks/db/problem-detail.ts',
  )
  const details = []
  const examples = []
  const approaches = []
  const approachSteps = []
  const submissions = []
  const languages = []
  const starterNotes = []
  const recentResults = []

  Object.entries(problemDetailRecords).forEach(([problemId, record]) => {
    const detailId = record.slug
    details.push({
      id: detailId,
      problemId: Number(problemId),
      slug: record.slug,
      summary: record.summary,
      companies: record.companies,
      likes: record.likes,
      dislikes: record.dislikes,
      difficultyRating: record.difficultyRating,
      updatedAt: record.updatedAt,
      followUp: record.followUp,
      constraints: record.constraints,
    })

    record.examples.forEach((example) => {
      examples.push({
        id: example.id,
        problemId: Number(problemId),
        input: example.input,
        output: example.output,
        explanation: example.explanation,
      })
    })

    record.approaches.forEach((approach) => {
      approaches.push({
        id: approach.id,
        problemId: Number(problemId),
        title: approach.title,
        summary: approach.summary,
        timeComplexity: approach.complexity.time,
        spaceComplexity: approach.complexity.space,
        code: approach.code,
        language: approach.language,
      })
      approach.steps.forEach((step, index) => {
        approachSteps.push({
          id: `${approach.id}-step-${index + 1}`,
          approachId: approach.id,
          order: index + 1,
          content: step,
        })
      })
    })

    record.submissions.forEach((submission) => {
      submissions.push({
        ...submission,
        problemId: Number(problemId),
      })
    })

    record.languages.forEach((language) => {
      languages.push({
        ...language,
        problemId: Number(problemId),
      })
    })

    record.starterNotes.forEach((note, index) => {
      starterNotes.push({
        id: `${detailId}-note-${index + 1}`,
        problemId: Number(problemId),
        content: note,
      })
    })

    record.recentResults.forEach((result) => {
      recentResults.push({
        ...result,
        problemId: Number(problemId),
      })
    })
  })

  writeJSON('src/mocks/db/problem-detail.json', {
    problemDetails: details,
    problemExamples: examples,
    problemApproaches: approaches,
    problemApproachSteps: approachSteps,
    problemSubmissions: submissions,
    problemLanguages: languages,
    problemStarterNotes: starterNotes,
    problemRecentResults: recentResults,
  })
}

const transformTestCases = () => {
  const { testCasesByProblemId } = loadModule('src/mocks/db/test-case.ts')
  const testCases = []
  const testCaseInputs = []
  Object.entries(testCasesByProblemId).forEach(([problemId, cases]) => {
    cases.forEach((testCase) => {
      testCases.push({
        id: testCase.id,
        problemId: Number(problemId),
        label: testCase.label,
        explanation: testCase.explanation ?? '',
      })
      testCase.inputs.forEach((input, index) => {
        testCaseInputs.push({
          id: `${testCase.id}-${input.id}-${index}`,
          testCaseId: testCase.id,
          field: input.id,
          label: input.label,
          value: input.value,
        })
      })
    })
  })
  writeJSON('src/mocks/db/test-case.json', {
    testCases,
    testCaseInputs,
  })
}

const transformTestResults = () => {
  const { runResultsByProblemId } = loadModule(
    'src/mocks/db/test-results.ts',
  )
  const runResults = []
  const runCases = []
  const runCaseInputs = []
  Object.entries(runResultsByProblemId).forEach(([problemId, run]) => {
    runResults.push({
      id: run.id,
      problemId: Number(problemId),
      verdict: run.verdict,
      runtime: run.runtime,
      memory: run.memory,
    })
    run.cases.forEach((caseResult) => {
      runCases.push({
        id: caseResult.id,
        runId: run.id,
        caseLabel: caseResult.caseLabel,
        status: caseResult.status,
        runtime: caseResult.runtime,
        memory: caseResult.memory,
        detail: caseResult.detail,
        output: caseResult.output,
        expectedOutput: caseResult.expectedOutput,
      })
      caseResult.inputs.forEach((input, index) => {
        runCaseInputs.push({
          id: `${caseResult.id}-${input.id}-${index}`,
          runCaseId: caseResult.id,
          field: input.id,
          label: input.label,
          value: input.value,
        })
      })
    })
  })
  writeJSON('src/mocks/db/test-results.json', {
    runResults,
    runCases,
    runCaseInputs,
  })
}

const transformSolutions = () => {
  const {
    solutionQuickFilterOptions,
    solutionSortOptions,
    solutionFeedMetaFallback,
    solutionFeedMetaSeed,
  } = loadModule('src/mocks/db/solution.ts')

  const filterOptions = [
    ...solutionQuickFilterOptions.map((option, index) => ({
      id: `quick-${index + 1}`,
      kind: 'quick',
      label: option.label,
      value: option.value,
    })),
    ...solutionSortOptions.map((option, index) => ({
      id: `sort-${index + 1}`,
      kind: 'sort',
      label: option.label,
      value: option.value,
    })),
  ]

  const authors = new Map()
  const badges = new Map()
  const badgeRelations = []
  const metas = []

  const registerAuthor = (author) => {
    const key = author.name
    if (!authors.has(key)) {
      const id = `author-${authors.size + 1}`
      authors.set(key, { id, ...author })
    }
    return authors.get(key).id
  }

  const registerBadges = (badgeList, metaId) => {
    badgeList.forEach((label) => {
      const id = slugify(label, 'badge')
      if (!badges.has(id)) {
        badges.set(id, { id, label })
      }
      badgeRelations.push({ badgeId: id, metaId })
    })
  }

  const serializeMeta = (meta, index, prefix = 'meta') => {
    const id = `${prefix}-${index + 1}`
    const authorId = registerAuthor(meta.author)
    metas.push({
      id,
      highlight: meta.highlight,
      flair: meta.flair,
      authorId,
      views: meta.stats.views,
      likes: meta.stats.likes,
      comments: meta.stats.comments,
      createdAt: meta.createdAt,
      publishedAt: meta.publishedAt,
      topic: meta.topic,
      languageFilter: meta.languageFilter,
      score: meta.score,
    })
    registerBadges(meta.badges, id)
    return id
  }

  const fallbackMetaId = serializeMeta(solutionFeedMetaFallback, 0, 'fallback')
  solutionFeedMetaSeed.forEach((meta, index) => {
    serializeMeta(meta, index, 'meta')
  })

  writeJSON('src/mocks/db/solution.json', {
    filterOptions,
    authors: Array.from(authors.values()),
    badges: Array.from(badges.values()),
    badgeRelations,
    metas,
    fallbackMetaId,
  })
}

const transformContests = () => {
  const {
    contestFaq,
    contestFeaturedEvent,
    contestInsights,
    contestLeaderboard,
    contestResources,
    contestSchedule,
    contestTracks,
  } = loadModule('src/mocks/db/contest.ts')

  const events = contestSchedule
  const featuredContestId = contestFeaturedEvent.id
  const insights = contestInsights.map((insight, index) => ({
    ...insight,
    contestId: featuredContestId,
    id: insight.id ?? `insight-${index + 1}`,
  }))
  const tracks = contestTracks.map((track, index) => ({
    ...track,
    contestId: featuredContestId,
    id: track.id ?? `track-${index + 1}`,
  }))
  const resources = contestResources.map((resource, index) => ({
    ...resource,
    contestId: featuredContestId,
    id: resource.id ?? `resource-${index + 1}`,
  }))
  const faqs = contestFaq.map((faq, index) => ({
    ...faq,
    contestId: featuredContestId,
    id: faq.id ?? `faq-${index + 1}`,
  }))
  const leaderboard = contestLeaderboard

  writeJSON('src/mocks/db/contest.json', {
    featuredContestId,
    events,
    insights,
    leaderboard,
    tracks,
    resources,
    faqs,
  })
}

const transformForum = () => {
  const {
    forumCommunities,
    forumModerators,
    forumPosts,
    forumQuickFilters,
    forumTrendingTopics,
  } = loadModule('src/mocks/db/forum.ts')

  const communities = []
  const communityRules = []
  const communityLinks = []
  forumCommunities.forEach((community) => {
    communities.push({
      id: community.id,
      name: community.name,
      slug: community.slug,
      icon: community.icon,
      banner: community.banner ?? '',
      description: community.description,
      members: community.members,
      online: community.online,
      tags: community.tags,
      isOfficial: community.isOfficial ?? false,
      isNew: community.isNew ?? false,
      accentColor: community.accentColor ?? '',
      foundedAt: community.foundedAt ?? '',
    })
    community.rules?.forEach((rule) => {
      communityRules.push({
        id: rule.id,
        communityId: community.id,
        title: rule.title,
        summary: rule.summary,
      })
    })
    community.links?.forEach((link, index) => {
      communityLinks.push({
        id: `${community.id}-link-${index + 1}`,
        communityId: community.id,
        label: link.label,
        url: link.url,
        description: link.description ?? '',
      })
    })
  })

  const users = new Map()
  const ensureUser = (username, extras = {}) => {
    if (!users.has(username)) {
      users.set(username, {
        id: username,
        username,
        avatar: extras.avatar ?? '',
        karma: extras.karma ?? 0,
        roleBadge: extras.roleBadge ?? '',
      })
    } else {
      const existing = users.get(username)
      if (extras.avatar && !existing.avatar) existing.avatar = extras.avatar
      if (extras.karma && !existing.karma) existing.karma = extras.karma
      if (extras.roleBadge && !existing.roleBadge) existing.roleBadge = extras.roleBadge
    }
    return users.get(username).id
  }

  const postStats = []
  const awards = new Map()
  const postAwards = []
  const comments = []
  const postComments = []

  const posts = forumPosts.map((post, index) => {
    const statsId = `${post.id}-stats`
    postStats.push({ id: statsId, ...post.stats })
    const userId = ensureUser(post.user.username, post.user)
    post.commentPreview?.forEach((preview) => {
      const commentUserId = ensureUser(preview.author, {
        avatar: preview.avatar,
      })
      comments.push({
        id: preview.id,
        authorId: commentUserId,
        avatar: preview.avatar ?? '',
        body: preview.body,
        upvotes: preview.upvotes,
        createdAt: preview.createdAt,
      })
      postComments.push({
        postId: post.id,
        commentId: preview.id,
      })
    })
    post.awards?.forEach((award) => {
      if (!awards.has(award.id)) {
        awards.set(award.id, {
          id: award.id,
          name: award.name,
          icon: award.icon,
          description: award.description ?? '',
          count: award.count,
        })
      }
      postAwards.push({
        postId: post.id,
        awardId: award.id,
        count: award.count,
      })
    })
    return {
      id: post.id,
      permalink: post.permalink,
      communityId: post.community.id,
      userId,
      flairLabel: post.flair?.label ?? '',
      flairType: post.flair?.type ?? null,
      title: post.title,
      tags: post.tags,
      excerpt: post.excerpt ?? '',
      media: post.media ?? null,
      recommendation: post.recommendation ?? null,
      statsId,
      createdAt: post.createdAt,
      voteState: post.voteState ?? null,
      isSaved: post.isSaved ?? false,
      impressions: post.impressions ?? 0,
      isPinned: post.isPinned ?? false,
      isLocked: post.isLocked ?? false,
    }
  })

  forumModerators.forEach((moderator) => {
    ensureUser(moderator.username, moderator)
  })

  const moderators = forumModerators.map((moderator) => ({
    id: moderator.username,
    username: moderator.username,
    avatar: moderator.avatar ?? '',
    karma: moderator.karma ?? 0,
    roleBadge: moderator.roleBadge ?? '',
    timezone: moderator.timezone,
    availability: moderator.availability,
    focus: moderator.focus,
  }))

  writeJSON('src/mocks/db/forum.json', {
    communities,
    communityRules,
    communityLinks,
    users: Array.from(users.values()),
    moderators,
    posts,
    postStats,
    awards: Array.from(awards.values()),
    postAwards,
    comments,
    postComments,
    quickFilters: forumQuickFilters,
    trendingTopics: forumTrendingTopics,
  })
}

transformProblems()
transformProblemLists()
transformProblemDetails()
transformTestCases()
transformTestResults()
transformSolutions()
transformContests()
transformForum()
