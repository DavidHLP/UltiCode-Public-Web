<script setup lang="ts">
import { ref } from 'vue'
import CaretSortIcon from '~icons/radix-icons/caret-sort'
import CheckIcon from '~icons/radix-icons/check'
import PlusCircledIcon from '~icons/radix-icons/plus-circled'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const groups = [
  {
    label: '题库来源',
    teams: [
      {
        label: '公开题库',
        value: 'public-bank',
      },
      {
        label: '高校训练营',
        value: 'campus-camp',
      },
    ],
  },
  {
    label: '数据范围',
    teams: [
      {
        label: '全站概览',
        value: 'global',
      },
      {
        label: '竞赛会场',
        value: 'contest',
      },
    ],
  },
]

type Team = (typeof groups)[number]['teams'][number]

const open = ref(false)
const showNewTeamDialog = ref(false)
const selectedTeam = ref<Team>(groups[0].teams[0])
</script>

<template>
  <Dialog v-model:open="showNewTeamDialog">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded="open"
          aria-label="选择数据范围"
          :class="cn('w-[200px] justify-between', $attrs.class ?? '')"
        >
          <Avatar class="mr-2 h-5 w-5">
            <AvatarImage
              :src="`https://avatar.vercel.sh/${selectedTeam.value}.png`"
              :alt="selectedTeam.label"
            />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          {{ selectedTeam.label }}
          <CaretSortIcon class="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="搜索视图..." />
            <CommandEmpty>没有匹配的数据视图</CommandEmpty>
            <CommandGroup v-for="group in groups" :key="group.label" :heading="group.label">
              <CommandItem
                v-for="team in group.teams"
                :key="team.value"
                :value="team"
                class="text-sm"
                @select="
                  () => {
                    selectedTeam = team
                    open = false
                  }
                "
              >
                <Avatar class="mr-2 h-5 w-5">
                  <AvatarImage
                    :src="`https://avatar.vercel.sh/${team.value}.png`"
                    :alt="team.label"
                    class="grayscale"
                  />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                {{ team.label }}
                <CheckIcon
                  :class="
                    cn(
                      'ml-auto h-4 w-4',
                      selectedTeam.value === team.value ? 'opacity-100' : 'opacity-0',
                    )
                  "
                />
              </CommandItem>
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <DialogTrigger as-child>
                <CommandItem
                  value="create-team"
                  @select="
                    () => {
                      open = false
                      showNewTeamDialog = true
                    }
                  "
                >
                  <PlusCircledIcon class="mr-2 h-5 w-5" />
                  新增自定义视图
                </CommandItem>
              </DialogTrigger>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>新增自定义视图</DialogTitle>
        <DialogDescription>
          为常用的数据筛选保存一个快捷入口，方便快速切换统计范围。
        </DialogDescription>
      </DialogHeader>
      <div>
        <div class="space-y-4 py-2 pb-4">
          <div class="space-y-2">
            <Label for="name">视图名称</Label>
            <Input id="name" placeholder="例如：春招热门题集" />
          </div>
          <div class="space-y-2">
            <Label for="plan">统计范围</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="选择数据范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">
                  <span class="font-medium">全站数据</span>
                  <span class="text-muted-foreground"> · 包含全部公开提交 </span>
                </SelectItem>
                <SelectItem value="public">
                  <span class="font-medium">公开题库</span>
                  <span class="text-muted-foreground"> · 仅统计公开题目</span>
                </SelectItem>
                <SelectItem value="contest">
                  <span class="font-medium">竞赛会场</span>
                  <span class="text-muted-foreground"> · 聚焦近期竞赛提交 </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showNewTeamDialog = false"> 取消 </Button>
        <Button type="submit"> 保存 </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
