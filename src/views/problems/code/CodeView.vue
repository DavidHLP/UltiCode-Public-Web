<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { usePreferredDark } from "@vueuse/core";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import CodeEditor from "./components/CodeEditor.vue";
import type { ProblemLanguageOption } from "@/types/problem-detail";
import {
  AlignLeft,
  RotateCcw,
  Maximize2,
  Scan,
  CheckIcon,
  Wand2,
} from "lucide-vue-next";
import { problemHooks } from "@/hooks/problem-hooks";
import { useProblemEditorStore } from "@/stores/problemEditorStore";

const props = defineProps<{
  languages: ProblemLanguageOption[];
  starterNotes: string[];
}>();

const prefersDark = usePreferredDark();
const editorStore = useProblemEditorStore();

const activeLanguageValue = ref(props.languages[0]?.value ?? "");
const code = ref("");
const editorContainer = ref<HTMLElement | null>(null);
const editorRef = ref<InstanceType<typeof CodeEditor> | null>(null);
const isWordWrapEnabled = ref(false);
const isMinimapVisible = ref(false);
const isFullscreen = ref(false);

const languageMeta = computed(() =>
  props.languages.find((lang) => lang.value === activeLanguageValue.value),
);

// Check if current language has a companion style (e.g. JS if current is TS)
const companionLanguage = computed(() => {
  if (!languageMeta.value?.style) return null;
  const otherStyle =
    languageMeta.value.style === "typescript" ? "javascript" : "typescript";
  return props.languages.find((lang) => lang.style === otherStyle);
});

const editorLanguage = computed(
  () => languageMeta.value?.value ?? "typescript",
);
const editorTheme = computed(() =>
  prefersDark.value ? "vs-dark" : "vs-light",
);
const activeLanguageLabel = computed(() => {
  if (languageMeta.value?.style) {
    return languageMeta.value.style === "typescript"
      ? "TypeScript"
      : "JavaScript";
  }
  return languageMeta.value?.label ?? "Select language";
});
const starterCode = computed(() => languageMeta.value?.starterCode ?? "");
const canReset = computed(() => code.value !== starterCode.value);

const toggleWordWrap = () => {
  isWordWrapEnabled.value = !isWordWrapEnabled.value;
};

const toggleMinimap = () => {
  isMinimapVisible.value = !isMinimapVisible.value;
};

const handleReset = () => {
  code.value = starterCode.value;
};

const setLanguageByStyle = (style: string) => {
  const target = props.languages.find((lang) => lang.style === style);
  if (target) {
    activeLanguageValue.value = target.value;
  }
};

const handleFormat = async () => {
  await editorRef.value?.formatDocument?.();
};

const handleFullscreenToggle = async () => {
  if (typeof document === "undefined") return;
  if (!document.fullscreenElement) {
    await editorContainer.value?.requestFullscreen?.();
    return;
  }
  await document.exitFullscreen?.();
};

const handleFullscreenChange = () => {
  if (typeof document === "undefined") return;
  isFullscreen.value = Boolean(document.fullscreenElement);
};

onMounted(() => {
  if (typeof document === "undefined") return;
  document.addEventListener("fullscreenchange", handleFullscreenChange);
});

onBeforeUnmount(() => {
  if (typeof document === "undefined") return;
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
});

watch(
  () => activeLanguageValue.value,
  (value, previous) => {
    const target = props.languages.find((lang) => lang.value === value);
    if (target) {
      code.value = target.starterCode;
    }
    if (value) {
      editorStore.setLanguage(value);
    }
    if (previous !== undefined && value !== previous) {
      void problemHooks.emit("problem:code:language:change", {
        from: previous,
        to: value,
      });
    }
  },
  { immediate: true },
);

watch(
  () => code.value,
  (value) => {
    editorStore.setCode(value);
  },
  { immediate: true },
);
</script>

<template>
  <div ref="editorContainer" class="h-full w-full flex flex-col">
    <!-- Tab Header -->
    <!-- Tab Header Removed -->

    <!-- Main Content Area -->
    <main class="flex flex-col gap-1 p-1 flex-1 min-h-0">
      <div class="flex flex-wrap items-center justify-between gap-1">
        <div class="flex items-center gap-1">
          <NavigationMenu :viewport="false">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  class="h-8 px-3 py-1 text-xs font-medium"
                >
                  {{ activeLanguageLabel }}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul class="grid w-[200px] gap-1 p-2">
                    <li v-for="language in props.languages" :key="language.id">
                      <NavigationMenuLink as-child>
                        <a
                          href="#"
                          class="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium hover:bg-accent"
                          @click.prevent="activeLanguageValue = language.value"
                        >
                          <CheckIcon
                            class="h-3.5 w-3.5"
                            :class="
                              language.value === activeLanguageValue
                                ? 'opacity-100'
                                : 'opacity-0'
                            "
                          />
                          {{ language.label }}
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <!-- TS/JS Style Toggle -->
          <div
            v-if="companionLanguage"
            class="flex items-center bg-muted rounded-md p-0.5 h-8"
          >
            <Button
              variant="ghost"
              size="sm"
              class="h-7 px-2 text-[10px] uppercase font-bold transition-all"
              :class="
                languageMeta?.style === 'javascript'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground'
              "
              @click="setLanguageByStyle('javascript')"
            >
              JS
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="h-7 px-2 text-[10px] uppercase font-bold transition-all"
              :class="
                languageMeta?.style === 'typescript'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground'
              "
              @click="setLanguageByStyle('typescript')"
            >
              TS
            </Button>
          </div>
        </div>

        <div class="flex h-full items-center gap-1 text-muted-foreground">
          <Button
            variant="ghost"
            size="icon"
            class="h-7 w-7"
            :aria-pressed="isWordWrapEnabled"
            title="Toggle word wrap"
            @click="toggleWordWrap"
          >
            <AlignLeft class="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="h-7 w-7"
            title="Format code"
            @click="handleFormat"
          >
            <Wand2 class="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="h-7 w-7"
            :disabled="!canReset"
            title="Reset to starter code"
            @click="handleReset"
          >
            <RotateCcw class="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="h-7 w-7"
            :aria-pressed="isFullscreen"
            title="Toggle fullscreen"
            @click="handleFullscreenToggle"
          >
            <Maximize2 class="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="h-7 w-7"
            :aria-pressed="isMinimapVisible"
            title="Toggle minimap"
            @click="toggleMinimap"
          >
            <Scan class="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <CodeEditor
        ref="editorRef"
        v-model="code"
        :language="editorLanguage"
        :theme="editorTheme"
        :word-wrap="isWordWrapEnabled"
        :minimap="isMinimapVisible"
        class="flex-1 min-h-0"
      />
    </main>
  </div>
</template>
