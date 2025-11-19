<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import loader from '@monaco-editor/loader'

const props = defineProps<{
  modelValue: string
  language: string
  theme?: 'vs-dark' | 'vs-light'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const container = ref<HTMLDivElement | null>(null)
let editor: import('monaco-editor').editor.IStandaloneCodeEditor | null = null

const disposeEditor = () => {
  if (editor) {
    editor.dispose()
    editor = null
  }
}

onMounted(async () => {
  if (typeof window === 'undefined' || !container.value) return

  const monaco = await loader.init()
  editor = monaco.editor.create(container.value, {
    value: props.modelValue,
    language: props.language,
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 13,
    lineNumbers: 'on',
    theme: props.theme ?? 'vs-dark',
  })

  editor.onDidChangeModelContent(() => {
    if (!editor) return
    const nextValue = editor.getValue()
    emit('update:modelValue', nextValue)
  })
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editor) return
    const current = editor.getValue()
    if (value !== current) {
      editor.setValue(value)
    }
  },
)

watch(
  () => props.language,
  async (language) => {
    if (!editor) return
    const monaco = await loader.init()
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, language)
    }
  },
)

watch(
  () => props.theme,
  async (theme) => {
    if (!editor || !theme) return
    const monaco = await loader.init()
    monaco.editor.setTheme(theme)
  },
)

onBeforeUnmount(() => {
  disposeEditor()
})
</script>

<template>
  <div ref="container" class="h-full w-full rounded-lg border bg-background/60" />
</template>
