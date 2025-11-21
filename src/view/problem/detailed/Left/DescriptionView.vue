<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { renderMarkdown } from "@/lib/markdown";
import type { ProblemDetail } from "@/mocks/schema/problem-detail";

const props = defineProps<{
  problem: ProblemDetail;
}>();

const toHtml = (content: string) => renderMarkdown(content ?? "");
</script>

<template>
  <section class="space-y-6">
    <section class="space-y-3">
      <header
        class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      >
        <div class="space-y-1">
          <h1 class="text-lg font-semibold leading-tight">
            {{ props.problem.title }}
          </h1>
          <p class="text-sm text-muted-foreground">
            Level up your skills with this prompt.
          </p>
        </div>
        <Badge
          variant="secondary"
          class="w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase"
        >
          {{ props.problem.difficulty }}
        </Badge>
      </header>

      <section v-if="props.problem.tags.length" class="flex flex-wrap gap-2">
        <Badge
          v-for="tag in props.problem.tags"
          :key="tag"
          variant="outline"
          class="rounded-full px-3 py-1 text-[11px]"
        >
          {{ tag }}
        </Badge>
      </section>

      <section
        v-if="props.problem.companies.length"
        class="flex flex-wrap gap-2 text-xs text-muted-foreground"
      >
        <span
          class="font-semibold uppercase tracking-wide text-[11px] text-foreground/70"
          >Companies:</span
        >
        <span
          v-for="company in props.problem.companies"
          :key="company"
          class="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-foreground"
        >
          {{ company }}
        </span>
      </section>

      <article
        class="markdown-block text-sm leading-relaxed text-muted-foreground"
        v-html="toHtml(props.problem.summary)"
      />
    </section>

    <section v-if="props.problem.examples.length" class="space-y-3">
      <h2 class="text-sm font-semibold">Examples</h2>
      <article
        v-for="(example, index) in props.problem.examples"
        :key="example.id"
        class="space-y-2 rounded-md border bg-muted/40 p-3"
      >
        <p class="text-xs font-medium text-muted-foreground">
          Example {{ index + 1 }}
        </p>
        <section class="space-y-1">
          <p class="text-xs font-semibold">Input:</p>
          <div
            class="markdown-block whitespace-pre-wrap rounded-md bg-background px-3 py-2 text-xs font-mono leading-relaxed shadow-inner"
            v-html="toHtml(example.input)"
          />
        </section>
        <section class="space-y-1">
          <p class="text-xs font-semibold">Output:</p>
          <div
            class="markdown-block whitespace-pre-wrap rounded-md bg-background px-3 py-2 text-xs font-mono leading-relaxed shadow-inner"
            v-html="toHtml(example.output)"
          />
        </section>
        <section v-if="example.explanation" class="space-y-1">
          <p class="text-xs font-semibold">Explanation:</p>
          <div
            class="markdown-block text-xs leading-relaxed text-muted-foreground"
            v-html="toHtml(example.explanation)"
          />
        </section>
      </article>
    </section>

    <section v-if="props.problem.constraints.length" class="space-y-2">
      <h2 class="text-sm font-semibold">Constraints</h2>
      <ul class="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        <li
          v-for="constraint in props.problem.constraints"
          :key="constraint"
          class="markdown-block"
          v-html="toHtml(constraint)"
        />
      </ul>
    </section>
  </section>
</template>
