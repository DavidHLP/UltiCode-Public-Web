<script setup lang="ts">
import type { ContestCrewMember } from '@/mocks/schema/contest'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserRound } from 'lucide-vue-next'

const props = defineProps<{
  crew: ContestCrewMember[]
}>()
</script>

<template>
  <Card class="bg-card/80 backdrop-blur">
    <CardHeader>
      <CardTitle>Crew desk</CardTitle>
      <CardDescription>Direct lines for the featured run</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div
        v-for="member in props.crew"
        :key="member.id"
        class="rounded-xl border border-border/60 p-4"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold">{{ member.name }}</p>
            <p class="text-xs text-muted-foreground">{{ member.role }}</p>
          </div>
          <Badge variant="outline" class="text-[11px]">{{ member.timezone }}</Badge>
        </div>
        <p class="mt-1 text-sm text-muted-foreground">{{ member.focus }}</p>
        <div class="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <UserRound class="h-4 w-4" />
          <span class="font-mono">{{ member.channel }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
