<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Play, CloudUpload  ,StickyNote} from "lucide-vue-next";
</script>

<template>
  <ButtonGroup class="flex flex-none">
    <!-- 运行和提交按钮组 -->
    <ButtonGroup>
      <Button
        variant="ghost"
        size="icon"
        data-e2e-locator="console-run-button"
        aria-label="运行"
        class="rounded-none p-1.5 bg-transparent dark:bg-transparent text-gray-800 dark:text-gray-200 h-auto w-auto"
      >
        <Play class="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </Button>
      <Button
        variant="ghost"
        aria-label="提交"
        class="rounded-none p-1.5 bg-transparent dark:bg-transparent text-gray-800 dark:text-gray-200 h-auto w-auto gap-1"
      >
        <CloudUpload  class="h-4 w-4 text-green-600 dark:text-green-500" />
        <span>提交</span>
      </Button>
    </ButtonGroup>
    <ButtonGroup>
      <Button
        variant="ghost"
        size="icon"
        data-e2e-locator="console-run-button"
        aria-label="笔记"
        class="rounded-none p-1.5 bg-transparent dark:bg-transparent text-gray-800 dark:text-gray-200 h-auto w-auto"
      >
        <StickyNote class="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </Button>
    </ButtonGroup>
  </ButtonGroup>
</template>
