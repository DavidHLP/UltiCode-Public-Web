<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Play, CloudUpload, StickyNote } from "lucide-vue-next";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useBottomPanelStore } from "../right/bottom/bottom";

const { requestRun } = useBottomPanelStore();

const handleRun = () => {
  requestRun();
};
</script>

<template>
  <div
    class="relative z-20 flex min-w-60 flex-1 items-center overflow-hidden pointer-events-auto"
  >
    <div class="flex items-center overflow-hidden rounded focus:outline-none">
      <div class="relative group/nav-back flex items-center">
        <!-- Run button with HoverCard -->
        <HoverCard :open-delay="200">
          <HoverCardTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Run"
              class="group flex-none cursor-pointer flex items-center h-8 transition-none hover:bg-gray-200 text-gray-600 w-8 focus:outline-none focus:ring-0 focus:ring-offset-0 bg-gray-200"
              @click="handleRun"
            >
              <Play class="h-4 w-4" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent class="h-auto w-auto p-2">
            <div class="flex items-center gap-1">
              <p class="text-xs leading-none">Run Code</p>
              <KbdGroup class="text-xs">
                <Kbd class="px-0.5 py-0 min-w-0 h-auto text-xs">F5</Kbd>
              </KbdGroup>
            </div>
          </HoverCardContent>
        </HoverCard>

        <Separator
          orientation="vertical"
          class="h-7 w-px flex-none bg-gray-200"
        />

        <!-- Submit button using navigation layout style -->
        <HoverCard :open-delay="200">
          <HoverCardTrigger as-child>
            <Button
              variant="ghost"
              aria-label="Submit"
              class="group cursor-pointer gap-2 overflow-hidden hover:text-lc-icon-primary flex items-center h-8 transition-none hover:bg-gray-200 text-gray-60 px-2 bg-gray-200"
            >
              <CloudUpload class="h-4 w-4" />
              <div class="relative flex items-center gap-1 overflow-hidden">
                <div
                  class="truncate font-medium group-hover:text-lc-text-primary text-text-primary hover:text-text-primary"
                >
                  Submit
                </div>
              </div>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent class="h-auto w-auto p-2">
            <div class="flex items-center gap-1">
              <p class="text-xs leading-none">Submit Solution</p>
              <KbdGroup class="text-xs">
                <Kbd class="px-0.5 py-0 min-w-0 h-auto text-xs">Ctrl</Kbd>
                <span class="text-xs">+</span>
                <Kbd class="px-0.5 py-0 min-w-0 h-auto text-xs">Enter</Kbd>
              </KbdGroup>
            </div>
          </HoverCardContent>
        </HoverCard>

        <!-- Notes button with HoverCard -->
        <HoverCard :open-delay="200">
          <HoverCardTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notes"
              class="group flex-none cursor-pointer flex items-center h-8 transition-none hover:bg-gray-200 text-gray-600 w-8 focus:outline-none focus:ring-0 focus:ring-offset-0 bg-gray-200"
            >
              <StickyNote class="h-4 w-4" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent class="h-auto w-auto p-2">
            <div class="flex items-center gap-1">
              <p class="text-xs leading-none">Notes</p>
              <KbdGroup class="text-xs">
                <Kbd class="px-0.5 py-0 min-w-0 h-auto text-xs">Ctrl</Kbd>
                <span class="text-xs">+</span>
                <Kbd class="px-0.5 py-0 min-w-0 h-auto text-xs">N</Kbd>
              </KbdGroup>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  </div>
</template>
