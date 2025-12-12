<script setup lang="ts">
import type { SolutionFeedItem } from "@/types/solution";
import MarkdownView from "@/components/markdown/MarkdownView.vue";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Badge from "@/components/ui/badge/Badge.vue";
import { Separator } from "@/components/ui/separator";
import { Eye, MessageCircle, Triangle } from "lucide-vue-next";
import { computed } from "vue";
import "highlight.js/styles/atom-one-dark.css";

const props = defineProps<{
  item: SolutionFeedItem;
}>();

const authorInitial = computed(
  () => props.item.author.name.charAt(0)?.toUpperCase() ?? "?",
);

const topicLabel = computed(
  () =>
    props.item.topicName ||
    props.item.topicTranslated ||
    props.item.topic ||
    "topic",
);
</script>

<template>
  <article
    class="group flex flex-col gap-3 border-b border-border px-0 py-5 last:border-b-0"
  >
    <header class="flex items-start gap-3">
      <Avatar class="h-10 w-10 border border-border/50">
        <AvatarFallback
          class="text-xs font-semibold text-white"
          :style="{ backgroundColor: props.item.author.avatarColor }"
        >
          {{ authorInitial }}
        </AvatarFallback>
      </Avatar>

      <div class="flex flex-1 flex-col gap-1.5 text-sm leading-tight">
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-semibold text-foreground">
            {{ props.item.author.name }}
          </span>
          <span class="truncate text-muted-foreground">
            {{ props.item.author.role }}
          </span>
          <span class="text-xs text-muted-foreground">
            · {{ props.item.created_at }}
          </span>
          <Badge
            v-if="props.item.flair"
            variant="secondary"
            class="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-700 hover:bg-orange-100"
          >
            {{ props.item.flair }}
          </Badge>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            class="rounded-full px-2.5 py-0.5 text-[11px] capitalize"
          >
            {{ props.item.language }}
          </Badge>
          <Badge
            variant="secondary"
            class="rounded-full px-2.5 py-0.5 text-[11px] capitalize"
          >
            {{ topicLabel }}
          </Badge>
          <Badge
            v-for="badge in props.item.badges"
            :key="badge"
            variant="outline"
            class="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          >
            {{ badge }}
          </Badge>
        </div>
      </div>
    </header>

    <section class="space-y-4 text-sm leading-relaxed">
      <!-- Markdown 内容展示 -->
      <MarkdownView
        :content="props.item.content"
        :editor-id="`solution-${props.item.id}`"
      />

      <!-- 标签 -->
      <div v-if="props.item.tags.length" class="flex flex-wrap gap-2">
        <Badge
          v-for="tag in props.item.tags"
          :key="tag"
          variant="secondary"
          class="rounded-full px-3 py-1 text-xs"
        >
          {{ tag }}
        </Badge>
      </div>

      <Separator class="my-2" />

      <!-- 统计信息 -->
      <div class="flex flex-wrap gap-6 text-xs text-muted-foreground">
        <div class="flex items-center gap-1.5 font-semibold text-foreground">
          <Triangle class="h-4 w-4 text-amber-500" />
          {{ props.item.stats.likes }}
        </div>
        <div class="flex items-center gap-1.5">
          <Eye class="h-4 w-4" />
          {{ props.item.stats.views }}
        </div>
        <div class="flex items-center gap-1.5">
          <MessageCircle class="h-4 w-4" />
          {{ props.item.stats.comments }}
        </div>
      </div>
    </section>
  </article>
</template>

<style scoped>
/* Typography & Layout matches DescriptionMarkdown.vue */
.group :deep(.prose) {
  font-size: 14px;
  line-height: 1.6;
  color: var(--foreground);
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  max-width: none; /* Override prose max-width */
}

/* Headings */
.group :deep(.prose h1) {
  font-size: 1.75rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  color: var(--foreground);
}

.group :deep(.prose h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--foreground);
}

.group :deep(.prose h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--foreground);
}

.group :deep(.prose h4) {
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: var(--foreground);
}

.group :deep(.prose p) {
  margin-bottom: 1em;
  margin-top: 0;
}

/* Lists */
.group :deep(.prose ul),
.group :deep(.prose ol) {
  padding-left: 1.25rem;
  margin-bottom: 1rem;
  margin-top: 0;
}

.group :deep(.prose ul) {
  list-style: disc;
}

.group :deep(.prose li) {
  margin-bottom: 0.25rem;
  margin-top: 0;
  padding-left: 0; /* Remove prose padding if any */
}

/* Inline Code - LeetCode Pill Style */
.group :deep(.prose :not(pre) > code) {
  font-family: "Menlo", "Monaco", "Consolas", "Courier New", monospace;
  font-size: 0.85em;
  background-color: var(--muted);
  color: var(--foreground);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  white-space: pre-wrap;
  word-break: break-word;
  font-weight: normal; /* Prose makes code bold by default sometimes */
}

/* Code Blocks */
.group :deep(.prose pre) {
  background-color: var(--muted); /* Fallback or match theme */
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
  color: inherit;
  font-size: 0.9em;
  line-height: 1.5;
}

.group :deep(.prose pre code) {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  font-weight: normal;
  color: inherit;
  font-family: "Menlo", "Monaco", "Consolas", "Courier New", monospace;
}

/* Blockquote */
.group :deep(.prose blockquote) {
  border-left: 3px solid var(--border);
  padding-left: 1rem;
  color: var(--muted-foreground);
  margin: 1rem 0;
  font-style: normal; /* Prose makes it italic */
}

/* Links */
.group :deep(.prose a) {
  color: hsl(var(--primary));
  text-decoration: none;
  font-weight: 500;
}

.group :deep(.prose a:hover) {
  text-decoration: underline;
}

/* Images */
.group :deep(.prose img) {
  margin-top: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
}
</style>
