<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Bookmark, BookmarkCheck, FolderPlus, Loader2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useBookmarkStore } from "@/stores/bookmark";
import {
  addBookmark,
  removeBookmarkByTarget,
  getBookmarkFolders,
} from "@/api/bookmark";
import type { BookmarkType } from "@/types/bookmark";
import { toast } from "vue-sonner";
import { isAuthenticated } from "@/utils/auth";

const props = defineProps<{
  targetType: BookmarkType;
  targetId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "icon";
}>();

const emit = defineEmits<{
  change: [isFavorite: boolean, folders: string[]];
  "create-folder": [];
}>();
const store = useBookmarkStore();

const itemFolders = ref<string[]>([]);
const isLoading = ref(false);
const isOpen = ref(false);
const isAuthed = ref(false);

const isFavorited = computed(() => {
  const defaultId = store.defaultFolder?.id;
  return defaultId ? itemFolders.value.includes(defaultId) : false;
});

async function loadData() {
  if (!isOpen.value) return;

  isAuthed.value = isAuthenticated();
  if (!isAuthed.value) {
    itemFolders.value = [];
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  try {
    await store.loadFolders();
    itemFolders.value = await getBookmarkFolders(
      props.targetType,
      props.targetId,
    );
  } catch (error) {
    console.error("Failed to load bookmark folders:", error);
  } finally {
    isLoading.value = false;
  }
}

async function toggleFolder(folderId: string) {
  if (!isAuthenticated()) {
    toast.error("Please log in to manage bookmarks");
    return;
  }

  const isInFolder = itemFolders.value.includes(folderId);

  try {
    if (isInFolder) {
      await removeBookmarkByTarget(folderId, props.targetType, props.targetId);
      itemFolders.value = itemFolders.value.filter((id) => id !== folderId);
      store.updateItemCount(folderId, -1);
    } else {
      await addBookmark(folderId, {
        targetId: props.targetId,
        targetType: props.targetType,
      });
      itemFolders.value.push(folderId);
      store.updateItemCount(folderId, 1);
    }

    emit("change", isFavorited.value, itemFolders.value);
  } catch (error) {
    console.error("Failed to toggle bookmark:", error);
    toast.error("Failed to update bookmark");
  }
}

function handleOpenChange(open: boolean) {
  isOpen.value = open;
  if (open) {
    loadData();
  }
}

watch(
  () => props.targetId,
  () => {
    itemFolders.value = [];
  },
);
</script>

<template>
  <DropdownMenu @update:open="handleOpenChange">
    <DropdownMenuTrigger as-child>
      <Button
        :variant="variant ?? 'ghost'"
        :size="size ?? 'icon'"
        class="relative"
      >
        <component
          :is="isFavorited ? BookmarkCheck : Bookmark"
          class="h-4 w-4"
          :class="{ 'text-primary': isFavorited }"
        />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-56" align="end">
      <template v-if="isLoading">
        <div class="flex items-center justify-center py-4">
          <Loader2 class="h-4 w-4 animate-spin" />
        </div>
      </template>
      <template v-else-if="!isAuthed">
        <div class="px-3 py-2 text-sm text-muted-foreground">
          Please log in to manage bookmarks.
        </div>
      </template>
      <template v-else>
        <!-- Default Folder -->
        <DropdownMenuCheckboxItem
          v-if="store.defaultFolder"
          :checked="isFavorited"
          @select.prevent="toggleFolder(store.defaultFolder.id)"
        >
          <span class="flex items-center gap-2">
            <Bookmark class="h-4 w-4" />
            {{ store.defaultFolder.name }}
          </span>
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator v-if="store.customFolders.length > 0" />

        <!-- Custom Folders -->
        <DropdownMenuCheckboxItem
          v-for="folder in store.customFolders"
          :key="folder.id"
          :checked="itemFolders.includes(folder.id)"
          @select.prevent="toggleFolder(folder.id)"
        >
          {{ folder.name }}
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          class="cursor-pointer"
          @select="emit('create-folder')"
        >
          <FolderPlus class="mr-2 h-4 w-4" />
          Create Folder
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
