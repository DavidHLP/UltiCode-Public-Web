<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar'
import { Bookmark, ChevronLeft, ChevronRight, Shuffle, ThumbsDown, ThumbsUp } from 'lucide-vue-next'
import logoIcon from '@/ico/favicon.ico'
import type { ProblemDetail } from '@/mocks/api/problem-detail'

const props = defineProps<{
  problem: ProblemDetail
}>()
</script>

<template>
  <nav
    class="relative flex h-12 w-full min-w-[100px] shrink-0 items-center justify-between gap-2 border-b bg-[#f0f0f0] px-2.5"
  >
    <Menubar
      class="flex h-8 min-w-[240px] flex-1 items-center gap-2 overflow-hidden border-none bg-transparent p-0 shadow-none"
    >
      <RouterLink to="/" class="mr-1 flex items-center gap-1">
        <img :src="logoIcon" alt="Ulticode" class="h-5 w-5" />
      </RouterLink>
      <span class="h-4 w-px bg-border" />

      <MenubarMenu>
        <MenubarTrigger
          class="flex h-8 items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:bg-accent/40"
        >
          <span>题库</span>
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem as-child>
            <RouterLink :to="{ name: 'problemset' }" class="block w-full"> 题库首页 </RouterLink>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <span class="h-7 w-px bg-border" />

      <div class="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          class="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          class="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          class="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Shuffle class="h-4 w-4" />
        </Button>
      </div>
    </Menubar>

    <div
      class="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2"
    >
      <div
        class="pointer-events-auto flex overflow-hidden rounded bg-muted/60 text-xs shadow-sm backdrop-blur-sm dark:bg-muted/40"
      >
        <Button
          variant="ghost"
          size="sm"
          class="h-8 rounded-none px-3 text-xs font-medium text-muted-foreground hover:bg-transparent"
        >
          Run
        </Button>
        <span class="my-1 h-6 w-px bg-border/60" />
        <Button size="sm" class="h-8 rounded-none px-3 text-xs font-medium"> Submit </Button>
      </div>
    </div>

    <div class="hidden flex-none items-center gap-2 md:flex">
      <Button variant="outline" size="sm" class="gap-1">
        <ThumbsUp class="h-4 w-4" />
        <span class="text-xs">{{ props.problem.likes }}</span>
      </Button>
      <Button variant="outline" size="sm" class="gap-1">
        <ThumbsDown class="h-4 w-4" />
        <span class="text-xs">{{ props.problem.dislikes }}</span>
      </Button>
      <Button variant="outline" size="sm" class="gap-1">
        <Bookmark class="h-4 w-4" />
        <span class="text-xs">Save</span>
      </Button>
    </div>
  </nav>
</template>
