<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ThumbsUp,
  MessageSquare,
  Eye,
  ArrowRight,
  FileCode2,
} from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { fetchUserSolutions, type SolutionFeedResponse } from "@/api/solution";
import { RouterLink } from "vue-router";
import { fetchCurrentUserId } from "@/utils/auth";

// Access the array type from the response type items or use any if hard to extract
const solutions = ref<SolutionFeedResponse["items"]>([]);
const loading = ref(true);
const hasUser = ref(false);

onMounted(async () => {
  try {
    const userId = fetchCurrentUserId();
    if (!userId) return;
    hasUser.value = true;
    const response = await fetchUserSolutions(userId);
    solutions.value = response.items;
  } catch (e) {
    console.error("Failed to load solutions", e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="space-y-0.5">
      <h2 class="text-2xl font-bold tracking-tight">My Solutions</h2>
      <p class="text-muted-foreground">
        Manage the solutions you have shared with the community.
      </p>
    </div>

    <div v-if="loading" class="text-center text-muted-foreground py-8">
      Loading solutions...
    </div>
    <div v-else-if="!hasUser" class="text-center text-muted-foreground py-8">
      Please log in to view your solutions.
    </div>
    <div
      v-else-if="solutions.length > 0"
      class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      <Card v-for="sol in solutions" :key="sol.id" class="flex flex-col">
        <CardHeader>
          <div class="flex items-start justify-between">
            <Badge variant="secondary">{{ sol.language }}</Badge>
            <span class="text-xs text-muted-foreground">{{
              new Date(sol.created_at).toLocaleDateString()
            }}</span>
          </div>
          <CardTitle class="line-clamp-1 mt-2 text-lg">{{
            sol.title
          }}</CardTitle>
          <CardDescription>Solution</CardDescription>
        </CardHeader>
        <CardContent class="flex-1">
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="tag in sol.tags"
              :key="tag"
              variant="outline"
              class="text-xs font-normal"
            >
              {{ tag }}
            </Badge>
          </div>
        </CardContent>
        <CardFooter class="border-t bg-muted/20 p-4">
          <div
            class="flex w-full items-center justify-between text-muted-foreground"
          >
            <div class="flex gap-4 text-xs">
              <div class="flex items-center gap-1">
                <ThumbsUp class="h-3 w-3" />
                <span>{{ sol.votes }}</span>
              </div>
              <div class="flex items-center gap-1">
                <Eye class="h-3 w-3" />
                <span>{{ sol.views }}</span>
              </div>
              <div class="flex items-center gap-1">
                <MessageSquare class="h-3 w-3" />
                <span>{{ sol.stats?.comments || 0 }}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" class="h-6 w-6">
              <ArrowRight class="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
    <div
      v-else
      class="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed"
    >
      <div
        class="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center"
      >
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-muted"
        >
          <FileCode2 class="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 class="mt-4 text-lg font-semibold">No solutions posted</h3>
        <p class="mb-4 mt-2 text-sm text-muted-foreground">
          You haven't shared any solutions yet. Solve a problem and share your
          approach!
        </p>
        <Button as-child>
          <RouterLink to="/problemset">Solve Problems</RouterLink>
        </Button>
      </div>
    </div>
  </div>
</template>
