<script setup lang="ts">
import type { ForumAward } from "@/mocks/schema/forum.ts";

defineProps<{
  awards: ForumAward[];
}>();
</script>

<template>
  <section
    class="space-y-2 rounded-lg border border-border/60 bg-background/60 p-3"
  >
    <header
      class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
    >
      Awards
    </header>
    <ul class="flex flex-wrap gap-2">
      <li
        v-for="award in awards"
        :key="award.id"
        class="inline-flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1 text-xs font-medium"
      >
        <span class="text-sm">{{ award.icon }}</span>
        <span class="text-foreground">{{ award.name }}</span>
        <span class="text-muted-foreground">×{{ award.count }}</span>
      </li>
    </ul>
  </section>
</template>
