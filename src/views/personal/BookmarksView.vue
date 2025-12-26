<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Plus, Loader2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { fetchFolder } from "@/api/bookmark";
import type {
  BookmarkFolder,
  BookmarkFolderWithItems,
  CreateFolderInput,
  UpdateFolderInput,
} from "@/types/bookmark";
import { toast } from "vue-sonner";

const store = useBookmarkStore();

const selectedFolderId = ref<string | null>(null);
const selectedFolderDetails = ref<BookmarkFolderWithItems | null>(null);
const isLoadingDetails = ref(false);

const showCreateDialog = ref(false);
const editingFolder = ref<BookmarkFolder | null>(null);
const showDeleteDialog = ref(false);
const deletingFolder = ref<BookmarkFolder | null>(null);

const selectedFolder = computed(() =>
  store.folders.find((f) => f.id === selectedFolderId.value),
);

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
  selectedFolderId.value = folder.id;
  loadFolderDetails(folder.id);
}

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

function handleDialogClose() {
  showCreateDialog.value = false;
  editingFolder.value = null;
}

onMounted(() => {
  store.loadFolders(true);
});
</script>

<template>
  <div class="container mx-auto py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">My Bookmarks</h1>
      <Button @click="showCreateDialog = true">
        <Plus class="mr-2 h-4 w-4" />
        New Folder
      </Button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Folder List -->
      <Card class="md:col-span-1">
        <CardHeader>
          <CardTitle class="text-lg">Folders</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="store.isLoading" class="flex justify-center py-8">
            <Loader2 class="h-6 w-6 animate-spin" />
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

      <!-- Folder Details -->
      <Card class="md:col-span-2">
        <CardHeader>
          <CardTitle class="text-lg">
            {{ selectedFolder?.name ?? "Select a folder" }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="isLoadingDetails" class="flex justify-center py-8">
            <Loader2 class="h-6 w-6 animate-spin" />
          </div>
          <div
            v-else-if="!selectedFolderDetails"
            class="py-8 text-center text-muted-foreground"
          >
            Select a folder to view its bookmarks
          </div>
          <div
            v-else-if="selectedFolderDetails.items.length === 0"
            class="py-8 text-center text-muted-foreground"
          >
            This folder is empty
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="bookmark in selectedFolderDetails.items"
              :key="bookmark.id"
              class="flex items-center justify-between p-3 rounded-md border"
            >
              <div>
                <p class="text-sm font-medium">{{ bookmark.targetType }}</p>
                <p class="text-xs text-muted-foreground">
                  ID: {{ bookmark.targetId }}
                </p>
                <p
                  v-if="bookmark.note"
                  class="text-xs text-muted-foreground mt-1"
                >
                  {{ bookmark.note }}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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
          <AlertDialogTitle>Delete Folder</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{{ deletingFolder?.name }}"? This
            action cannot be undone.
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
