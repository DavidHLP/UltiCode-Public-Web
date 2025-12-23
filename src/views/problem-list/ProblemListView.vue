<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProblemExplorer from "@/components/problem/ProblemExplorer.vue";
import { Button } from "@/components/ui/button";
import {
  GitFork,
  ListX,
  MoreHorizontal,
  Share2,
  CalendarDays,
  Clock,
  Copy,
  Pencil,
  Trash2,
  Settings,
} from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { ProblemListItem } from "@/types/problem-list";
import type { Problem } from "@/types/problem";
import {
  fetchProblemListItem,
  fetchProblemsByListId,
  forkProblemList,
  deleteProblemList,
  updateProblemList,
} from "@/api/problem-list";
import { fetchCurrentUserId } from "@/utils/auth";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "vue-sonner";
import ProblemListAnalytics from "./ProblemListAnalytics.vue";

const route = useRoute();
const router = useRouter();
const listId = computed(() => route.params.id as string);

// 获取当前列表的详细信息
const currentList = ref<ProblemListItem | null>(null);
const problems = ref<Problem[]>([]);
const problemsWithStatus = computed(() => problems.value);
const currentUser = fetchCurrentUserId();

// State for dialogs
const isEditOpen = ref(false);
const isDeleteOpen = ref(false);
const isForking = ref(false);
const isDeleting = ref(false);

const editForm = ref({
  name: "",
  description: "",
  isPublic: false,
});

async function loadProblemList(id?: string) {
  if (!id) {
    currentList.value = null;
    problems.value = [];
    return;
  }
  const userId = fetchCurrentUserId();
  try {
    currentList.value = await fetchProblemListItem(id);
    if (currentList.value) {
      editForm.value = {
        name: currentList.value.name,
        description: currentList.value.description || "",
        isPublic: currentList.value.isPublic || false,
      };
    }
  } catch (error) {
    console.error("Failed to load problem list", error);
    currentList.value = null;
  }
  try {
    problems.value = await fetchProblemsByListId(id, userId ?? undefined);
  } catch (error) {
    console.error("Failed to load problems for list", error);
    problems.value = [];
  }
}

watch(
  listId,
  (id) => {
    void loadProblemList(id);
  },
  { immediate: true },
);

// 格式化日期
const formatDate = (date?: Date | string) => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
};

// Actions
const handleShare = async () => {
  const url = window.location.href;
  await navigator.clipboard.writeText(url);
  toast({
    title: "Link copied",
    description:
      "The link to this problem list has been copied to your clipboard.",
  });
};

const handleFork = async () => {
  if (!currentUser) {
    toast({
      title: "Authentication required",
      description: "Please sign in to fork this list.",
      variant: "destructive",
    });
    return;
  }

  isForking.value = true;
  try {
    const newListId = await forkProblemList(listId.value, currentUser);
    toast({
      title: "List forked",
      description: "You have successfully forked this problem list.",
    });
    router.push(`/problem-list/${newListId}`);
  } catch {
    toast({
      title: "Failed to fork list",
      description: "An error occurred while forking the list.",
      variant: "destructive",
    });
  } finally {
    isForking.value = false;
  }
};

const handleDelete = async () => {
  if (!currentUser || !currentList.value) return;

  isDeleting.value = true;
  try {
    await deleteProblemList(listId.value, currentUser);
    toast({
      title: "List deleted",
      description: "The problem list has been permanently deleted.",
    });
    router.push("/problemset"); // Redirect to main problem set or lists page
  } catch {
    toast({
      title: "Failed to delete list",
      description: "An error occurred while deleting the list.",
      variant: "destructive",
    });
  } finally {
    isDeleting.value = false;
    isDeleteOpen.value = false;
  }
};

const handleSaveEdit = async () => {
  if (!currentUser || !currentList.value) return;

  try {
    await updateProblemList(listId.value, currentUser, {
      name: editForm.value.name,
      description: editForm.value.description,
      isPublic: editForm.value.isPublic,
    });

    // Refresh list data
    await loadProblemList(listId.value);

    toast({
      title: "List updated",
      description: "Problem list details have been updated.",
    });
    isEditOpen.value = false;
  } catch {
    toast({
      title: "Failed to update list",
      description: "An error occurred while updating the list.",
      variant: "destructive",
    });
  }
};

const isOwner = computed(() => {
  return currentUser && currentList.value?.authorId === currentUser;
});
</script>

<template>
  <div
    class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-[1400px]"
  >
    <!-- Header Section -->
    <div
      class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b pb-8"
    >
      <div class="space-y-4 max-w-3xl">
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <Badge variant="outline" class="rounded-md px-2.5 py-0.5"
              >List</Badge
            >
            <span
              v-if="!currentList?.isPublic"
              class="text-xs text-muted-foreground flex items-center gap-1"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-yellow-500/70"></span>
              Private
            </span>
          </div>
          <h1
            class="text-3xl font-bold tracking-tight sm:text-4xl text-foreground/90"
          >
            {{ currentList?.name || "Problem List" }}
          </h1>
        </div>

        <p
          v-if="currentList?.description"
          class="text-lg text-muted-foreground/80 leading-relaxed"
        >
          {{ currentList.description }}
        </p>

        <div
          class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground/70"
        >
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium"
            >
              {{ currentList?.authorId?.slice(0, 2).toUpperCase() || "U" }}
            </div>
            <span>Author</span>
          </div>

          <Separator orientation="vertical" class="h-4" />

          <span v-if="currentList?.createdAt" class="flex items-center gap-1.5">
            <CalendarDays class="w-4 h-4" />
            Created {{ formatDate(currentList.createdAt) }}
          </span>

          <span v-if="currentList?.updatedAt" class="flex items-center gap-1.5">
            <Clock class="w-4 h-4" />
            Updated {{ formatDate(currentList.updatedAt) }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <Button variant="secondary" size="sm" class="h-9" @click="handleShare">
          <Share2 class="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          class="h-9"
          @click="handleFork"
          :disabled="isForking"
        >
          <GitFork class="mr-2 h-4 w-4" />
          {{ isForking ? "Forking..." : "Fork" }}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="h-9 w-9">
              <MoreHorizontal class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <template v-if="isOwner">
              <DropdownMenuItem @click="isEditOpen = true">
                <Pencil class="mr-2 h-4 w-4" />
                Edit List Details
              </DropdownMenuItem>
              <DropdownMenuItem disabled title="Coming soon">
                <Settings class="mr-2 h-4 w-4" />
                Manage Problems
              </DropdownMenuItem>
            </template>
            <DropdownMenuItem @click="handleFork" :disabled="isForking">
              <Copy class="mr-2 h-4 w-4" />
              Duplicate List
            </DropdownMenuItem>
            <template v-if="isOwner">
              <DropdownMenuSeparator />
              <DropdownMenuItem
                class="text-destructive focus:text-destructive"
                @click="isDeleteOpen = true"
              >
                <Trash2 class="mr-2 h-4 w-4" />
                Delete List
              </DropdownMenuItem>
            </template>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Edit Dialog -->
    <Dialog v-model:open="isEditOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit List Details</DialogTitle>
          <DialogDescription>
            Make changes to your problem list here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="name" class="text-right">Name</Label>
            <Input id="name" v-model="editForm.name" class="col-span-3" />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="description" class="text-right">Description</Label>
            <Textarea
              id="description"
              v-model="editForm.description"
              class="col-span-3"
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="public" class="text-right">Public</Label>
            <div class="col-span-3 flex items-center space-x-2">
              <Switch id="public" v-model:checked="editForm.isPublic" />
              <span class="text-sm text-muted-foreground">{{
                editForm.isPublic
                  ? "Everyone can see this list"
                  : "Only you can see this list"
              }}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" @click="handleSaveEdit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation -->
    <Dialog v-model:open="isDeleteOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            problem list "<strong>{{ currentList?.name }}</strong
            >".
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" @click="isDeleteOpen = false"
            >Cancel</Button
          >
          <Button
            variant="destructive"
            @click="handleDelete"
            :disabled="isDeleting"
          >
            {{ isDeleting ? "Deleting..." : "Delete List" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div v-if="problems.length === 0" class="py-12">
      <Empty
        class="h-80 border border-dashed border-border/60 bg-muted/20 rounded-xl"
      >
        <EmptyContent>
          <EmptyMedia
            variant="icon"
            class="bg-background p-4 rounded-full shadow-sm mb-4"
          >
            <ListX class="h-8 w-8 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <h3 class="text-xl font-semibold text-foreground mb-1">
              No problems in this list
            </h3>
            <EmptyDescription class="text-base">
              This list is currently empty. Add problems to start tracking your
              progress.
            </EmptyDescription>
          </EmptyHeader>
          <Button class="mt-6" size="lg">Add Problems</Button>
        </EmptyContent>
      </Empty>
    </div>

    <!-- Main Content Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Problem List (8 cols) -->
      <div class="lg:col-span-8 space-y-6">
        <ProblemExplorer :problems="problemsWithStatus" />
      </div>

      <!-- Right Column: Analytics Sidebar (4 cols) -->
      <div class="lg:col-span-4 space-y-6 sticky top-6">
        <ProblemListAnalytics :problems="problemsWithStatus" />

        <!-- Motivation Card (Optional Placeholder) -->
        <div class="bg-primary/5 rounded-lg p-5 border border-primary/10">
          <h4 class="font-medium text-primary mb-2 flex items-center gap-2">
            🔥 Keep it up!
          </h4>
          <p class="text-sm text-primary/80">
            Solve <strong>3 more</strong> problems to reach 50% completion on
            this list.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
