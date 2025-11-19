<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SubmissionsListView from './SubmissionsListView.vue'
import SubmissionsDetail from './SubmissionsDetail.vue'
import type { SubmissionRecord } from '@/mocks/schema/submission'
import { fetchProblemSubmissions } from '@/api/submission'

const props = defineProps<{
  problemId: number
}>()

const submissions = ref<SubmissionRecord[]>([])
const isLoading = ref(true)
const selectedSubmissionId = ref<string | null>(null)

const selectedSubmission = computed(() =>
  submissions.value.find((submission) => submission.id === selectedSubmissionId.value) ?? null,
)

const loadSubmissions = async () => {
  isLoading.value = true
  try {
    submissions.value = await fetchProblemSubmissions(props.problemId)
  } catch (error) {
    console.error('Failed to load submissions', error)
    submissions.value = []
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.problemId,
  () => {
    selectedSubmissionId.value = null
    void loadSubmissions()
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
