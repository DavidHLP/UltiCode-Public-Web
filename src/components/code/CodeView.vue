<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import hljs from "highlight.js/lib/core";
import type { LanguageFn } from "highlight.js";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import cpp from "highlight.js/lib/languages/cpp";
import java from "highlight.js/lib/languages/java";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import csharp from "highlight.js/lib/languages/csharp";
import kotlin from "highlight.js/lib/languages/kotlin";
import swift from "highlight.js/lib/languages/swift";
import { Copy, Check, RefreshCw } from "lucide-vue-next";
import { Separator } from "@/components/ui/separator";

const languages: Array<[string, LanguageFn]> = [
  ["javascript", javascript],
  ["typescript", typescript],
  ["python", python],
  ["cpp", cpp],
  ["java", java],
  ["go", go],
  ["rust", rust],
  ["csharp", csharp],
  ["kotlin", kotlin],
  ["swift", swift],
];

languages.forEach(([name, loader]) => {
  hljs.registerLanguage(name, loader);
});

const props = defineProps<{
  code: string;
  language?: string;
}>();

const copied = ref(false);
let copyTimeout: ReturnType<typeof setTimeout> | null = null;

const normalizedCode = computed(() => props.code?.trimEnd() ?? "");

const normalizeLanguageKey = (value?: string) => {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\+\+/g, "pp")
    .replace(/#/g, "sharp");
};

const languageAliases: Record<string, string> = {
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  python: "python",
  python3: "python",
  py: "python",
  java: "java",
  kotlin: "kotlin",
  swift: "swift",
  go: "go",
  golang: "go",
  rust: "rust",
  cpp: "cpp",
  "c++": "cpp",
  cplusplus: "cpp",
  csharp: "csharp",
};

const highlightLanguage = computed(
  () => languageAliases[normalizeLanguageKey(props.language)] ?? null
);

const highlightedCode = computed(() => {
  if (!normalizedCode.value) return "";
  try {
    if (highlightLanguage.value) {
      return hljs.highlight(normalizedCode.value, {
        language: highlightLanguage.value,
      }).value;
    }
    return hljs.highlightAuto(normalizedCode.value).value;
  } catch (error) {
    console.warn("Failed to highlight code", error);
    return normalizedCode.value;
  }
});

const languageLabel = computed(
  () => props.language ?? highlightLanguage.value ?? "Code snippet"
);

const handleCopy = async () => {
  if (
    !normalizedCode.value ||
    typeof navigator === "undefined" ||
    !navigator.clipboard
  )
    return;
  try {
    await navigator.clipboard.writeText(normalizedCode.value);
    copied.value = true;
    if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch (error) {
    console.warn("Unable to copy code snippet", error);
  }
};

watch(
  () => props.code,
  () => {
    copied.value = false;
    if (copyTimeout) {
      clearTimeout(copyTimeout);
      copyTimeout = null;
    }
  }
);

onBeforeUnmount(() => {
  if (copyTimeout) {
    clearTimeout(copyTimeout);
    copyTimeout = null;
  }
});
</script>

<template>
  <div class="flex flex-col w-full">
    <div class="flex items-center gap-2 pb-2 text-sm font-medium text-muted-foreground  h-5">
      <span>代码</span>
      <Separator orientation="vertical" class="h-3 w-px bg-border" />
      <span>{{ languageLabel }}</span>
    </div>

    <!-- 代码显示区域 -->
    <div class="relative">
      <div class="relative w-full rounded-lg overflow-hidden bg-[#1e1e1e] dark:bg-[#1e1e1e]">
        <!-- 代码内容 -->
        <div class="relative group">
          <pre
            class="m-0 p-4 overflow-x-auto text-[13px] leading-relaxed font-mono"
            style="
              max-height: 205px;
              scrollbar-width: thin;
              scrollbar-color: #4a4a4a #1e1e1e;
            "
          ><code class="hljs" v-html="highlightedCode" /></pre>

          <!-- 右上角操作按钮 -->
          <div
            class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button
              class="flex h-7 w-7 items-center justify-center rounded bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white transition-colors"
              @click="handleCopy"
              title="复制代码"
            >
              <Check v-if="copied" class="h-4 w-4 text-green-400" />
              <Copy v-else class="h-4 w-4" />
            </button>
            <button
              class="flex h-7 w-7 items-center justify-center rounded bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white transition-colors"
              title="重置"
            >
              <RefreshCw class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义滚动条样式 */
pre::-webkit-scrollbar {
  height: 8px;
}

pre::-webkit-scrollbar-track {
  background: #1e1e1e;
}

pre::-webkit-scrollbar-thumb {
  background: #4a4a4a;
  border-radius: 4px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: #5a5a5a;
}

/* hljs 样式覆盖 - 深色主题 */
:deep(.hljs) {
  background: transparent;
  color: #d4d4d4;
}

:deep(.hljs-keyword) {
  color: #569cd6;
}

:deep(.hljs-string) {
  color: #ce9178;
}

:deep(.hljs-number) {
  color: #b5cea8;
}

:deep(.hljs-comment) {
  color: #6a9955;
  font-style: italic;
}

:deep(.hljs-function) {
  color: #dcdcaa;
}

:deep(.hljs-class),
:deep(.hljs-title) {
  color: #4ec9b0;
}

:deep(.hljs-variable) {
  color: #9cdcfe;
}

:deep(.hljs-built_in) {
  color: #4ec9b0;
}

:deep(.hljs-params) {
  color: #9cdcfe;
}
</style>
