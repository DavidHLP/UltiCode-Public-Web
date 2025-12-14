<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";
import Calendars from "@/features/sider/Calendars.vue";
import { fetchProblemLists } from "@/api/problem-list";
import NavUser from "@/features/sider/NavUser.vue";
import SidebarNav from "@/features/sider/SidebarNav.vue";
import {
  forumSidebarData,
  problemSidebarData,
  contestSidebarData,
  personalSidebarData,
} from "@/features/sider/sidebar.data";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import type { ProblemListGroup } from "@/types/problem-list";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const props = defineProps<SidebarProps>();
const route = useRoute();

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

const problemLists = ref<ProblemListGroup[]>([]);

onMounted(async () => {
  try {
    problemLists.value = await fetchProblemLists();
  } catch (error) {
    console.error("Failed to load problem lists", error);
    problemLists.value = [];
  }
});

const isProblemContext = computed(() => route.path.startsWith("/problemset"));
const isContestContext = computed(() => route.path.startsWith("/contest"));
const isPersonalContext = computed(() => route.path.startsWith("/personal"));

const currentSidebarData = computed(() => {
  if (isProblemContext.value) {
    return problemSidebarData;
  }
  if (isContestContext.value) {
    return contestSidebarData;
  }
  if (isPersonalContext.value) {
    return personalSidebarData;
  }
  return forumSidebarData;
});
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader class="h-16 border-b border-sidebar-border">
      <NavUser :user="data.user" />
    </SidebarHeader>
    <SidebarContent>
      <!-- Dynamic Sidebar Navigation -->
      <SidebarNav :sections="currentSidebarData" />

      <template v-if="isProblemContext">
        <SidebarSeparator class="mx-0" />
        <!-- Existing Problem Lists Feature (Only for Problem Context) -->
        <Calendars :problemLists="problemLists" />
      </template>
    </SidebarContent>
    <SidebarFooter> </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
