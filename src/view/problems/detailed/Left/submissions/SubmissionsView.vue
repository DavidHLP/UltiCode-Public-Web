<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SubmissionsListView from './SubmissionsListView.vue'
import SubmissionsDetail from './SubmissionsDetail.vue'
import type { SubmissionRecord } from '@/mocks/api/submission'
import { fetchProblemSubmissions } from '@/mocks/api/submission'

const props = defineProps<{
  problemId: number
}>()

const submissions = ref<SubmissionRecord[]>([])
const isLoading = ref(true)
const selectedSubmissionId = ref<string | null>(null)

const selectedSubmission = computed(() =>
  submissions.value.find((submission) => submission.id === selectedSubmissionId.value) ?? null,
)

const loadSubmissions = () => {
  isLoading.value = true
  submissions.value = fetchProblemSubmissions(props.problemId)
  isLoading.value = false
}

watch(
  () => props.problemId,
  () => {
    selectedSubmissionId.value = null
    loadSubmissions()
  },
  { immediate: true },
)

const handleSelect = (submission: SubmissionRecord) => {
  selectedSubmissionId.value = submission.id
}

const handleBack = () => {
  selectedSubmissionId.value = null
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <SubmissionsDetail
      v-if="selectedSubmission"
      :submission="selectedSubmission"
      @back="handleBack"
    />
    <SubmissionsListView
      v-else
      :submissions="submissions"
      :is-loading="isLoading"
      @select="handleSelect"
    />
  </div>
</template>
