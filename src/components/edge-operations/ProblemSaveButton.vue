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
import { useCollectionStore } from "@/stores/collection";
import {
  addItemToCollection,
  removeItemByTarget,
  getItemCollections,
} from "@/api/collection";
import {
  getUserListsForProblem,
  batchAddProblemToLists,
  batchRemoveProblemFromLists,
  createProblemList,
  type ProblemListWithStatus,
} from "@/api/problem-list";
import type { CollectionTargetType } from "@/types/collection";
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
  targetType: CollectionTargetType;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "icon";
}>();

const emit = defineEmits<{
  change: [isFavorite: boolean, collections: string[], listIds: string[]];
}>();

const collectionStore = useCollectionStore();

// Collection state
const itemCollections = ref<string[]>([]);

// Problem list state
const userLists = ref<ProblemListWithStatus[]>([]);

const isLoading = ref(false);
const isOpen = ref(false);
const isAuthed = ref(false);
const showCreateDialog = ref(false);
const newListName = ref("");
const isCreating = ref(false);

// Check if problem is in default collection (favorited)
const isFavorited = computed(() => {
  const defaultId = collectionStore.defaultCollection?.id;
  return defaultId ? itemCollections.value.includes(defaultId) : false;
});

// Track which lists contain this problem
const selectedListIds = computed(() =>
  userLists.value.filter((list) => list.containsProblem).map((list) => list.id),
);

// Combined state: is saved if in any collection or any list
const isSaved = computed(
  () => itemCollections.value.length > 0 || selectedListIds.value.length > 0,
);

async function loadData() {
  if (!isOpen.value) return;

  isAuthed.value = isAuthenticated();
  if (!isAuthed.value) {
    itemCollections.value = [];
    userLists.value = [];
    isLoading.value = false;
    return;
  }

  const userId = fetchCurrentUserId();
  if (!userId) {
    itemCollections.value = [];
    userLists.value = [];
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  try {
    // Load collections in parallel
    await collectionStore.loadCollections();
    const [collections, lists] = await Promise.all([
      getItemCollections(props.targetType, props.problemId.toString()),
      getUserListsForProblem(userId, props.problemId),
    ]);

    itemCollections.value = collections;
    userLists.value = lists;
  } catch (error) {
    console.error("Failed to load data:", error);
    toast.error("Failed to load save options");
  } finally {
    isLoading.value = false;
  }
}

async function toggleCollection(collectionId: string) {
  if (!isAuthenticated()) {
    toast.error("Please log in to save");
    return;
  }

  const isInCollection = itemCollections.value.includes(collectionId);

  try {
    if (isInCollection) {
      await removeItemByTarget(
        collectionId,
        props.targetType,
        props.problemId.toString(),
      );
      itemCollections.value = itemCollections.value.filter(
        (id) => id !== collectionId,
      );
      collectionStore.updateItemCount(collectionId, -1);
    } else {
      await addItemToCollection(collectionId, {
        targetId: props.problemId.toString(),
        targetType: props.targetType,
      });
      itemCollections.value.push(collectionId);
      collectionStore.updateItemCount(collectionId, 1);
    }

    emitChange();
  } catch (error) {
    console.error("Failed to toggle collection:", error);
    toast.error("Failed to update collection");
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
  emit("change", isFavorited.value, itemCollections.value, selectedListIds.value);
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
    itemCollections.value = [];
    userLists.value = [];
  },
);
</script>

<template>
  <div>
    <DropdownMenu @update:open="handleOpenChange">
      <DropdownMenuTrigger as-child>
        <Button
          :variant="variant ?? 'ghost'"
          :size="size ?? 'icon'"
          class="relative"
          aria-label="Save problem"
        >
          <component
            :is="isSaved ? BookmarkCheck : Bookmark"
            class="h-4 w-4"
            :class="{ 'text-primary': isSaved }"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-72" align="end">
        <DropdownMenuLabel>Save Problem</DropdownMenuLabel>
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
          <!-- Collections Section -->
          <div v-if="collectionStore.defaultCollection">
            <DropdownMenuLabel class="text-xs text-muted-foreground px-2 py-1">
              Quick Save
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              :checked="isFavorited"
              @select.prevent="
                toggleCollection(collectionStore.defaultCollection.id)
              "
            >
              <span class="flex items-center gap-2">
                <Bookmark class="h-4 w-4" />
                {{ collectionStore.defaultCollection.name }}
              </span>
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator
              v-if="
                collectionStore.customCollections.length > 0 ||
                userLists.length > 0
              "
            />
          </div>

          <!-- Custom Collections -->
          <div v-if="collectionStore.customCollections.length > 0">
            <DropdownMenuLabel class="text-xs text-muted-foreground px-2 py-1">
              Collections
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              v-for="collection in collectionStore.customCollections"
              :key="collection.id"
              :checked="itemCollections.includes(collection.id)"
              @select.prevent="toggleCollection(collection.id)"
            >
              {{ collection.name }}
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator v-if="userLists.length > 0" />
          </div>

          <!-- Problem Lists Section -->
          <div v-if="userLists.length > 0">
            <DropdownMenuLabel class="text-xs text-muted-foreground px-2 py-1">
              Problem Lists
            </DropdownMenuLabel>
            <div class="max-h-[200px] overflow-y-auto">
              <DropdownMenuCheckboxItem
                v-for="list in userLists"
                :key="list.id"
                :checked="list.containsProblem"
                @select.prevent="toggleList(list.id)"
                class="flex items-start gap-2 py-2"
              >
                <div class="flex flex-col flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-medium truncate">{{ list.name }}</span>
                    <Check
                      v-if="list.containsProblem"
                      class="h-3 w-3 text-primary flex-shrink-0"
                    />
                  </div>
                  <div
                    class="flex items-center gap-2 text-xs text-muted-foreground"
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
              collectionStore.customCollections.length === 0 &&
              userLists.length === 0 &&
              !collectionStore.defaultCollection
            "
            class="px-3 py-4 text-sm text-muted-foreground text-center"
          >
            <p class="mb-2">No collections or lists yet.</p>
            <p class="text-xs">Create a problem list to get started!</p>
          </div>

          <DropdownMenuSeparator />

          <!-- Actions -->
          <DropdownMenuItem class="cursor-pointer" @select="openCreateDialog">
            <FolderPlus class="mr-2 h-4 w-4" />
            Create Problem List
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenu>

    <!-- Create List Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Problem List</DialogTitle>
          <DialogDescription>
            Create a new problem list and add this problem to it.
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label for="list-name">List Name</Label>
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
            Create & Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
