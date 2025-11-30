import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: { name: "forum-home" },
    },
    {
      path: "/forum",
      component: () => import("@/layout/AppLayout.vue"),
      children: [
        {
          path: "",
          name: "forum-home",
          component: () => import("@/view/forum/ForumView.vue"),
        },
        {
          path: "detailed/:postId",
          name: "forum-thread",
          component: () =>
            import("@/view/forum/detailed/ForumDetailedView.vue"),
        },
      ],
    },
    {
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
    },
    {
      path: "/problem",
      component: () => import("@/layout/AppLayout.vue"),
      children: [
        {
          path: "",
          component: () => import("@/view/problem/ProblemLayout.vue"),
          children: [
            { path: "", redirect: { name: "problemset" } },
            {
              path: "problemset",
              name: "problemset",
              component: () => import("@/view/problem/problem-set/ProblemSetView.vue"),
            },
            {
              path: "problemlist/:id",
              name: "problemlist",
              component: () =>
                import("@/view/problem/problem-list/ProblemListView.vue"),
            },
          ],
        },
      ],
    },
    {
      path: "/problem/detail/:id(\\d+)",
      name: "problem-detail",
      component: () => import("@/view/problem/detail/ProblemDetailView.vue"),
    },
    {
      path: "/problem/:id(\\d+)/solution/create",
      name: "solution-create",
      component: () => import("@/view/problem/detail/left-panel/solutions/SolutionsEditView.vue"),
    }
  ],
});

export default router;
