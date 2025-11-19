<script setup lang="ts">
import type { ContestResource } from '@/mocks/schema/contest'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-vue-next'

const props = defineProps<{
  resources: ContestResource[]
  badgeStyles: Record<ContestResource['category'], string>
}>()
</script>

<template>
  <Card class="bg-card/80 backdrop-blur">
    <CardHeader>
      <CardTitle>Ops resources</CardTitle>
      <CardDescription>Docs & tools before check-in</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div
        v-for="resource in props.resources"
        :key="resource.id"
        class="rounded-xl border border-border/60 p-4"
      >
        <div class="flex items-center justify-between">
          <p class="font-semibold">{{ resource.title }}</p>
          <Badge
            variant="outline"
            :class="props.badgeStyles[resource.category]"
            class="text-[11px]"
          >
            {{ resource.category }}
          </Badge>
        </div>
        <p class="text-sm text-muted-foreground">{{ resource.description }}</p>
        <Button variant="ghost" size="sm" class="mt-2 text-primary">
          Open
          <ArrowUpRight class="ml-1 h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
