<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import loader from "@monaco-editor/loader";

const props = defineProps<{
  modelValue: string;
  language: string;
  theme?: "vs-dark" | "vs-light";
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const container = ref<HTMLDivElement | null>(null);
let editor: import("monaco-editor").editor.IStandaloneCodeEditor | null = null;
let monacoInstance: typeof import("monaco-editor") | null = null;
let monacoPromise: Promise<typeof import("monaco-editor")> | null = null;
const globalMonacoKey = "__ULTICODE_MONACO__";

const getMonaco = async () => {
  const globalScope =
    typeof window !== "undefined" ? (window as unknown as Record<string, any>) : null;
  if (monacoInstance) return monacoInstance;
  const cached =
    globalScope?.[globalMonacoKey] ??
    (globalScope?.monaco && globalScope.monaco.editor ? globalScope.monaco : null);
  if (cached) {
    monacoInstance = cached;
    return monacoInstance;
  }
  const globalRequire = globalScope?.require as any;
  if (globalRequire?.defined?.("vs/editor/editor.main")) {
    return new Promise<typeof import("monaco-editor")>((resolve) => {
      globalRequire(["vs/editor/editor.main"], (monaco: typeof import("monaco-editor")) => {
        monacoInstance = monaco;
        if (globalScope) {
          globalScope[globalMonacoKey] = monaco;
          globalScope.monaco = monaco;
        }
        resolve(monaco);
      });
    });
  }
  if (!monacoPromise) {
    monacoPromise = loader.init().then((instance) => {
      monacoInstance = instance;
      if (globalScope) {
        globalScope[globalMonacoKey] = instance;
        globalScope.monaco = instance;
      }
      return instance;
    });
  }
  return monacoPromise;
};

const disposeEditor = () => {
  if (editor) {
    editor.dispose();
    editor = null;
  }
};

onMounted(async () => {
  if (typeof window === "undefined" || !container.value) return;

  const monaco = await getMonaco();
  editor = monaco.editor.create(container.value, {
    value: props.modelValue,
    language: props.language,
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 13,
    lineNumbers: "on",
    theme: props.theme ?? "vs-dark",
  });

  editor.onDidChangeModelContent(() => {
    if (!editor) return;
    const nextValue = editor.getValue();
    emit("update:modelValue", nextValue);
  });
});

watch(
  () => props.modelValue,
  (value) => {
    if (!editor) return;
    const current = editor.getValue();
    if (value !== current) {
      editor.setValue(value);
    }
  },
);

watch(
  () => props.language,
  async (language) => {
    if (!editor) return;
    const monaco = await getMonaco();
    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, language);
    }
  },
);

watch(
  () => props.theme,
  async (theme) => {
    if (!editor || !theme) return;
    const monaco = await getMonaco();
    monaco.editor.setTheme(theme);
  },
);

onBeforeUnmount(() => {
  disposeEditor();
});
</script>

<template>
  <div
    ref="container"
    class="h-full w-full rounded-lg border bg-background/60"
  />
</template>
