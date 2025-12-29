<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import {
  Plus,
  Loader2,
  Trash2,
  MessageSquare,
  FileText,
  List,
  CheckCircle2,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BookmarkFolderList from "@/components/bookmark/BookmarkFolderList.vue";
import CreateFolderDialog from "@/components/bookmark/CreateFolderDialog.vue";
import { useBookmarkStore } from "@/stores/bookmark";
import { fetchFolder, removeBookmark } from "@/api/bookmark";
import { BookmarkType } from "@/api/bookmark";
import type {
  BookmarkFolder,
  BookmarkFolderWithItems,
  CreateFolderInput,
  UpdateFolderInput,
  Bookmark,
} from "@/types/bookmark";
import { toast } from "vue-sonner";
import { RouterLink } from "vue-router";

// Interfaces for metadata
interface ProblemMetadata {
  slug: string;
  difficulty: string;
}

interface SolutionMetadata {
  problemSlug: string;
  problemTitle: string;
  authorName: string;
}

interface ForumMetadata {
  communityName: string;
  communitySlug: string;
  authorName: string;
  authorAvatar: string;
}

const store = useBookmarkStore();

const selectedFolderId = ref<string | null>(null);
const selectedFolderDetails = ref<BookmarkFolderWithItems | null>(null);
const isLoadingDetails = ref(false);

const showCreateDialog = ref(false);
const editingFolder = ref<BookmarkFolder | null>(null);
const showDeleteDialog = ref(false);
const deletingFolder = ref<BookmarkFolder | null>(null);

// Computed
const selectedFolder = computed(() =>
  store.folders.find((f) => f.id === selectedFolderId.value),
);

// Methods
async function loadFolderDetails(id: string) {
  isLoadingDetails.value = true;
  try {
    selectedFolderDetails.value = await fetchFolder(id);
  } catch (error) {
    console.error("Failed to load folder details:", error);
    toast.error("Failed to load folder");
  } finally {
    isLoadingDetails.value = false;
  }
}

function handleSelectFolder(folder: BookmarkFolder) {
  if (selectedFolderId.value === folder.id) return;
  selectedFolderId.value = folder.id;
  loadFolderDetails(folder.id);
}

// Auto-select first folder if none selected
watch(
  () => store.folders,
  (folders) => {
    if (folders.length > 0 && !selectedFolderId.value) {
      const firstFolder = folders[0];
      if (firstFolder) {
        handleSelectFolder(firstFolder);
      }
    }
  },
  { immediate: true },
);

function handleEditFolder(folder: BookmarkFolder) {
  editingFolder.value = folder;
  showCreateDialog.value = true;
}

function handleDeleteFolder(folder: BookmarkFolder) {
  deletingFolder.value = folder;
  showDeleteDialog.value = true;
}

async function handleCreateFolder(data: CreateFolderInput) {
  try {
    const newFolder = await store.createFolder(data);
    toast.success("Folder created");
    handleSelectFolder(newFolder);
  } catch (error) {
    console.error("Failed to create folder:", error);
    toast.error("Failed to create folder");
  }
}

async function handleUpdateFolder(id: string, data: UpdateFolderInput) {
  try {
    await store.updateFolder(id, data);
    toast.success("Folder updated");
    if (selectedFolderId.value === id) {
      loadFolderDetails(id);
    }
  } catch (error) {
    console.error("Failed to update folder:", error);
    toast.error("Failed to update folder");
  }
}

async function confirmDelete() {
  if (!deletingFolder.value) return;

  try {
    await store.removeFolder(deletingFolder.value.id);
    toast.success("Folder deleted");
    if (selectedFolderId.value === deletingFolder.value.id) {
      selectedFolderId.value = null;
      selectedFolderDetails.value = null;
    }
  } catch (error) {
    console.error("Failed to delete folder:", error);
    toast.error("Failed to delete folder");
  } finally {
    showDeleteDialog.value = false;
    deletingFolder.value = null;
  }
}

async function handleRemoveItem(bookmarkId: string) {
  if (!selectedFolderId.value) return;
  try {
    await removeBookmark(selectedFolderId.value, bookmarkId);
    toast.success("Removed from collection");
    // Refresh
    loadFolderDetails(selectedFolderId.value);
    // Optionally refresh folder list count
    store.loadFolders();
  } catch (error) {
    console.error("Failed to remove item", error);
    toast.error("Failed to remove item");
  }
}

function handleDialogClose() {
  showCreateDialog.value = false;
  editingFolder.value = null;
}

// Helpers for item display
function getItemIcon(type: BookmarkType) {
  switch (type) {
    case BookmarkType.FORUM_POST:
      return MessageSquare;
    case BookmarkType.PROBLEM:
      return FileText;
    case BookmarkType.PROBLEM_LIST:
      return List;
    case BookmarkType.SOLUTION:
      return CheckCircle2;
    default:
      return FileText;
  }
}

function getItemUrl(item: Bookmark) {
  switch (item.targetType) {
    case BookmarkType.FORUM_POST:
      return { name: "forum-thread", params: { postId: item.targetId } };
    case BookmarkType.PROBLEM: {
      const meta = item.metadata as unknown as ProblemMetadata;
      return {
        name: "problem-detail",
        params: { slug: meta?.slug || item.targetId },
      };
    }
    case BookmarkType.PROBLEM_LIST:
      return { name: "problem-list-detail", params: { id: item.targetId } };
    case BookmarkType.SOLUTION: {
      const meta = item.metadata as unknown as SolutionMetadata;
      if (meta?.problemSlug) {
        return {
          name: "problem-detail",
          params: { slug: meta.problemSlug },
          query: { solutionId: item.targetId },
        };
      }
      return "#";
    }
    default:
      return "#";
  }
}

function getForumMetadata(item: Bookmark): ForumMetadata | undefined {
  return item.metadata as unknown as ForumMetadata;
}

onMounted(() => {
  store.loadFolders(true);
});
</script>

<template>
  <div class="container mx-auto py-6 max-w-7xl">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      <!-- Sidebar (Folders) -->
      <Card class="lg:col-span-1 h-fit sticky top-6">
        <CardHeader class="pb-3 border-b">
          <div class="flex items-center justify-between">
            <CardTitle class="text-lg font-semibold">Collections</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              class="h-8 w-8"
              @click="showCreateDialog = true"
            >
              <Plus class="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent class="pt-4">
          <div v-if="store.isLoading" class="flex justify-center py-8">
            <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
          <BookmarkFolderList
            v-else
            :folders="store.folders"
            :selected-id="selectedFolderId ?? undefined"
            @select="handleSelectFolder"
            @edit="handleEditFolder"
            @delete="handleDeleteFolder"
          />
        </CardContent>
      </Card>

      <!-- Main Content (Items) -->
      <div class="lg:col-span-3 space-y-6">
        <Card>
          <CardHeader class="pb-3 border-b bg-muted/20">
            <div class="flex justify-between items-start">
              <div>
                <CardTitle class="text-xl">
                  {{ selectedFolder?.name ?? "Select a collection" }}
                </CardTitle>
                <p
                  v-if="selectedFolder?.description"
                  class="text-sm text-muted-foreground mt-1"
                >
                  {{ selectedFolder.description }}
                </p>
              </div>
              <Badge variant="outline" class="ml-2">
                {{ selectedFolderDetails?.items.length ?? 0 }} Items
              </Badge>
            </div>
          </CardHeader>

          <CardContent class="p-0">
            <div v-if="isLoadingDetails" class="flex justify-center py-12">
              <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
            </div>

            <div
              v-else-if="!selectedFolderDetails"
              class="py-12 text-center text-muted-foreground"
            >
              Select a collection to view its contents
            </div>

            <div
              v-else-if="selectedFolderDetails.items.length === 0"
              class="flex flex-col items-center justify-center py-16 text-muted-foreground"
            >
              <div class="p-4 rounded-full bg-muted mb-3">
                <FileText class="h-8 w-8 opacity-50" />
              </div>
              <p>This collection is empty</p>
              <p class="text-xs mt-1">Go exploring and save some items here!</p>
            </div>

            <div v-else class="divide-y">
              <div
                v-for="item in selectedFolderDetails.items"
                :key="item.id"
                class="group flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors"
              >
                <!-- Icon -->
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground"
                >
                  <component
                    :is="getItemIcon(item.targetType)"
                    class="h-5 w-5"
                  />
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0 space-y-1">
                  <div class="flex items-start justify-between gap-4">
                    <RouterLink
                      :to="getItemUrl(item)"
                      class="text-base font-medium hover:underline decoration-2 decoration-transparent hover:decoration-current transition-all line-clamp-1"
                    >
                      {{ item.title ?? `Item ${item.targetId}` }}
                    </RouterLink>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-2"
                      @click="handleRemoveItem(item.id)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>

                  <!-- Metadata -->
                  <div
                    class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
                  >
                    <span class="capitalize">{{
                      item.targetType.toLowerCase().replace("_", " ")
                    }}</span>

                    <template v-if="item.metadata">
                      <span>•</span>
                      <div
                        v-if="getForumMetadata(item)?.communityName"
                        class="flex items-center gap-1"
                      >
                        r/{{ getForumMetadata(item)?.communityName }}
                      </div>
                      <div
                        v-if="getForumMetadata(item)?.authorName"
                        class="flex items-center gap-1"
                      >
                        <span>•</span>
                        <span>by {{ getForumMetadata(item)?.authorName }}</span>
                      </div>
                    </template>
                  </div>

                  <p
                    v-if="item.note"
                    class="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded-md italic border border-border/50"
                  >
                    "{{ item.note }}"
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <CreateFolderDialog
      :open="showCreateDialog"
      :folder="editingFolder"
      @update:open="handleDialogClose"
      @create="handleCreateFolder"
      @update="handleUpdateFolder"
    />

    <!-- Delete Confirmation Dialog -->
    <AlertDialog
      :open="showDeleteDialog"
      @update:open="showDeleteDialog = $event"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Collection</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{{ deletingFolder?.name }}"? This
            action cannot be undone and all bookmarks inside will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteDialog = false">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="confirmDelete"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
