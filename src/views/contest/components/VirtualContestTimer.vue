<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useContestStore } from "@/stores/contest";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Trophy } from "lucide-vue-next";

const contestStore = useContestStore();
const timeRemaining = ref(0);
let intervalId: number | null = null;

const isActive = computed(() => contestStore.isInVirtualContest);
const session = computed(() => contestStore.virtualSession);

const formattedTime = computed(() => {
  const hours = Math.floor(timeRemaining.value / 3600);
  const minutes = Math.floor((timeRemaining.value % 3600) / 60);
  const seconds = timeRemaining.value % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
});

const progressPercent = computed(() => {
  if (!session.value) return 0;
  const total =
    (new Date(session.value.ends_at!).getTime() -
      new Date(session.value.started_at!).getTime()) /
    1000;
  const elapsed = total - timeRemaining.value;
  return Math.min(100, (elapsed / total) * 100);
});

function updateTimer() {
  if (!session.value?.ends_at) return;

  const now = Date.now();
  const endsAt = new Date(session.value.ends_at).getTime();
  const remaining = Math.max(0, Math.floor((endsAt - now) / 1000));

  timeRemaining.value = remaining;

  if (remaining === 0 && intervalId !== null) {
    clearInterval(intervalId);
  }
}

async function handleFinish() {
  if (!session.value?.contest_id) return;

  const confirmFinish = confirm(
    "Are you sure you want to finish this virtual contest early?",
  );
  if (!confirmFinish) return;

  try {
    await contestStore.finishVirtualContest(session.value.contest_id);
  } catch (error) {
    console.error("Failed to finish virtual contest:", error);
    alert("Failed to finish virtual contest");
  }
}

onMounted(() => {
  updateTimer();
  intervalId = window.setInterval(updateTimer, 1000);
});

onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
});
</script>

<template>
  <Card v-if="isActive && session" class="border-primary/50 bg-primary/5">
    <CardContent class="p-4">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Trophy class="h-5 w-5 text-primary" />
            <div>
              <p class="text-sm font-semibold">Virtual Contest Active</p>
              <p class="text-xs text-muted-foreground">
                Contest ID: {{ session.contest_id }}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" @click="handleFinish">
            Finish Early
          </Button>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Clock class="h-4 w-4 text-muted-foreground" />
              <span class="text-xs text-muted-foreground">Time Remaining</span>
            </div>
            <span
              class="font-mono text-lg font-bold"
              :class="{
                'text-destructive': timeRemaining < 300,
                'text-primary': timeRemaining >= 300,
              }"
            >
              {{ formattedTime }}
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="h-2 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-primary transition-all duration-500"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
        </div>

        <div
          class="flex items-center justify-between text-xs text-muted-foreground"
        >
          <span>Score: {{ session.total_score || 0 }}</span>
          <span>Penalty: {{ session.total_penalty || 0 }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
