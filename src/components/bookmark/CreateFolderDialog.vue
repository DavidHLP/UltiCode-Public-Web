<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-vue-next";
import type {
  BookmarkFolder,
  CreateFolderInput,
  UpdateFolderInput,
} from "@/types/bookmark";

const props = defineProps<{
  open: boolean;
  folder?: BookmarkFolder | null;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  create: [data: CreateFolderInput];
  update: [id: string, data: UpdateFolderInput];
}>();

const name = ref("");
const description = ref("");
const isSubmitting = ref(false);

const isEdit = computed(() => !!props.folder);
const title = computed(() => (isEdit.value ? "Edit Folder" : "Create Folder"));

watch(
  () => props.open,
  (open) => {
    if (open && props.folder) {
      name.value = props.folder.name;
      description.value = props.folder.description ?? "";
    } else if (open) {
      name.value = "";
      description.value = "";
    }
  },
);

async function handleSubmit() {
  if (!name.value.trim()) return;

  isSubmitting.value = true;
  try {
    if (isEdit.value && props.folder) {
      emit("update", props.folder.id, {
        name: name.value.trim(),
        description: description.value.trim() || undefined,
      });
    } else {
      emit("create", {
        name: name.value.trim(),
        description: description.value.trim() || undefined,
      });
    }
    emit("update:open", false);
  } finally {
    isSubmitting.value = false;
  }
}

function handleClose() {
  emit("update:open", false);
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>
          {{
            isEdit
              ? "Update your bookmark folder details."
              : "Create a new folder to organize your bookmarks."
          }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="name">Name</Label>
          <Input
            id="name"
            v-model="name"
            placeholder="My Folder"
            :disabled="isSubmitting"
          />
        </div>

        <div class="space-y-2">
          <Label for="description">Description (optional)</Label>
          <Textarea
            id="description"
            v-model="description"
            placeholder="A brief description..."
            :disabled="isSubmitting"
            rows="3"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="handleClose">
            Cancel
          </Button>
          <Button type="submit" :disabled="!name.trim() || isSubmitting">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ isEdit ? "Save" : "Create" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
