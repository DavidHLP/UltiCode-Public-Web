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
import type { Collection } from "@/types/collection";

const props = defineProps<{
  collections: Collection[];
  selectedId?: string;
}>();

const emit = defineEmits<{
  select: [collection: Collection];
  edit: [collection: Collection];
  delete: [collection: Collection];
}>();

const sortedCollections = computed(() => {
  return [...props.collections].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return a.sortOrder - b.sortOrder;
  });
});
</script>

<template>
  <div class="space-y-1">
    <div
      v-for="collection in sortedCollections"
      :key="collection.id"
      class="group flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted cursor-pointer"
      :class="{ 'bg-muted': selectedId === collection.id }"
      @click="emit('select', collection)"
    >
      <div class="flex items-center gap-3 min-w-0">
        <component
          :is="collection.isDefault ? Bookmark : Folder"
          class="h-4 w-4 flex-shrink-0"
          :class="
            collection.color
              ? `text-${collection.color}-500`
              : 'text-muted-foreground'
          "
        />
        <div class="min-w-0">
          <p class="text-sm font-medium truncate">
            {{ collection.name }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ collection.itemCount }} items
          </p>
        </div>
      </div>

      <DropdownMenu v-if="!collection.isDefault">
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
          <DropdownMenuItem @select="emit('edit', collection)">
            <Pencil class="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            class="text-destructive"
            @select="emit('delete', collection)"
          >
            <Trash2 class="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div
      v-if="collections.length === 0"
      class="py-8 text-center text-muted-foreground text-sm"
    >
      No collections yet
    </div>
  </div>
</template>
