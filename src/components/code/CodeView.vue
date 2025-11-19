<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import hljs from 'highlight.js/lib/core'
import type { LanguageFn } from 'highlight.js'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import cpp from 'highlight.js/lib/languages/cpp'
import java from 'highlight.js/lib/languages/java'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import csharp from 'highlight.js/lib/languages/csharp'
import kotlin from 'highlight.js/lib/languages/kotlin'
import swift from 'highlight.js/lib/languages/swift'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-vue-next'

const languages: Array<[string, LanguageFn]> = [
  ['javascript', javascript],
  ['typescript', typescript],
  ['python', python],
  ['cpp', cpp],
  ['java', java],
  ['go', go],
  ['rust', rust],
  ['csharp', csharp],
  ['kotlin', kotlin],
  ['swift', swift],
]

languages.forEach(([name, loader]) => {
  hljs.registerLanguage(name, loader)
})

const props = defineProps<{
  code: string
  language?: string
}>()

const copied = ref(false)
let copyTimeout: ReturnType<typeof setTimeout> | null = null

const normalizedCode = computed(() => props.code?.trimEnd() ?? '')

const normalizeLanguageKey = (value?: string) => {
  if (!value) return ''
  return value.toLowerCase().replace(/\s+/g, '').replace(/\+\+/g, 'pp').replace(/#/g, 'sharp')
}

const languageAliases: Record<string, string> = {
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  python: 'python',
  python3: 'python',
  py: 'python',
  java: 'java',
  kotlin: 'kotlin',
  swift: 'swift',
  go: 'go',
  golang: 'go',
  rust: 'rust',
  cpp: 'cpp',
  'c++': 'cpp',
  cplusplus: 'cpp',
  csharp: 'csharp',
}

const highlightLanguage = computed(
  () => languageAliases[normalizeLanguageKey(props.language)] ?? null,
)

const highlightedCode = computed(() => {
  if (!normalizedCode.value) return ''
  try {
    if (highlightLanguage.value) {
      return hljs.highlight(normalizedCode.value, {
        language: highlightLanguage.value,
      }).value
    }
    return hljs.highlightAuto(normalizedCode.value).value
  } catch (error) {
    console.warn('Failed to highlight code', error)
    return normalizedCode.value
  }
})

const languageLabel = computed(() => props.language ?? highlightLanguage.value ?? 'Code snippet')

const handleCopy = async () => {
  if (!normalizedCode.value || typeof navigator === 'undefined' || !navigator.clipboard) return
  try {
    await navigator.clipboard.writeText(normalizedCode.value)
    copied.value = true
    if (copyTimeout) clearTimeout(copyTimeout)
    copyTimeout = setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch (error) {
    console.warn('Unable to copy code snippet', error)
  }
}

watch(
  () => props.code,
  () => {
    copied.value = false
    if (copyTimeout) {
      clearTimeout(copyTimeout)
      copyTimeout = null
    }
  },
)

onBeforeUnmount(() => {
  if (copyTimeout) {
    clearTimeout(copyTimeout)
    copyTimeout = null
  }
})
</script>

<template>
  <div class="border border-border bg-card text-sm">
    <header
      class="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3 py-2"
    >
      <span
        class="font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
      >
        {{ languageLabel }}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        class="h-7 w-7 rounded-none text-muted-foreground hover:text-foreground"
        @click="handleCopy"
      >
        <Check v-if="copied" class="h-4 w-4 text-emerald-500" />
        <Copy v-else class="h-4 w-4" />
      </Button>
    </header>

    <pre
      class="m-0 block h-full w-full overflow-auto bg-card px-4 py-3 font-mono text-[13px] leading-6"
    >
      <code class="hljs block h-full w-full" v-html="highlightedCode" />
    </pre>
  </div>
</template>
