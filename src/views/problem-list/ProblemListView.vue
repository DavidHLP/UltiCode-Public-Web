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
  Plus,
  Search,
  Check,
  Bookmark,
  BookmarkCheck,
  Globe,
  Lock,
  FolderInput,
  BookmarkMinus,
} from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  ProblemList,
  ProblemListCategoryOption,
} from "@/types/problem-list";
import type { Problem } from "@/types/problem";
import {
  fetchProblemListOverview,
  forkProblemList,
  deleteProblemList,
  updateProblemList,
  addProblemToList,
  removeProblemFromList,
  saveList,
  unsaveList,
  moveListToCategory,
} from "@/api/problem-list";
import { searchProblems } from "@/api/problem";
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
const currentList = ref<ProblemList | null>(null);
const problems = ref<Problem[]>([]);
const problemsWithStatus = computed(() => problems.value);
const currentUser = fetchCurrentUserId();

// State for dialogs
const isEditOpen = ref(false);
const isDeleteOpen = ref(false);
const isAddProblemsOpen = ref(false);
const isForking = ref(false);
const isDeleting = ref(false);
const isSaved = ref(false);
const isSaving = ref(false);
const userCategories = ref<ProblemListCategoryOption[]>([]);
const currentCategoryId = ref<string | null>(null);

// Add problems state
const searchQuery = ref("");
const searchResults = ref<Problem[]>([]);
const isSearching = ref(false);
const addingProblemIds = ref<Set<number>>(new Set());
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const editForm = ref({
  name: "",
  description: "",
  isPublic: false,
});

async function loadProblemList(id?: string) {
  if (!id) {
    currentList.value = null;
    problems.value = [];
    isSaved.value = false;
    return;
  }
  const userId = fetchCurrentUserId();
  try {
    const overview = await fetchProblemListOverview(id, userId ?? undefined);
    currentList.value = overview.list;
    problems.value = overview.problems;
    isSaved.value = overview.viewer?.isSaved ?? false;
    currentCategoryId.value = overview.viewer?.categoryId ?? null;
    userCategories.value = overview.categories ?? [];

    if (currentList.value) {
      editForm.value = {
        name: currentList.value.name,
        description: currentList.value.description || "",
        isPublic: currentList.value.isPublic || false,
      };
    }
  } catch (error) {
    console.error("Failed to load problem list overview", error);
    problems.value = [];
    currentList.value = null;
    isSaved.value = false;
    currentCategoryId.value = null;
    userCategories.value = [];
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
    router.push(`/problemset/list/${newListId}`);
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
  return !!(currentUser && currentList.value?.authorId === currentUser);
});

// Can save: user is logged in and not the owner
const canSave = computed(() => {
  return !!(
    currentUser &&
    currentList.value &&
    currentList.value.authorId !== currentUser &&
    currentList.value.isPublic
  );
});

// Handle save/unsave
const handleToggleSave = async () => {
  if (!currentUser || !currentList.value) return;

  isSaving.value = true;
  try {
    if (isSaved.value) {
      await unsaveList(listId.value, currentUser);
      isSaved.value = false;
      currentCategoryId.value = null;
      toast.success("Removed from saved lists");
    } else {
      await saveList(listId.value, currentUser);
      isSaved.value = true;
      toast.success("Saved to your lists");
    }
  } catch {
    toast.error(isSaved.value ? "Failed to unsave" : "Failed to save");
  } finally {
    isSaving.value = false;
  }
};

// Handle move to category
const handleMoveToCategory = async (categoryId: string | null) => {
  if (!currentUser || !isSaved.value) return;

  try {
    await moveListToCategory(listId.value, currentUser, categoryId);
    currentCategoryId.value = categoryId;
    toast.success(categoryId ? "Moved to category" : "Removed from category");
  } catch {
    toast.error("Failed to move list");
  }
};

// Check if problem is already in the list
const problemIdsInList = computed(() => {
  return new Set(problems.value.map((p) => p.id));
});

// Search for problems with debounce
const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const query = searchQuery.value.trim();
    if (!query) {
      searchResults.value = [];
      return;
    }
    isSearching.value = true;
    try {
      searchResults.value = await searchProblems(query);
    } catch (e) {
      console.error("Failed to search problems", e);
      searchResults.value = [];
    } finally {
      isSearching.value = false;
    }
  }, 300);
};

const handleAddProblem = async (problem: Problem) => {
  if (!currentUser || addingProblemIds.value.has(problem.id)) return;

  addingProblemIds.value.add(problem.id);
  try {
    await addProblemToList(listId.value, currentUser, problem.id);
    // Add to local list
    problems.value = [...problems.value, problem];
    toast.success(`Added "${problem.title}" to the list`);
  } catch (e) {
    console.error("Failed to add problem", e);
    toast.error("Failed to add problem to the list");
  } finally {
    addingProblemIds.value.delete(problem.id);
  }
};

const handleRemoveProblem = async (problem: Problem) => {
  if (!currentUser) return;

  try {
    await removeProblemFromList(listId.value, currentUser, problem.id);
    problems.value = problems.value.filter((p) => p.id !== problem.id);
    toast.success(`Removed "${problem.title}" from the list`);
  } catch (e) {
    console.error("Failed to remove problem", e);
    toast.error("Failed to remove problem from the list");
  }
};

const openAddProblemsDialog = () => {
  searchQuery.value = "";
  searchResults.value = [];
  isAddProblemsOpen.value = true;
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "text-green-600 bg-green-100";
    case "medium":
      return "text-yellow-600 bg-yellow-100";
    case "hard":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};
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
            <Badge
              v-if="currentList?.isPublic"
              variant="secondary"
              class="gap-1 text-xs"
            >
              <Globe class="h-3 w-3" />
              Public
            </Badge>
            <Badge
              v-else
              variant="outline"
              class="gap-1 text-xs text-muted-foreground"
            >
              <Lock class="h-3 w-3" />
              Private
            </Badge>
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
        <!-- Save Button (for non-owners) -->
        <Button
          v-if="canSave"
          :variant="isSaved ? 'default' : 'outline'"
          size="sm"
          class="h-9 gap-2"
          @click="handleToggleSave"
          :disabled="isSaving"
        >
          <BookmarkCheck v-if="isSaved" class="h-4 w-4" />
          <Bookmark v-else class="h-4 w-4" />
          {{ isSaving ? "Saving..." : isSaved ? "Saved" : "Save" }}
        </Button>
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
              <DropdownMenuItem @click="openAddProblemsDialog">
                <Plus class="mr-2 h-4 w-4" />
                Add Problems
              </DropdownMenuItem>
            </template>
            <!-- Actions for saved lists (non-owners) -->
            <template v-if="canSave && isSaved">
              <DropdownMenuSub v-if="userCategories.length > 0">
                <DropdownMenuSubTrigger>
                  <FolderInput class="mr-2 h-4 w-4" />
                  Move to Category
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    v-if="currentCategoryId"
                    @click="handleMoveToCategory(null)"
                  >
                    Remove from Category
                  </DropdownMenuItem>
                  <DropdownMenuSeparator v-if="currentCategoryId" />
                  <DropdownMenuItem
                    v-for="cat in userCategories"
                    :key="cat.id"
                    @click="handleMoveToCategory(cat.id)"
                  >
                    {{ cat.name }}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem @click="handleToggleSave">
                <BookmarkMinus class="mr-2 h-4 w-4" />
                Unsave
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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

    <!-- Add Problems Dialog -->
    <Dialog v-model:open="isAddProblemsOpen">
      <DialogContent class="sm:max-w-[650px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Problems</DialogTitle>
          <DialogDescription>
            Search for problems to add to your list.
          </DialogDescription>
        </DialogHeader>
        <div class="flex-1 space-y-4 py-4 overflow-hidden">
          <!-- Search Input -->
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              v-model="searchQuery"
              placeholder="Search by problem title or ID..."
              class="pl-10"
              @input="handleSearch"
            />
          </div>

          <!-- Search Results -->
          <div class="border rounded-md overflow-hidden">
            <div
              v-if="isSearching"
              class="flex items-center justify-center py-12"
            >
              <span class="text-muted-foreground">Searching...</span>
            </div>
            <div
              v-else-if="searchQuery && searchResults.length === 0"
              class="flex items-center justify-center py-12"
            >
              <span class="text-muted-foreground">No problems found</span>
            </div>
            <div
              v-else-if="!searchQuery"
              class="flex items-center justify-center py-12"
            >
              <span class="text-muted-foreground"
                >Enter a search term to find problems</span
              >
            </div>
            <ScrollArea v-else class="h-[320px]">
              <div class="divide-y">
                <div
                  v-for="problem in searchResults"
                  :key="problem.id"
                  class="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div class="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      class="text-sm font-mono text-muted-foreground w-10 shrink-0 text-right"
                    >
                      {{ problem.id }}
                    </span>
                    <span class="text-sm font-medium truncate flex-1">
                      {{ problem.title }}
                    </span>
                    <Badge
                      :class="getDifficultyColor(problem.difficulty)"
                      class="text-xs shrink-0"
                    >
                      {{ problem.difficulty }}
                    </Badge>
                  </div>
                  <div class="shrink-0 ml-3">
                    <Button
                      v-if="problemIdsInList.has(problem.id)"
                      variant="ghost"
                      size="sm"
                      class="text-green-600 gap-1 pointer-events-none"
                    >
                      <Check class="h-4 w-4" />
                      Added
                    </Button>
                    <Button
                      v-else
                      variant="outline"
                      size="sm"
                      class="gap-1"
                      :disabled="addingProblemIds.has(problem.id)"
                      @click="handleAddProblem(problem)"
                    >
                      <Plus class="h-4 w-4" />
                      {{
                        addingProblemIds.has(problem.id) ? "Adding..." : "Add"
                      }}
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isAddProblemsOpen = false"
            >Done</Button
          >
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
          <Button
            class="mt-6"
            size="lg"
            @click="openAddProblemsDialog"
            v-if="isOwner"
            >Add Problems</Button
          >
          <Button class="mt-6" size="lg" @click="handleFork" v-else
            >Fork and Add Problems</Button
          >
        </EmptyContent>
      </Empty>
    </div>

    <!-- Main Content Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Problem List (8 cols) -->
      <div class="lg:col-span-8 space-y-6">
        <ProblemExplorer
          :problems="problemsWithStatus"
          :editable="isOwner"
          @remove="handleRemoveProblem"
        />
      </div>

      <!-- Right Column: Analytics Sidebar (4 cols) -->
      <div class="lg:col-span-4 space-y-6 sticky top-6">
        <ProblemListAnalytics :problems="problemsWithStatus" />
      </div>
    </div>
  </div>
</template>
