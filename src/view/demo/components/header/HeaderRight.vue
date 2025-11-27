<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Layout, User } from "lucide-vue-next";
</script>

<template>
  <ButtonGroup class="relative flex items-center justify-end gap-2 flex-none">
    <!-- 布局按钮 -->
    <Button
      variant="ghost"
      size="icon"
      aria-label="布局"
      class="rounded-lg p-2"
    >
      <Layout class="h-4 w-4" />
    </Button>

    <Button variant="ghost" size="icon" class="rounded-full">
      <User class="h-5 w-5" />
    </Button>
  </ButtonGroup>
</template>
