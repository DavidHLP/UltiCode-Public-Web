<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Indent,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Shuffle,
} from "lucide-vue-next";
import logoIcon from "@/ico/favicon.ico";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
</script>

<template>
  <div class="flex min-w-[240px] flex-1 items-center overflow-hidden">
    <ul class="relative ml-2.5 mr-2 flex h-10 flex-none items-center">
      <RouterLink to="/" class="mr-2 self-center">
        <div class="mb-0.5 pl-1">
          <img :src="logoIcon" alt="Ulticode" class="h-5 w-5" />
        </div>
      </RouterLink>
      <li class="h-[16px] w-[1px] bg-gray-300 dark:bg-gray-600"></li>
    </ul>

    <!-- 导航菜单复合组件 -->
    <div
      class="flex items-center overflow-hidden rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
    >
      <HoverCard :open-delay="200">
        <HoverCardTrigger as-child>
          <Button
            variant="ghost"
            class="group/nav-back cursor-pointer gap-2 overflow-hidden hover:text-lc-icon-primary dark:hover:text-dark-lc-icon-primary flex items-center h-[32px] transition-none hover:bg-fill-quaternary dark:hover:bg-fill-quaternary text-gray-60 dark:text-gray-60 px-2"
            role="button"
            data-state="closed"
          >
            <Indent class="h-4 w-4" />
            <div class="relative flex items-center gap-2 overflow-hidden">
              <div
                class="truncate font-medium group-hover:text-lc-text-primary dark:group-hover:text-dark-lc-text-primary text-text-primary dark:text-text-primary hover:text-text-primary dark:hover:text-text-primary"
              >
                题库
              </div>
            </div>
            <div class="hidden group-hover/nav-back:block">
              <div class="flex flex-none" data-state="closed">
                <RouterLink
                  target="_blank"
                  rel="noopener noreferrer"
                  class="no-underline truncate rounded p-0.5 bg-fill-tertiary dark:bg-fill-tertiary text-text-tertiary dark:text-text-tertiary hover:bg-fill-secondary dark:hover:bg-fill-secondary hover:text-text-primary dark:hover:text-text-primary flex items-center justify-center"
                  to="/problemset/"
                >
                  <ExternalLink :size="10" />
                </RouterLink>
              </div>
            </div>
          </Button>
        </HoverCardTrigger>
        <HoverCardContent class="h-auto w-auto p-2">
          <div class="flex items-center gap-1">
            <p class="text-xs leading-none">展开面板</p>
            <KbdGroup class="text-xs">
              <Kbd class="px-0.5 py-0 min-w-0 h-auto text-xs"> Ctrl </Kbd>
              <span class="text-xs">+</span>
              <Kbd class="px-0.5 py-0 min-w-0 h-auto text-xs">]</Kbd>
            </KbdGroup>
          </div>
        </HoverCardContent>
      </HoverCard>

      <Separator
        orientation="vertical"
        class="h-[28px] w-[1px] flex-none bg-gray-300 dark:bg-gray-600"
      />

      <Button
        variant="ghost"
        size="icon"
        class="group flex-none cursor-pointer flex items-center h-[32px] transition-none hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 w-[32px] focus:outline-none focus:ring-0 focus:ring-offset-0"
        aria-label="上一题"
        as-child
      >
        <RouterLink to="/problems/sparse-similarity-lcci">
          <ChevronLeft class="h-4 w-4" />
        </RouterLink>
      </Button>

      <Separator
        orientation="vertical"
        class="h-[28px] w-[1px] flex-none bg-gray-300 dark:bg-gray-600"
      />

      <Button
        variant="ghost"
        size="icon"
        class="group flex-none cursor-pointer flex items-center h-[32px] transition-none hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 w-[32px] focus:outline-none focus:ring-0 focus:ring-offset-0"
        aria-label="下一题"
        as-child
      >
        <RouterLink to="/problems/add-two-numbers">
          <ChevronRight class="h-4 w-4" />
        </RouterLink>
      </Button>

      <Separator
        orientation="vertical"
        class="h-[28px] w-[1px] flex-none bg-gray-300 dark:bg-gray-600"
      />

      <Button
        variant="ghost"
        size="icon"
        class="flex-none cursor-pointer justify-center flex items-center h-[32px] transition-none hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 w-[32px] focus:outline-none focus:ring-0 focus:ring-offset-0"
        aria-label="随机一题"
        as-child
      >
        <RouterLink to="/problems/random">
          <Shuffle class="h-4 w-4" />
        </RouterLink>
      </Button>
    </div>
  </div>
</template>
