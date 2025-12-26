<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-vue-next";
import type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/types/collection";

const props = defineProps<{
  open: boolean;
  collection?: Collection | null;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  create: [data: CreateCollectionInput];
  update: [id: string, data: UpdateCollectionInput];
}>();

const name = ref("");
const description = ref("");
const isSubmitting = ref(false);

const isEdit = computed(() => !!props.collection);
const title = computed(() =>
  isEdit.value ? "Edit Collection" : "Create Collection",
);

watch(
  () => props.open,
  (open) => {
    if (open && props.collection) {
      name.value = props.collection.name;
      description.value = props.collection.description ?? "";
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
    if (isEdit.value && props.collection) {
      emit("update", props.collection.id, {
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
              ? "Update your collection details."
              : "Create a new collection to organize your favorite problems."
          }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="name">Name</Label>
          <Input
            id="name"
            v-model="name"
            placeholder="My Collection"
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
