<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { usePreferredDark } from "@vueuse/core";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import CodeEditor from "@/view/problems/detailed/components/CodeEditor.vue";
import type { ProblemLanguageOption } from "@/mocks/schema/problem-detail";
import CheckIcon from "~icons/radix-icons/check";
import {
  AlignLeft,
  Bookmark,
  RotateCcw,
  Maximize2,
  Scan,
  ChevronDown,
} from "lucide-vue-next";

const props = defineProps<{
  languages: ProblemLanguageOption[];
  starterNotes: string[];
}>();

const activeLanguageValue = ref(props.languages[0]?.value ?? "");
const code = ref("");
const prefersDark = usePreferredDark();

const languageMeta = computed(() =>
  props.languages.find((lang) => lang.value === activeLanguageValue.value),
);

const editorLanguage = computed(
  () => languageMeta.value?.value ?? "typescript",
);
const editorTheme = computed(() =>
  prefersDark.value ? "vs-dark" : "vs-light",
);
const activeLanguageLabel = computed(
  () => languageMeta.value?.label ?? "Select language",
);

watch(
  () => activeLanguageValue.value,
  (value) => {
    const target = props.languages.find((lang) => lang.value === value);
    if (target) {
      code.value = target.starterCode;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex h-full flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <Menubar class="flex h-full items-center gap-2 p-0">
        <MenubarMenu>
          <MenubarTrigger class="flex items-center gap-2 px-2 py-1 text-xs">
            <span class="text-xs font-semibold">
              {{ activeLanguageLabel }}
            </span>
            <ChevronDown class="h-4 w-4" />
          </MenubarTrigger>
          <MenubarContent class="min-w-[200px] p-1">
            <MenubarItem
              v-for="language in props.languages"
              :key="language.id"
              class="flex items-center justify-between px-2 py-1 text-xs"
              @click="activeLanguageValue = language.value"
            >
              <span class="flex items-center gap-2">
                <CheckIcon
                  class="h-3.5 w-3.5"
                  :class="
                    language.value === activeLanguageValue
                      ? 'opacity-100'
                      : 'opacity-0'
                  "
                />
                {{ language.label }}
              </span>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div class="flex h-full items-center gap-1 text-muted-foreground">
        <Button variant="ghost" size="icon" class="h-7 w-7">
          <AlignLeft class="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" class="h-7 w-7">
          <Bookmark class="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" class="h-7 w-7">
          <RotateCcw class="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" class="h-7 w-7">
          <Maximize2 class="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" class="h-7 w-7">
          <Scan class="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>

    <CodeEditor
      v-model="code"
      :language="editorLanguage"
      :theme="editorTheme"
      class="flex-1 min-h-0"
    />
  </div>
</template>
