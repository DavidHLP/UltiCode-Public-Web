<script setup lang="ts">
import {MdPreview} from "md-editor-v3";
import "md-editor-v3/lib/preview.css";
import "katex/dist/katex.min.css";
import {computed} from "vue";
import katex from "katex";

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
        ...props.description.constraints.map(c => `- ${c}\n`)
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
</script>

<template>
  <div class="description-markdown">
    <MdPreview
        :model-value="markdownContent"
        preview-theme="default"
        :show-code-row-number="false"
        :katex="katex"
    />
  </div>
</template>

<style scoped>
.description-markdown :deep(.katex) {
  font-size: 1.05em;
  color: hsl(var(--foreground));
}

.description-markdown :deep(.katex-display) {
  margin: 1rem 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.description-markdown :deep(code) {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 0.9em;
}

.description-markdown :deep(pre code) {
  font-size: 13px;
  line-height: 1.5;
}
</style>