<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Play, CloudUpload, StickyNote } from "lucide-vue-next";
</script>

<template>
  <ButtonGroup>
    <!-- 运行和提交按钮组 -->
    <ButtonGroup>
      <Button variant="ghost" size="icon" aria-label="运行">
        <Play class="h-4 w-4" />
      </Button>
      <Button variant="ghost" aria-label="提交">
        <CloudUpload class="h-4 w-4" />
        <span>提交</span>
      </Button>
    </ButtonGroup>
    <ButtonGroup>
      <Button variant="ghost" size="icon" aria-label="笔记">
        <StickyNote class="h-4 w-4" />
      </Button>
    </ButtonGroup>
  </ButtonGroup>
</template>