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
import { useCollectionStore } from "@/stores/collection";
import {
  addItemToCollection,
  removeItemByTarget,
  getItemCollections,
} from "@/api/collection";
import type { CollectionTargetType } from "@/types/collection";
import { toast } from "vue-sonner";
import { isAuthenticated } from "@/utils/auth";

const props = defineProps<{
  targetType: CollectionTargetType;
  targetId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "icon";
}>();

const emit = defineEmits<{
  change: [isFavorite: boolean, collections: string[]];
  "create-collection": [];
}>();
const store = useCollectionStore();

const itemCollections = ref<string[]>([]);
const isLoading = ref(false);
const isOpen = ref(false);
const isAuthed = ref(false);

const isFavorited = computed(() => {
  const defaultId = store.defaultCollection?.id;
  return defaultId ? itemCollections.value.includes(defaultId) : false;
});

async function loadData() {
  if (!isOpen.value) return;

  isAuthed.value = isAuthenticated();
  if (!isAuthed.value) {
    itemCollections.value = [];
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  try {
    await store.loadCollections();
    itemCollections.value = await getItemCollections(
      props.targetType,
      props.targetId,
    );
  } catch (error) {
    console.error("Failed to load collections:", error);
  } finally {
    isLoading.value = false;
  }
}

async function toggleCollection(collectionId: string) {
  if (!isAuthenticated()) {
    toast.error("Please log in to manage collections");
    return;
  }

  const isInCollection = itemCollections.value.includes(collectionId);

  try {
    if (isInCollection) {
      await removeItemByTarget(collectionId, props.targetType, props.targetId);
      itemCollections.value = itemCollections.value.filter(
        (id) => id !== collectionId,
      );
      store.updateItemCount(collectionId, -1);
    } else {
      await addItemToCollection(collectionId, {
        targetId: props.targetId,
        targetType: props.targetType,
      });
      itemCollections.value.push(collectionId);
      store.updateItemCount(collectionId, 1);
    }

    emit("change", isFavorited.value, itemCollections.value);
  } catch (error) {
    console.error("Failed to toggle collection:", error);
    toast.error("Failed to update collection");
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
    itemCollections.value = [];
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
          Please log in to manage collections.
        </div>
      </template>
      <template v-else>
        <!-- Default Collection -->
        <DropdownMenuCheckboxItem
          v-if="store.defaultCollection"
          :checked="isFavorited"
          @select.prevent="toggleCollection(store.defaultCollection.id)"
        >
          <span class="flex items-center gap-2">
            <Bookmark class="h-4 w-4" />
            {{ store.defaultCollection.name }}
          </span>
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator v-if="store.customCollections.length > 0" />

        <!-- Custom Collections -->
        <DropdownMenuCheckboxItem
          v-for="collection in store.customCollections"
          :key="collection.id"
          :checked="itemCollections.includes(collection.id)"
          @select.prevent="toggleCollection(collection.id)"
        >
          {{ collection.name }}
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          class="cursor-pointer"
          @select="emit('create-collection')"
        >
          <FolderPlus class="mr-2 h-4 w-4" />
          Create Collection
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
