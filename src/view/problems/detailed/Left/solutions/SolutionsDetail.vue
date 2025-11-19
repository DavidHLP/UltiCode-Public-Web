<script setup lang="ts">
import { computed } from 'vue'
import type { SolutionFeedItem } from '@/mocks/schema/solution'
import CodeView from '@/components/code/CodeView.vue'
import { Eye, MessageCircle, Triangle } from 'lucide-vue-next'

const props = defineProps<{
  item: SolutionFeedItem
}>()

const authorInitial = computed(() => props.item.author.name.charAt(0)?.toUpperCase() ?? '?')
</script>

<template>
  <article class="group flex flex-col gap-3 border-b border-border px-4 py-5 last:border-b-0">
    <header class="flex items-start gap-3">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white shadow-inner"
        :style="{ backgroundColor: props.item.author.avatarColor }"
      >
        {{ authorInitial }}
      </div>
      <div class="flex flex-1 flex-col gap-1 text-sm leading-tight">
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-medium text-foreground">{{ props.item.author.name }}</span>
          <span class="truncate text-muted-foreground">{{ props.item.author.role }}</span>
          <span class="text-xs text-muted-foreground">· {{ props.item.createdAt }}</span>
          <span
            v-if="props.item.flair"
            class="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-700"
          >
            {{ props.item.flair }}
          </span>
        </div>
        <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span class="rounded-full bg-muted px-2 py-0.5 capitalize">{{
            props.item.language
          }}</span>
          <span class="rounded-full bg-muted px-2 py-0.5 capitalize">{{ props.item.topic }}</span>
          <span
            v-for="badge in props.item.badges"
            :key="badge"
            class="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
          >
            {{ badge }}
          </span>
        </div>
      </div>
    </header>

    <section class="space-y-3 text-sm leading-relaxed text-muted-foreground">
      <div class="space-y-1 text-foreground">
        <h3 class="text-base font-semibold leading-snug">{{ props.item.title }}</h3>
        <p class="font-medium">{{ props.item.highlight }}</p>
      </div>
      <p>{{ props.item.summary }}</p>

      <ol v-if="props.item.steps.length" class="list-disc space-y-1 pl-5">
        <li v-for="step in props.item.steps" :key="step">{{ step }}</li>
      </ol>

      <CodeView v-if="props.item.code" :code="props.item.code" :language="props.item.language" />

      <div v-if="props.item.tags.length" class="flex flex-wrap gap-2">
        <span
          v-for="tag in props.item.tags"
          :key="tag"
          class="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          {{ tag }}
        </span>
      </div>

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
