<script setup lang="ts">
import { computed } from "vue";
import { renderMarkdown } from "@/utils/markdown";
import "highlight.js/styles/atom-one-dark.css";

/**
 * Problem description data model for markdown rendering.
 */
export interface ProblemDescription {
  /** Main description body */
  content: string;
  /** Example list */
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  /** Constraint bullets */
  constraints?: string[];
  /** Follow-up prompt */
  followUp?: string;
}

const props = defineProps<{
  /** Problem description data */
  description: ProblemDescription;
}>();

/**
 * Compose the complete Markdown content for the viewer.
 * Optimized: Use template literals and minimal string operations
 */
const markdownContent = computed(() => {
  const parts: string[] = [props.description.content];

  // Add examples
  if (props.description.examples?.length) {
    parts.push("\n\n### Examples\n");

    props.description.examples.forEach((example, index) => {
      parts.push(
        `\n#### Example ${index + 1}\n\n`,
        `**Input**
\`\`\`
${example.input}
\`\`\`

`,
        `**Output**
\`\`\`
${example.output}
\`\`\`
`
      );

      if (example.explanation) {
        parts.push(`\n**Explanation** ${example.explanation}\n`);
      }
    });
  }

  // Add constraints
  if (props.description.constraints?.length) {
    parts.push(
      "\n\n#### Constraints\n\n",
      ...props.description.constraints.map((c) => `- ${c}\n`)
    );
  }

  // Add follow-up
  if (props.description.followUp) {
    parts.push(`

#### Follow-up

${props.description.followUp}
`);
  }

  return parts.join("");
});

const htmlContent = computed(() => renderMarkdown(markdownContent.value));
</script>

<template>
  <div class="description-markdown">
    <div class="markdown-content" v-html="htmlContent"></div>
  </div>
</template>

<style scoped>
.description-markdown :deep(.markdown-content) {
  font-size: 0.95rem;
  line-height: 1.5;
  background: transparent;
  color: var(--foreground);
}

.description-markdown :deep(.markdown-content h1) {
  font-size: 1.35rem;
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.description-markdown :deep(.markdown-content h2),
.description-markdown :deep(.markdown-content h3),
.description-markdown :deep(.markdown-content h4) {
  font-size: 1.15rem;
  font-weight: 600;
  margin-top: 0.875rem;
  margin-bottom: 0.5rem;
}

.description-markdown :deep(.markdown-content blockquote) {
  border-left: 4px solid var(--color-border);
  padding-left: 1rem;
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.description-markdown :deep(.markdown-content ul),
.description-markdown :deep(.markdown-content ol) {
  margin-left: 1.5rem;
  font-size: 0.95rem;
}

.description-markdown :deep(.markdown-content ul) {
  list-style: disc;
}

.description-markdown :deep(.markdown-content ol) {
  list-style: decimal;
}

.description-markdown :deep(.katex) {
  font-size: 0.9em;
  color: hsl(var(--foreground));
}

.description-markdown :deep(.katex-display) {
  margin: 1rem 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.description-markdown :deep(code) {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 0.85em;
  background-color: var(--muted);
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

.description-markdown :deep(pre) {
  background-color: #282c34; /* match atom-one-dark background roughly or rely on hljs css */
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.description-markdown :deep(pre code) {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  color: inherit;
  font-size: 0.85em;
  line-height: 1.5;
}

/* Fix for dark mode text compatibility if needed */
.dark .description-markdown :deep(.markdown-content) {
  color: var(--foreground);
}
</style>
