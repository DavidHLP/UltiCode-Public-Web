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
      <HoverCard
        class="group/nav-back cursor-pointer gap-2 overflow-hidden flex items-center h-[32px] transition-none hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 px-2"
        role="button"
        aria-label="展开面板"
      >
        <HoverCardTrigger as-child>
          <div class="flex items-center gap-2">
            <!-- 简化的外层容器 -->
            <div
              class="relative text-[16px] leading-[normal] p-0.5 before:block before:h-4 before:w-4 flex-none"
            >
              <Indent
                class="h-4 w-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </div>
            <div class="truncate font-medium text-gray-800 dark:text-gray-200">
              题库
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent class="px-3 py-2"> <!-- 使用内边距而不是固定宽高 -->
          <div class="flex items-center space-x-2">
            <span class="text-xs font-medium whitespace-nowrap">展开面板:</span>
            <KbdGroup class="flex items-center space-x-1">
              <Kbd class="px-2 py-1 text-xs">Ctrl</Kbd>
              <span class="text-xs">+</span>
              <Kbd class="px-2 py-1 text-xs">B</Kbd>
            </KbdGroup>
          </div>
        </HoverCardContent>
        <div class="hidden group-hover/nav-back:block">
          <div class="flex flex-none" data-state="closed">
            <RouterLink
              to="/problemset/"
              target="_blank"
              aria-label="在新的标签页打开 题库"
              class="no-underline truncate rounded p-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <ExternalLink class="h-3 w-3" />
            </RouterLink>
          </div>
        </div>
      </HoverCard>

      <div class="hidden group-hover/nav-back:block ml-1">
        <Button
          variant="ghost"
          size="icon"
          class="no-underline truncate rounded p-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-200 h-6 w-6 focus:outline-none focus:ring-0 focus:ring-offset-0"
          aria-label="在新的标签页打开 题库"
          as-child
        >
          <RouterLink to="/problemset/" target="_blank">
            <ExternalLink class="h-3 w-3" />
          </RouterLink>
        </Button>
      </div>

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
