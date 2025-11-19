<script setup lang="ts">
import type { ForumCommunity, ForumModerator, ForumTrendingTopic } from '@/mocks/schema/forum'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CalendarDays,
  ClipboardList,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-vue-next'
import { computed } from 'vue'

const { trendingTopics, communities, moderators } = defineProps<{
  trendingTopics: ForumTrendingTopic[]
  communities: ForumCommunity[]
  moderators: ForumModerator[]
}>()

const checklist = [
  'Add a flair that matches your intent (question, discussion, showcase)',
  'Summarize context before linking out to sandboxes or repos',
  'Share what you have tried to reduce back-and-forth',
  'Flag job posts with compensation + location up front',
]

const formatter = new Intl.NumberFormat('en', { notation: 'compact' })

const communityLookup = computed(() => {
  return communities.reduce<Record<string, ForumCommunity>>((lookup, community) => {
    lookup[community.slug] = community
    return lookup
  }, {})
})

const getCommunityName = (slug: string) => communityLookup.value[slug]?.name ?? `r/${slug}`

const getCommunityOnline = (slug: string) => {
  const community = communityLookup.value[slug]
  if (!community) return ''
  return `${formatter.format(community.online)} online`
}
</script>

<template>
  <aside class="flex flex-col gap-3">
    <Card class="border-border/60 bg-card/60">
      <CardHeader class="space-y-1 border-b border-border/60 px-4 py-3">
        <CardTitle class="flex items-center gap-2 text-sm font-semibold">
          <TrendingUp class="h-4 w-4 text-orange-500" />
          Trending threads
        </CardTitle>
        <CardDescription class="text-xs text-muted-foreground">
          Highlights the community is bookmarking right now.
        </CardDescription>
      </CardHeader>
      <CardContent class="p-0">
        <ul class="divide-y divide-border/40 text-xs">
          <li
            v-for="topic in trendingTopics"
            :key="topic.id"
            class="flex items-center justify-between gap-3 px-4 py-3"
          >
            <article class="space-y-1">
              <p class="font-medium text-foreground">{{ topic.title }}</p>
              <p class="text-[11px] text-muted-foreground">
                {{ getCommunityName(topic.communityId) }} ·
                {{ getCommunityOnline(topic.communityId) }}
              </p>
            </article>
            <Badge
              :variant="topic.trend === 'up' ? 'secondary' : 'outline'"
              class="gap-1 text-[10px] font-semibold"
            >
              <TrendingUp class="h-3 w-3" />
              {{ topic.trend === 'down' ? `-${topic.delta}` : `+${topic.delta}` }}
            </Badge>
          </li>
        </ul>
      </CardContent>
    </Card>

    <Card class="border-border/60 bg-card/60">
      <CardHeader class="space-y-1 border-b border-border/60 px-4 py-3">
        <CardTitle class="flex items-center gap-2 text-sm font-semibold">
          <Users class="h-4 w-4 text-blue-500" />
          Communities to join
        </CardTitle>
      </CardHeader>
      <CardContent class="p-4">
        <ul class="space-y-3 text-xs">
          <li v-for="community in communities" :key="community.name">
            <article
              class="space-y-3 overflow-hidden rounded-lg border border-border/50 bg-background/60"
            >
              <div
                v-if="community.banner"
                class="h-16 w-full bg-cover bg-center"
                :style="{
                  backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0)), url(${community.banner})`,
                }"
              />
              <div class="space-y-2 p-3">
                <header class="flex items-start gap-2">
                  <span class="mt-0.5 text-sm">{{ community.icon }}</span>
                  <div class="flex-1 space-y-1">
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-semibold text-foreground">{{ community.name }}</p>
                      <span
                        v-if="community.isNew"
                        class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700"
                      >
                        New
                      </span>
                      <span
                        v-if="community.isOfficial"
                        class="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-indigo-700"
                      >
                        Official
                      </span>
                    </div>
                    <p class="text-[11px] text-muted-foreground">
                      {{ formatter.format(community.members) }} members ·
                      {{ formatter.format(community.online) }} online
                    </p>
                    <p
                      v-if="community.foundedAt"
                      class="flex items-center gap-1 text-[10px] text-muted-foreground"
                    >
                      <CalendarDays class="h-3 w-3" />
                      Founded {{ new Date(community.foundedAt).getFullYear() }}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" class="h-7 px-2 text-xs">Join</Button>
                </header>
                <p class="text-[11px] text-muted-foreground">{{ community.description }}</p>
                <ul class="flex flex-wrap gap-1 text-[10px]">
                  <li v-for="tag in community.tags" :key="tag">
                    <Badge
                      variant="outline"
                      class="rounded-full border-dashed px-2 py-0.5"
                      :style="
                        community.accentColor
                          ? { borderColor: community.accentColor, color: community.accentColor }
                          : undefined
                      "
                    >
                      #{{ tag }}
                    </Badge>
                  </li>
                </ul>
                <ul v-if="community.rules?.length" class="space-y-2 rounded-md bg-muted/40 p-2">
                  <li v-for="rule in community.rules" :key="rule.id" class="space-y-1">
                    <p class="text-[11px] font-semibold text-foreground">{{ rule.title }}</p>
                    <p class="text-[10px] text-muted-foreground">{{ rule.summary }}</p>
                  </li>
                </ul>
                <ul v-if="community.links?.length" class="space-y-1">
                  <li v-for="link in community.links" :key="link.url">
                    <a
                      :href="link.url"
                      class="flex items-center gap-1 text-[11px] font-medium text-primary underline-offset-2 hover:underline"
                    >
                      <ExternalLink class="h-3 w-3" />
                      {{ link.label }}
                      <span v-if="link.description" class="text-[10px] text-muted-foreground">
                        · {{ link.description }}
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
            </article>
          </li>
        </ul>
      </CardContent>
    </Card>

    <Card class="border-border/60 bg-card/60">
      <CardHeader class="space-y-1 border-b border-border/60 px-4 py-3">
        <CardTitle class="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck class="h-4 w-4 text-emerald-500" />
          Moderator desk
        </CardTitle>
      </CardHeader>
      <CardContent class="p-0">
        <ul class="divide-y divide-border/60 text-xs">
          <li v-for="moderator in moderators" :key="moderator.username" class="space-y-2 px-4 py-3">
            <header class="flex items-center gap-3">
              <Avatar class="h-8 w-8 border border-border/60">
                <AvatarImage
                  v-if="moderator.avatar"
                  :src="moderator.avatar"
                  :alt="moderator.username"
                />
                <AvatarFallback class="text-xs font-semibold uppercase">
                  {{ moderator.username.slice(0, 2).toUpperCase() }}
                </AvatarFallback>
              </Avatar>
              <div class="-space-y-0.5">
                <p class="font-semibold text-foreground">@{{ moderator.username }}</p>
                <p class="text-[11px] text-muted-foreground">
                  {{ moderator.timezone }} · {{ moderator.availability }}
                </p>
              </div>
            </header>
            <ul class="flex flex-wrap gap-1 text-[10px] text-muted-foreground">
              <li v-for="focus in moderator.focus" :key="focus">
                <span class="rounded-full border border-dashed px-2 py-0.5">{{ focus }}</span>
              </li>
            </ul>
          </li>
        </ul>
      </CardContent>
    </Card>

    <Card class="border border-dashed border-border/60 bg-card/40">
      <CardContent class="space-y-3 p-4">
        <header class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
          <ClipboardList class="h-3.5 w-3.5 text-purple-500" />
          Posting checklist
        </header>
        <ul class="space-y-2 text-xs text-muted-foreground">
          <li v-for="item in checklist" :key="item" class="flex gap-2">
            <span class="text-purple-500">•</span>
            <span>{{ item }}</span>
          </li>
        </ul>
        <Button class="w-full" size="sm" variant="secondary">Review subreddit wiki</Button>
      </CardContent>
    </Card>
  </aside>
</template>
