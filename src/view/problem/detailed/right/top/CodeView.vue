<script setup lang="ts">
import { computed, ref, watch } from "vue";
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
import type { ProblemLanguageOption } from "@/mocks/schema/problem-detail";
import {
  AlignLeft,
  Bookmark,
  RotateCcw,
  Maximize2,
  Scan,
  CheckIcon,
  CodeIcon,
} from "lucide-vue-next";

const props = defineProps<{
  languages: ProblemLanguageOption[];
  starterNotes: string[];
}>();

const activeLanguageValue = ref(props.languages[0]?.value ?? "");
const code = ref("");
const prefersDark = usePreferredDark();

const languageMeta = computed(() =>
  props.languages.find((lang) => lang.value === activeLanguageValue.value)
);

const editorLanguage = computed(
  () => languageMeta.value?.value ?? "typescript"
);
const editorTheme = computed(() =>
  prefersDark.value ? "vs-dark" : "vs-light"
);
const activeLanguageLabel = computed(
  () => languageMeta.value?.label ?? "Select language"
);

watch(
  () => activeLanguageValue.value,
  (value) => {
    const target = props.languages.find((lang) => lang.value === value);
    if (target) {
      code.value = target.starterCode;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Tab Header -->
    <header class="flex items-center border-b">
      <div
        class="flex items-center gap-1.5 border-b-2 border-green-500 px-3 py-2"
      >
        <div class="relative text-[14px] leading-none text-green-500">
          <CodeIcon class="h-3.5 w-3.5" />
        </div>
        <div class="relative">
          <div class="whitespace-nowrap text-sm font-medium">代码</div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex flex-col gap-2 p-2 flex-1 min-h-0">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <NavigationMenu :viewport="false">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger class="h-8 px-3 py-1 text-xs font-medium">
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
    </main>
  </div>
</template>
