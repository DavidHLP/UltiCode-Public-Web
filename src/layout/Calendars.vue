<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-vue-next";
import type { ProblemList } from "@/mocks/schema/problem-list";
import { RouterLink } from "vue-router";

defineProps<{
  problemLists: ProblemList[];
}>();
</script>

<template>
  <div v-for="list in problemLists" :key="list.name" class="px-4 py-2">
    <Collapsible :default-open="true">
      <CollapsibleTrigger class="flex w-full items-center justify-between">
        <span class="text-sm font-semibold">{{ list.name }}</span>
        <ChevronRight
          class="h-4 w-4 transform transition-transform duration-200 ui-open:rotate-90"
        />
      </CollapsibleTrigger>
      <CollapsibleContent class="py-2">
        <ul class="space-y-1">
          <li v-for="item in list.items" :key="item.id">
            <RouterLink
              :to="`/problem/problem-list/${item.id}`"
              class="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <span class="flex-1 truncate">{{ item.name }}</span>
              <span class="text-xs text-muted-foreground">{{
                item.problemCount
              }}</span>
            </RouterLink>
          </li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  </div>
</template>
