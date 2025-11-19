<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProblemApproach } from '@/mocks/schema/problem-detail'
import type { SolutionFeedItem } from '@/mocks/schema/solution'
import SolutionsListView from './SolutionsListView.vue'
import SolutionsDetail from './SolutionsDetail.vue'

const props = defineProps<{
  approaches: ProblemApproach[]
  followUp: string
}>()

const emit = defineEmits<{
  select: [item: SolutionFeedItem]
}>()

const selectedSolution = ref<SolutionFeedItem | null>(null)
const fallbackSolution = computed<SolutionFeedItem>(() => ({
  id: 'follow-up',
  title: 'Follow-up Insight',
  summary: props.followUp,
  highlight: 'Follow-up discussion',
  flair: '',
  badges: [],
  authorId: 'author-fallback',
  author: {
    id: 'author-fallback',
    name: 'Editorial',
    role: 'System Note',
    avatarColor: '#94a3b8',
  },
  tags: [],
  stats: {
    likes: 0,
    views: '0',
    comments: 0,
  },
  views: '0',
  likes: 0,
  comments: 0,
  createdAt: '—',
  publishedAt: new Date().toISOString(),
  topic: 'general',
  languageFilter: 'all',
  score: 0,
  steps: [],
  code: '',
  language: 'text',
  complexity: {
    time: '-',
    space: '-',
  },
}))

const handleSelect = (item: SolutionFeedItem) => {
  selectedSolution.value = item
  emit('select', item)
}

const resetSelectedSolution = () => {
  selectedSolution.value = null
}
</script>

<template>
  <div v-if="props.approaches.length" class="space-y-4">
    <div v-if="selectedSolution" class="space-y-4 px-5 py-4">
      <button
        type="button"
        class="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        @click="resetSelectedSolution"
      >
        &larr; Return solution list
      </button>
      <SolutionsDetail :item="selectedSolution" />
    </div>
    <SolutionsListView
      v-else
      :approaches="props.approaches"
      :follow-up="props.followUp"
      @select="handleSelect"
    />
  </div>
  <SolutionsDetail v-else :item="fallbackSolution" />
</template>
