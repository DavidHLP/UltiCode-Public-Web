<template>
  <form @submit.prevent="submit" class="w-full">
    <div
      class="rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden"
    >
      <Textarea
        v-model="content"
        placeholder="What are your thoughts?"
        class="min-h-[60px] w-full resize-none border-0 bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <div class="flex items-center justify-between p-2 bg-muted/20 border-t">
        <div class="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            class="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ImageIcon class="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            class="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Type class="h-4 w-4" />
          </Button>
        </div>
        <div class="flex items-center gap-2">
          <Button
            v-if="onCancel"
            type="button"
            variant="ghost"
            size="sm"
            class="rounded-full px-4 h-8 bg-muted hover:bg-muted/80 text-foreground"
            @click="onCancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            class="rounded-full px-4 h-8"
            :disabled="!content.trim()"
          >
            Comment
          </Button>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Type } from "lucide-vue-next";

defineOptions({
  name: "CommentComposer",
});

const props = defineProps<{
  parentId?: number | string;
  onCancel?: () => void;
}>();

const emit = defineEmits<{
  (e: "submit", content: string, parentId?: number | string): void;
}>();

const content = ref("");

const submit = () => {
  if (!content.value.trim()) return;
  emit("submit", content.value, props.parentId);
  content.value = "";
};
</script>
