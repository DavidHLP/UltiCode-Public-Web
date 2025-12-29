<script setup lang="ts">
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ThumbsUp,
  MessageSquare,
  Eye,
  ArrowRight,
  FileCode2,
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
  Code2,
  Loader2,
  Plus,
} from "lucide-vue-next";
import { onMounted, ref } from "vue";
import {
  fetchUserSolutions,
  type SolutionFeedResponse,
  deleteSolution,
} from "@/api/solution";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "vue-sonner";
import { RouterLink, useRouter } from "vue-router";
import { fetchCurrentUserId } from "@/utils/auth";

const router = useRouter();

const solutions = ref<SolutionFeedResponse["items"]>([]);
const loading = ref(true);
const hasUser = ref(false);

const handleEdit = (solutionId: string) => {
  router.push({ name: "solution-edit", params: { id: solutionId } });
};

const handleView = (solution: SolutionFeedResponse["items"][number]) => {
  const slugOrId = solution.problem?.slug || solution.problem_id;
  router.push({
    name: "problem-detail",
    params: { slug: slugOrId, tab: "solution" },
  });
};

const handleDelete = async (solutionId: string) => {
  const confirmed = window.confirm(
    "Delete this solution? This action cannot be undone.",
  );
  if (!confirmed) return;
  try {
    await deleteSolution(solutionId);
    toast.success("Solution deleted successfully");
    // Remove from list
    solutions.value = solutions.value.filter((s) => s.id !== solutionId);
  } catch (error) {
    console.error("Failed to delete solution", error);
    toast.error("Failed to delete solution");
  }
};

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
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-3xl font-bold tracking-tight">My Solutions</h2>
        <p class="text-muted-foreground">
          Manage and track the performance of your shared technical solutions.
        </p>
      </div>
      <Button as-child class="rounded-full gap-2">
        <RouterLink to="/problemset">
          <Plus class="h-4 w-4" />
          New Solution
        </RouterLink>
      </Button>
    </div>

    <Separator />

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 class="h-10 w-10 animate-spin text-primary" />
      <p class="text-sm text-muted-foreground">Loading your solutions...</p>
    </div>
    
    <div v-else-if="!hasUser" class="text-center py-20 border-2 border-dashed rounded-3xl">
      <p class="text-muted-foreground mb-4">Please log in to view your solutions.</p>
      <Button as-child>
        <RouterLink to="/login">Sign In</RouterLink>
      </Button>
    </div>

    <div
      v-else-if="solutions.length > 0"
      class="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
    >
      <Card v-for="sol in solutions" :key="sol.id" class="flex flex-col group hover:shadow-lg transition-all duration-300 border-muted/60">
        <CardHeader class="pb-3">
          <div class="flex items-center justify-between mb-3">
            <Badge variant="outline" class="font-mono text-[10px] bg-primary/5 text-primary border-primary/20">
              {{ sol.language }}
            </Badge>
            <div class="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <Calendar class="h-3 w-3" />
              {{ new Date(sol.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) }}
            </div>
          </div>
          
          <div class="flex items-start justify-between gap-2">
            <div class="space-y-1 flex-1 min-w-0">
              <CardTitle class="line-clamp-2 text-lg font-black group-hover:text-primary transition-colors cursor-pointer" @click="handleView(sol)">
                {{ sol.title }}
              </CardTitle>
              <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Code2 class="h-3.5 w-3.5" />
                <span class="truncate">Problem: {{ sol.problem?.title || "Unknown" }}</span>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full">
                  <MoreVertical class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-40">
                <DropdownMenuItem @click="handleView(sol)" class="gap-2">
                  <Eye class="h-4 w-4" /> View
                </DropdownMenuItem>
                <DropdownMenuItem @click="handleEdit(sol.id)" class="gap-2">
                  <Pencil class="h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  @click="handleDelete(sol.id)"
                  class="text-destructive focus:text-destructive gap-2"
                >
                  <Trash2 class="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent class="flex-1 pb-4">
          <div class="flex flex-wrap gap-1.5 mt-2">
            <Badge
              v-for="tag in sol.tags"
              :key="tag"
              variant="secondary"
              class="text-[10px] font-medium py-0 h-5"
            >
              {{ tag }}
            </Badge>
            <span v-if="!sol.tags || sol.tags.length === 0" class="text-xs text-muted-foreground italic">No tags</span>
          </div>
        </CardContent>

        <CardFooter class="border-t bg-muted/10 px-4 py-3">
          <div class="flex w-full items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1.5 text-muted-foreground group/stat">
                <ThumbsUp class="h-3.5 w-3.5 group-hover/stat:text-primary transition-colors" />
                <span class="text-xs font-bold">{{ sol.votes }}</span>
              </div>
              <div class="flex items-center gap-1.5 text-muted-foreground group/stat">
                <Eye class="h-3.5 w-3.5 group-hover/stat:text-primary transition-colors" />
                <span class="text-xs font-bold">{{ sol.views }}</span>
              </div>
              <div class="flex items-center gap-1.5 text-muted-foreground group/stat">
                <MessageSquare class="h-3.5 w-3.5 group-hover/stat:text-primary transition-colors" />
                <span class="text-xs font-bold">{{ sol.stats?.comments || 0 }}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              class="h-8 text-xs font-bold gap-1 rounded-full hover:bg-primary hover:text-primary-foreground transition-all"
              @click="handleView(sol)"
            >
              DETAILS
              <ArrowRight class="h-3 w-3" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
    
    <div
      v-else
      class="flex h-[450px] flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-muted/10 p-10 text-center"
    >
      <div
        class="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-6"
      >
        <FileCode2 class="h-10 w-10 text-muted-foreground/50" />
      </div>
      <h3 class="text-xl font-bold">No solutions shared yet</h3>
      <p class="mb-8 mt-2 max-w-[300px] text-sm text-muted-foreground">
        Sharing your thought process helps you and others learn better. Post your first solution!
      </p>
      <Button as-child class="rounded-full px-8 h-12 text-base font-bold">
        <RouterLink to="/problemset">Start Coding</RouterLink>
      </Button>
    </div>
  </div>
</template>

