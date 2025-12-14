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
      component: () => import("@/views/forum/comments/ThreadView.vue"),
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

const problemSetRoute: RouteRecordRaw = {
  path: "/problemset",
  component: () => import("@/features/sider/AppLayout.vue"),
  children: [
    {
      path: "",
      name: "problemset",
      component: () => import("@/views/problem-set/ProblemSetView.vue"),
    },
  ],
};

const problemDetailRoute: RouteRecordRaw = {
  path: "/problems/:slug/:tab?",
  name: "problem-detail",
  component: () => import("@/views/problems/ProblemDetailView.vue"),
};

const solutionCreateRoute: RouteRecordRaw = {
  path: "/problem/:id(\\d+)/solution/create",
  name: "solution-create",
  component: () =>
    import("@/views/post-editor/solutions/SolutionsEditView.vue"),
};

const solutionCreateFromSubmissionRoute: RouteRecordRaw = {
  path: "/post-editor/solution/create",
  name: "solution-create-from-submission",
  component: () =>
    import("@/views/post-editor/solutions/SolutionsEditView.vue"),
};

const personalRoutes: RouteRecordRaw = {
  path: "/personal",
  component: () => import("@/features/sider/AppLayout.vue"),
  children: [
    {
      path: "",
      name: "personal-profile",
      component: () => import("@/views/personal/PersonalView.vue"),
    },
    {
      path: "account",
      name: "personal-account",
      component: () => import("@/views/personal/AccountView.vue"),
    },
    {
      path: "submissions",
      name: "personal-submissions",
      component: () => import("@/views/personal/SubmissionsView.vue"),
    },
    {
      path: "solutions",
      name: "personal-solutions",
      component: () => import("@/views/personal/SolutionsView.vue"),
    },
  ],
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: { name: "forum-home" } },
    forumRoutes,
    contestRoutes,
    problemSetRoute,
    problemDetailRoute,
    solutionCreateRoute,
    solutionCreateFromSubmissionRoute,
    {
      path: "/login",
      name: "login",
      component: () => import("../views/auth/LoginView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/auth/RegisterView.vue"),
    },
    {
      path: "/forgot-password",
      name: "forgot-password",
      component: () => import("../views/auth/ForgotPasswordView.vue"),
    },
    personalRoutes,
  ],
});

export default router;
