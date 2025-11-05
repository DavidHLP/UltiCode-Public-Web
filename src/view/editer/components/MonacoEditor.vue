<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Props {
  modelValue: string
  language?: string | null
  theme?: 'vs' | 'vs-dark' | 'hc-black' | string
  readOnly?: boolean
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'javascript',
  theme: 'vs-dark',
  readOnly: false,
  height: '100%',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

declare global {
  interface Window {
    require?: any
    monaco?: any
    MonacoEnvironment?: any
  }
}

const container = ref<HTMLDivElement | null>(null)
let editor: any = null
const ready = ref(false)

const computedHeight = computed(() => props.height ?? '100%')

const MONACO_BASE_URL = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min'
const MONACO_LOADER_URL = `${MONACO_BASE_URL}/vs/loader.js`

let loaderPromise: Promise<any> | null = null

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-src="${src}"]`)
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error(`脚本加载失败: ${src}`)))
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.dataset.src = src
    script.async = true
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = () => reject(new Error(`脚本加载失败: ${src}`))
    document.head.appendChild(script)
  })
}

function createWorkerUrl(): string {
  const workerMain = `${MONACO_BASE_URL}/vs/base/worker/workerMain.js`
  const script = `
    self.MonacoEnvironment = { baseUrl: '${MONACO_BASE_URL}/' };
    importScripts('${workerMain}');
  `
  return `data:text/javascript;charset=utf-8,${encodeURIComponent(script)}`
}

function ensureMonaco(): Promise<any> {
  if (window.monaco) {
    return Promise.resolve(window.monaco)
  }
  if (loaderPromise) {
    return loaderPromise
  }
  loaderPromise = new Promise(async (resolve, reject) => {
    try {
      if (!window.require) {
        await loadScript(MONACO_LOADER_URL)
      }
      const requireModule = window.require
      if (!requireModule) {
        reject(new Error('Monaco Loader 初始化失败'))
        return
      }
      if (!window.MonacoEnvironment) {
        window.MonacoEnvironment = {
          getWorkerUrl: () => createWorkerUrl(),
        }
      }
      requireModule.config({ paths: { vs: `${MONACO_BASE_URL}/vs` } })
      requireModule(
        ['vs/editor/editor.main'],
        () => {
          resolve(window.monaco)
        },
        (error: unknown) => {
          reject(error instanceof Error ? error : new Error('Monaco 主模块加载失败'))
        },
      )
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Monaco 编辑器初始化失败'))
    }
  })
  return loaderPromise
}

async function initializeEditor() {
  if (!container.value) {
    return
  }
  try {
    const monaco = await ensureMonaco()
    editor = monaco.editor.create(container.value, {
      value: props.modelValue ?? '',
      language: props.language ?? 'plaintext',
      theme: props.theme ?? 'vs-dark',
      readOnly: props.readOnly,
      automaticLayout: true,
      minimap: { enabled: false },
      smoothScrolling: true,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
      },
      padding: {
        top: 12,
        bottom: 12,
      },
    })
    editor.onDidChangeModelContent(() => {
      const value = editor?.getValue?.() ?? ''
      emit('update:modelValue', value)
    })
    ready.value = true
  } catch (error) {
    console.error(error)
    ready.value = false
  }
}

onMounted(() => {
  void initializeEditor()
})

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editor) {
      return
    }
    const current = editor.getValue()
    if (current !== value) {
      const selection = editor.getSelection()
      editor.setValue(value ?? '')
      if (selection) {
        editor.setSelection(selection)
      }
    }
  },
)

watch(
  () => props.language,
  (language) => {
    if (!editor || !language) {
      return
    }
    void ensureMonaco().then((monaco) => {
      const model = editor.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, language)
      }
    })
  },
)

watch(
  () => props.theme,
  (theme) => {
    if (!theme) {
      return
    }
    void ensureMonaco().then((monaco) => {
      monaco.editor.setTheme(theme)
    })
  },
)

watch(
  () => props.readOnly,
  (readOnly) => {
    if (!editor) {
      return
    }
    editor.updateOptions({ readOnly })
  },
)
</script>

<template>
  <div class="relative h-full w-full">
    <div
      ref="container"
      class="h-full w-full overflow-hidden rounded-lg border border-border/60 bg-secondary/40"
      :style="{ height: computedHeight }"
    />
    <div
      v-if="!ready"
      class="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-muted-foreground/80"
    >
      正在加载 Monaco 编辑器...
    </div>
  </div>
</template>
