<script setup lang="ts">
import { computed } from "vue";
import {
  Bookmark,
  Folder,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { BookmarkFolder } from "@/types/bookmark";

const props = defineProps<{
  folders: BookmarkFolder[];
  selectedId?: string;
}>();

const emit = defineEmits<{
  select: [folder: BookmarkFolder];
  edit: [folder: BookmarkFolder];
  delete: [folder: BookmarkFolder];
}>();

const sortedFolders = computed(() => {
  return [...props.folders].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return a.sortOrder - b.sortOrder;
  });
});
</script>

<template>
  <div class="space-y-1">
    <div
      v-for="folder in sortedFolders"
      :key="folder.id"
      class="group flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted cursor-pointer"
      :class="{ 'bg-muted': selectedId === folder.id }"
      @click="emit('select', folder)"
    >
      <div class="flex items-center gap-3 min-w-0">
        <component
          :is="folder.isDefault ? Bookmark : Folder"
          class="h-4 w-4 flex-shrink-0"
          :class="
            folder.color ? `text-${folder.color}-500` : 'text-muted-foreground'
          "
        />
        <div class="min-w-0">
          <p class="text-sm font-medium truncate">
            {{ folder.name }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ folder.itemCount }} items
          </p>
        </div>
      </div>

      <DropdownMenu v-if="!folder.isDefault">
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 opacity-0 group-hover:opacity-100"
            @click.stop
          >
            <MoreHorizontal class="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @select="emit('edit', folder)">
            <Pencil class="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            class="text-destructive"
            @select="emit('delete', folder)"
          >
            <Trash2 class="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div
      v-if="folders.length === 0"
      class="py-8 text-center text-muted-foreground text-sm"
    >
      No bookmark folders yet
    </div>
  </div>
</template>
