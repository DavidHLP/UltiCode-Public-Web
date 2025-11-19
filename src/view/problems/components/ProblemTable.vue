<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Problem } from '@/mocks/schema/problem'
import { onMounted, onUnmounted, type Component, type PropType } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, Video } from 'lucide-vue-next'

defineProps({
  displayedProblems: {
    type: Array as PropType<
      (Problem & {
        statusIcon?: Component
      })[]
    >,
    required: true,
  },
  numProblemsToShow: {
    type: Number,
    required: true,
  },
  totalFilteredProblems: {
    type: Number,
    required: true,
  },
})

const router = useRouter()

const emit = defineEmits(['load-more'])

const goToDetail = (id: number) => {
  router.push({ name: 'problem-detail', params: { id } })
}

const difficultyClass = (difficulty: Problem['difficulty']) => {
  switch (difficulty) {
    case 'Easy':
      return 'text-emerald-600'
    case 'Medium':
      return 'text-amber-600'
    case 'Hard':
      return 'text-red-600'
    default:
      return ''
  }
}

const formatAcceptance = (value: number) => `${value.toFixed(1)}%`

const handleScroll = () => {
  const buffer = 200 // Number of pixels from the bottom to trigger load more
  const isAtBottom =
    window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - buffer
  if (isAtBottom) {
    emit('load-more')
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead class="w-[50px]">Status</TableHead>
        <TableHead>Title</TableHead>
        <TableHead class="w-[120px] text-center">Acceptance</TableHead>
        <TableHead class="w-[100px] text-center">Difficulty</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      <template v-if="displayedProblems.length > 0">
        <!-- 关键：在 TableRow 上加 odd:/even: 类 -->
        <TableRow
          v-for="problem in displayedProblems"
          :key="problem.id"
          class="odd:bg-muted/30 even:bg-background hover:bg-muted/50 cursor-pointer"
          @click="goToDetail(problem.id)"
        >
          <TableCell class="flex justify-center">
            <component
              :is="problem.statusIcon"
              v-if="problem.statusIcon"
              class="h-5 w-5"
              :class="{ 'text-emerald-600': problem.status === 'solved' }"
            />
          </TableCell>

          <TableCell>
            <div class="flex items-center gap-2">
              <span class="truncate">{{ problem.id }}. {{ problem.title }}</span>
              <!-- 关键：去掉下划线 -->
              <a
                v-if="problem.solution"
                href="#"
                class="no-underline hover:no-underline text-muted-foreground hover:text-foreground"
                @click.stop
              >
                <Video class="h-4 w-4" />
              </a>
              <Lock v-if="problem.isPremium" class="h-4 w-4 text-amber-500" />
            </div>
          </TableCell>

          <TableCell class="text-center">
            {{ formatAcceptance(problem.acceptanceRate) }}
          </TableCell>

          <TableCell :class="difficultyClass(problem.difficulty)" class="text-center">
            {{ problem.difficulty }}
          </TableCell>
        </TableRow>
      </template>

      <TableRow v-else>
        <TableCell colspan="4" class="h-24 text-center"> No results found. </TableCell>
      </TableRow>
    </TableBody>
  </Table>
  <div
    v-if="numProblemsToShow < totalFilteredProblems"
    class="text-center py-4 text-muted-foreground"
  >
    Loading more...
  </div>
</template>
