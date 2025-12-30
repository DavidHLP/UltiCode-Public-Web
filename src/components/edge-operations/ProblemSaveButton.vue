<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  Bookmark,
  BookmarkCheck,
  FolderPlus,
  Loader2,
  Check,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import ActionItem from "./ActionItem.vue";
import { useBookmarkStore } from "@/stores/bookmark";
import {
  addBookmark,
  removeBookmarkByTarget,
  getBookmarkFolders,
} from "@/api/bookmark";
import {
  getUserListsForProblem,
  batchAddProblemToLists,
  batchRemoveProblemFromLists,
  createProblemList,
  type ProblemListWithStatus,
} from "@/api/problem-list";
import type { BookmarkType } from "@/types/bookmark";
import { toast } from "vue-sonner";
import { isAuthenticated, fetchCurrentUserId } from "@/utils/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const props = defineProps<{
  problemId: number;
  targetType: BookmarkType;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "icon";
  count?: number;
}>();

const emit = defineEmits<{
  change: [isFavorite: boolean, folders: string[], listIds: string[]];
}>();

const bookmarkStore = useBookmarkStore();

// Bookmark folder state
const itemFolders = ref<string[]>([]);

// Problem list state
const userLists = ref<ProblemListWithStatus[]>([]);

const isLoading = ref(false);
const isOpen = ref(false);
const isAuthed = ref(false);
const showCreateDialog = ref(false);
const newListName = ref("");
const isCreating = ref(false);

// Check if problem is in default folder (favorited)
const isFavorited = computed(() => {
  const defaultId = bookmarkStore.defaultFolder?.id;
  return defaultId ? itemFolders.value.includes(defaultId) : false;
});

// Track which lists contain this problem
const selectedListIds = computed(() =>
  userLists.value.filter((list) => list.containsProblem).map((list) => list.id),
);

// Combined state: is saved if in any folder or any list
const isSaved = computed(
  () => itemFolders.value.length > 0 || selectedListIds.value.length > 0,
);

async function loadData() {
  if (!isOpen.value) return;

  isAuthed.value = isAuthenticated();
  if (!isAuthed.value) {
    itemFolders.value = [];
    userLists.value = [];
    isLoading.value = false;
    return;
  }

  const userId = fetchCurrentUserId();
  if (!userId) {
    itemFolders.value = [];
    userLists.value = [];
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  try {
    // Load bookmark folders in parallel
    await bookmarkStore.loadFolders();
    const [folders, lists] = await Promise.all([
      getBookmarkFolders(props.targetType, props.problemId.toString()),
      getUserListsForProblem(userId, props.problemId),
    ]);

    itemFolders.value = folders;
    userLists.value = lists;
  } catch (error) {
    console.error("Failed to load data:", error);
    toast.error("Failed to load save options");
  } finally {
    isLoading.value = false;
  }
}

async function toggleFolder(folderId: string) {
  if (!isAuthenticated()) {
    toast.error("Please log in to save");
    return;
  }

  const isInFolder = itemFolders.value.includes(folderId);

  try {
    if (isInFolder) {
      await removeBookmarkByTarget(
        folderId,
        props.targetType,
        props.problemId.toString(),
      );
      itemFolders.value = itemFolders.value.filter((id) => id !== folderId);
      bookmarkStore.updateItemCount(folderId, -1);
    } else {
      await addBookmark(folderId, {
        targetId: props.problemId.toString(),
        targetType: props.targetType,
      });
      itemFolders.value.push(folderId);
      bookmarkStore.updateItemCount(folderId, 1);
    }

    emitChange();
  } catch (error) {
    console.error("Failed to toggle bookmark folder:", error);
    toast.error("Failed to update bookmark");
  }
}

async function toggleList(listId: string) {
  if (!isAuthenticated()) {
    toast.error("Please log in to save");
    return;
  }

  const userId = fetchCurrentUserId();
  if (!userId) return;

  const list = userLists.value.find((l) => l.id === listId);
  if (!list) return;

  const isInList = list.containsProblem;

  try {
    if (isInList) {
      await batchRemoveProblemFromLists(userId, props.problemId, [listId]);
      list.containsProblem = false;
      toast.success(`Removed from "${list.name}"`);
    } else {
      await batchAddProblemToLists(userId, props.problemId, [listId]);
      list.containsProblem = true;
      toast.success(`Added to "${list.name}"`);
    }

    emitChange();
  } catch (error) {
    console.error("Failed to toggle list:", error);
    toast.error("Failed to update problem list");
  }
}

function emitChange() {
  emit("change", isFavorited.value, itemFolders.value, selectedListIds.value);
}

function handleOpenChange(open: boolean) {
  isOpen.value = open;
  if (open) {
    loadData();
  }
}

function openCreateDialog() {
  showCreateDialog.value = true;
  newListName.value = "";
}

async function handleCreateList() {
  if (!newListName.value.trim()) {
    toast.error("Please enter a list name");
    return;
  }

  const userId = fetchCurrentUserId();
  if (!userId) return;

  isCreating.value = true;
  try {
    const newList = await createProblemList(userId, {
      name: newListName.value.trim(),
      isPublic: false,
    });

    // Add the problem to the newly created list
    await batchAddProblemToLists(userId, props.problemId, [newList.id]);

    // Reload the lists
    await loadData();

    toast.success(`Created "${newList.name}" and added problem`);
    showCreateDialog.value = false;
    emitChange();
  } catch (error) {
    console.error("Failed to create list:", error);
    toast.error("Failed to create problem list");
  } finally {
    isCreating.value = false;
  }
}

watch(
  () => props.problemId,
  () => {
    itemFolders.value = [];
    userLists.value = [];
  },
);
</script>

<template>
  <div>
    <DropdownMenu @update:open="handleOpenChange">
      <DropdownMenuTrigger as-child>
        <ActionItem
          :icon="isSaved ? BookmarkCheck : Bookmark"
          :count="count"
          label="Save"
          :active="isSaved"
          class="cursor-pointer"
          :class="{ 'fill-primary/20': isSaved }"
          aria-label="Save problem"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-72" align="end">
        <DropdownMenuLabel>Save problem</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <template v-if="isLoading">
          <div class="flex items-center justify-center py-4">
            <Loader2 class="h-4 w-4 animate-spin" />
          </div>
        </template>
        <template v-else-if="!isAuthed">
          <div class="px-3 py-2 text-sm text-muted-foreground">
            Please log in to save problems.
          </div>
        </template>
        <template v-else>
          <!-- Bookmark Folders Section -->
          <div v-if="bookmarkStore.defaultFolder">
            <DropdownMenuLabel class="text-xs text-muted-foreground px-2 py-1">
              Quick save
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              :checked="isFavorited"
              @select.prevent="toggleFolder(bookmarkStore.defaultFolder.id)"
              :class="{
                'bg-primary/10 border-l-2 border-primary': isFavorited,
              }"
              class="transition-colors"
            >
              <span class="flex items-center gap-2 flex-1">
                <Bookmark class="h-4 w-4" />
                <span
                  :class="{
                    'font-semibold text-primary': isFavorited,
                  }"
                >
                  {{ bookmarkStore.defaultFolder.name }}
                </span>
                <Check
                  v-if="isFavorited"
                  class="h-3 w-3 text-primary ml-auto"
                />
              </span>
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator
              v-if="
                bookmarkStore.customFolders.length > 0 || userLists.length > 0
              "
            />
          </div>

          <!-- Custom Folders -->
          <div v-if="bookmarkStore.customFolders.length > 0">
            <DropdownMenuLabel class="text-xs text-muted-foreground px-2 py-1">
              Folders
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              v-for="folder in bookmarkStore.customFolders"
              :key="folder.id"
              :checked="itemFolders.includes(folder.id)"
              @select.prevent="toggleFolder(folder.id)"
              :class="{
                'bg-primary/10 border-l-2 border-primary': itemFolders.includes(
                  folder.id,
                ),
              }"
            >
              <span class="flex items-center gap-2 flex-1">
                <span
                  :class="{
                    'font-semibold text-primary': itemFolders.includes(
                      folder.id,
                    ),
                  }"
                  >{{ folder.name }}</span
                >
                <Check
                  v-if="itemFolders.includes(folder.id)"
                  class="h-3 w-3 text-primary ml-auto"
                />
              </span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator v-if="userLists.length > 0" />
          </div>

          <!-- Problem Lists Section -->
          <div v-if="userLists.length > 0">
            <DropdownMenuLabel class="text-xs text-muted-foreground px-2 py-1">
              Problem lists
            </DropdownMenuLabel>
            <div class="max-h-[200px] overflow-y-auto">
              <DropdownMenuCheckboxItem
                v-for="list in userLists"
                :key="list.id"
                :checked="list.containsProblem"
                @select.prevent="toggleList(list.id)"
                :class="{
                  'bg-primary/10 border-l-2 border-primary':
                    list.containsProblem,
                }"
                class="flex items-start gap-2 py-2 transition-colors"
              >
                <div class="flex flex-col flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span
                      class="truncate"
                      :class="{
                        'font-semibold text-primary': list.containsProblem,
                        'font-medium': !list.containsProblem,
                      }"
                      >{{ list.name }}</span
                    >
                    <Check
                      v-if="list.containsProblem"
                      class="h-4 w-4 text-primary flex-shrink-0 ml-auto"
                    />
                  </div>
                  <div
                    class="flex items-center gap-2 text-xs"
                    :class="{
                      'text-primary/70': list.containsProblem,
                      'text-muted-foreground': !list.containsProblem,
                    }"
                  >
                    <span>{{ list.problemCount }} problems</span>
                    <span>•</span>
                    <span>{{ list.favoritesCount }} saves</span>
                  </div>
                </div>
              </DropdownMenuCheckboxItem>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="
              bookmarkStore.customFolders.length === 0 &&
              userLists.length === 0 &&
              !bookmarkStore.defaultFolder
            "
            class="px-3 py-4 text-sm text-muted-foreground text-center"
          >
            <p class="mb-2">No folders or lists yet.</p>
            <p class="text-xs">Create a problem list to get started!</p>
          </div>

          <DropdownMenuSeparator />

          <!-- Actions -->
          <DropdownMenuItem class="cursor-pointer" @select="openCreateDialog">
            <FolderPlus class="mr-2 h-4 w-4" />
            Create problem list
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenu>

    <!-- Create List Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new problem list</DialogTitle>
          <DialogDescription>
            Create a new problem list and add this problem to it.
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label for="list-name">List name</Label>
            <Input
              id="list-name"
              v-model="newListName"
              placeholder="e.g., Dynamic Programming Practice"
              @keyup.enter="handleCreateList"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            @click="showCreateDialog = false"
            :disabled="isCreating"
          >
            Cancel
          </Button>
          <Button @click="handleCreateList" :disabled="isCreating">
            <Loader2 v-if="isCreating" class="mr-2 h-4 w-4 animate-spin" />
            Create & add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
