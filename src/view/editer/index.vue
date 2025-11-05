<script setup lang="ts">
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
</script>

<template>
  <ResizablePanelGroup
    id="handle-demo-group-1"
    direction="horizontal"
    class="min-h-screen rounded-lg border"
  >
    <ResizablePanel id="handle-demo-panel-1" :default-size="25">
      <div class="flex h-full items-center justify-center p-6">
        <span class="font-semibold">Sidebar</span>
      </div>
    </ResizablePanel>
    <ResizableHandle id="handle-demo-handle-1" with-handle />
    <ResizablePanel id="handle-demo-panel-2" :default-size="75">
      <ResizablePanelGroup
        id="handle-demo-group-2"
        direction="vertical"
        class="h-full rounded-lg border"
      >
        <ResizablePanel id="handle-demo-panel-3" :default-size="50">
          <div class="flex h-full items-center justify-center p-6">
            <span class="font-semibold">Top Content</span>
          </div>
        </ResizablePanel>
        <ResizableHandle id="handle-demo-handle-2" with-handle />
        <ResizablePanel id="handle-demo-panel-4" :default-size="50">
          <div class="flex h-full items-center justify-center p-6">
            <span class="font-semibold">Bottom Content</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
