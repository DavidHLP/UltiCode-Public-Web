<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Eye, ArrowRight } from "lucide-vue-next";

const solutions = [
  {
    id: 1,
    title: "O(n) solution using HashMap",
    problem: "Two Sum",
    tags: ["Array", "Hash Table"],
    lang: "TypeScript",
    votes: 45,
    views: 1205,
    comments: 12,
    date: "2 days ago",
  },
  {
    id: 2,
    title: "Simple recursive approach explained",
    problem: "Merge Two Sorted Lists",
    tags: ["Linked List", "Recursion"],
    lang: "Python",
    votes: 128,
    views: 3500,
    comments: 34,
    date: "1 week ago",
  },
  {
    id: 3,
    title: "Binary Search optimization",
    problem: "Search Insert Position",
    tags: ["Array", "Binary Search"],
    lang: "Go",
    votes: 12,
    views: 450,
    comments: 2,
    date: "2 weeks ago",
  },
];
</script>

<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="space-y-0.5">
      <h2 class="text-2xl font-bold tracking-tight">My Solutions</h2>
      <p class="text-muted-foreground">
        Manage the solutions you have shared with the community.
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="sol in solutions" :key="sol.id" class="flex flex-col">
        <CardHeader>
          <div class="flex items-start justify-between">
            <Badge variant="secondary">{{ sol.lang }}</Badge>
            <span class="text-xs text-muted-foreground">{{ sol.date }}</span>
          </div>
          <CardTitle class="line-clamp-1 mt-2 text-lg">{{
            sol.title
          }}</CardTitle>
          <CardDescription>For {{ sol.problem }}</CardDescription>
        </CardHeader>
        <CardContent class="flex-1">
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="tag in sol.tags"
              :key="tag"
              variant="outline"
              class="text-xs font-normal"
            >
              {{ tag }}
            </Badge>
          </div>
        </CardContent>
        <CardFooter class="border-t bg-muted/20 p-4">
          <div
            class="flex w-full items-center justify-between text-muted-foreground"
          >
            <div class="flex gap-4 text-xs">
              <div class="flex items-center gap-1">
                <ThumbsUp class="h-3 w-3" />
                <span>{{ sol.votes }}</span>
              </div>
              <div class="flex items-center gap-1">
                <Eye class="h-3 w-3" />
                <span>{{ sol.views }}</span>
              </div>
              <div class="flex items-center gap-1">
                <MessageSquare class="h-3 w-3" />
                <span>{{ sol.comments }}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" class="h-6 w-6">
              <ArrowRight class="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
