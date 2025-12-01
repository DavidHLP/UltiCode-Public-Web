import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

const forumRoutes: RouteRecordRaw = {
  path: "/forum",
  component: () => import("@/layout/AppLayout.vue"),
  children: [
    {
      path: "",
      name: "forum-home",
      component: () => import("@/view/forum/home/ForumHomeView.vue"),
    },
    {
      path: "detailed/:postId",
      name: "forum-thread",
      component: () => import("@/view/forum/thread/ForumThreadView.vue"),
    },
  ],
};

const contestRoutes: RouteRecordRaw = {
  path: "/contest",
  component: () => import("@/layout/AppLayout.vue"),
  children: [
    {
      path: "",
      name: "contest-home",
      component: () => import("@/view/contest/ContestView.vue"),
    },
    {
      path: ":contestId",
      name: "contest-detail",
      component: () => import("@/view/contest/detailed/ContestDetailView.vue"),
    },
  ],
};

const problemRoutes: RouteRecordRaw = {
  path: "/problem",
  component: () => import("@/layout/AppLayout.vue"),
  children: [
    {
      path: "",
      component: () => import("@/view/problem/ProblemLayout.vue"),
      children: [
        { path: "", redirect: { name: "problem-set" } },
        {
          path: "problem-set",
          name: "problem-set",
          component: () =>
            import("@/view/problem/problem-set/ProblemSetView.vue"),
        },
        {
          path: "problem-list/:id",
          name: "problem-list",
          component: () =>
            import("@/view/problem/problem-list/ProblemListView.vue"),
        },
      ],
    },
  ],
};

const problemDetailRoute: RouteRecordRaw = {
  path: "/problem/detail/:id(\\d+)",
  name: "problem-detail",
  component: () => import("@/view/problem/detail/ProblemDetailView.vue"),
};

const solutionCreateRoute: RouteRecordRaw = {
  path: "/problem/:id(\\d+)/solution/create",
  name: "solution-create",
  component: () =>
    import("@/view/problem/detail/left-panel/solutions/SolutionsEditView.vue"),
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
