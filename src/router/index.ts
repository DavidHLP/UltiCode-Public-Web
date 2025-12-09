import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

const forumRoutes: RouteRecordRaw = {
  path: "/forum",
  component: () => import("@/features/sider/AppLayout.vue"),
  children: [
    {
      path: "",
      name: "forum-home",
      component: () => import("@/views/forum/home/ForumHomeView.vue"),
    },
    {
      path: "detailed/:postId",
      name: "forum-thread",
      component: () => import("@/views/forum/thread/ForumThreadView.vue"),
    },
  ],
};

const contestRoutes: RouteRecordRaw = {
  path: "/contest",
  component: () => import("@/features/sider/AppLayout.vue"),
  children: [
    {
      path: "",
      name: "contest-home",
      component: () => import("@/views/contest/ContestView.vue"),
    },
    {
      path: ":contestId",
      name: "contest-detail",
      component: () => import("@/views/contest/detailed/ContestDetailView.vue"),
    },
  ],
};

const problemRoutes: RouteRecordRaw = {
  path: "/problem",
  component: () => import("@/features/sider/AppLayout.vue"),
  children: [
    {
      path: "",
      component: () => import("@/views/problem/ProblemLayout.vue"),
      children: [
        { path: "", redirect: { name: "problem-set" } },
        {
          path: "problem-set",
          name: "problem-set",
          component: () =>
            import("@/views/problem/problem-set/ProblemSetView.vue"),
        },
        {
          path: "problem-list/:id",
          name: "problem-list",
          component: () =>
            import("@/views/problem/problem-list/ProblemListView.vue"),
        },
      ],
    },
  ],
};

const problemDetailRoute: RouteRecordRaw = {
  path: "/problems/:id",
  name: "problem-detail",
  component: () => import("@/views/problem/detail/ProblemDetailView.vue"),
};

const solutionCreateRoute: RouteRecordRaw = {
  path: "/problem/:id(\\d+)/solution/create",
  name: "solution-create",
  component: () =>
    import("@/views/problem/detail/left-panel/solutions/SolutionsEditView.vue"),
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: { name: "forum-home" } },
    forumRoutes,
    contestRoutes,
    problemRoutes,
    problemDetailRoute,
    solutionCreateRoute,
  ],
});

export default router;
