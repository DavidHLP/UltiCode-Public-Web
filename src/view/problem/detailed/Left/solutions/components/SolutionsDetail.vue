<script setup lang="ts">
import type { SolutionFeedItem } from "@/mocks/schema/solution.ts";
import MarkdownView from "@/components/markdown/MarkdownView.vue";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Badge from "../../../../../../components/ui/badge/Badge.vue";
import { Separator } from "@/components/ui/separator";
import { Eye, MessageCircle, Triangle } from "lucide-vue-next";
import { computed } from "vue";

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
    class="group flex flex-col gap-3 border-b border-border px-4 py-5 last:border-b-0"
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
            · {{ props.item.createdAt }}
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
          <Badge variant="secondary" class="rounded-full px-2.5 py-0.5 text-[11px] capitalize">
            {{ props.item.language }}
          </Badge>
          <Badge variant="secondary" class="rounded-full px-2.5 py-0.5 text-[11px] capitalize">
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
