<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { X } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBottomPanelStore } from "./bottom";
import type {
  ProblemTestCase,
  ProblemTestCaseInput,
} from "@/mocks/schema/problem-detail";

const props = defineProps<{
  testCases: ProblemTestCase[];
}>();

const activeId = ref("");
const localCases = ref<ProblemTestCase[]>([]);

const { activeCaseLabel } = useBottomPanelStore();

const generateId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

const createEmptyInputs = (
  template?: ProblemTestCase,
): ProblemTestCaseInput[] => {
  if (template?.inputs?.length) {
    return template.inputs.map((input) => ({
      ...input,
      value: "",
    }));
  }

  return [
    {
      id: generateId("input"),
      label: "input",
      value: "",
    },
  ];
};

watch(
  () => props.testCases,
  (cases) => {
    localCases.value = cases.map((testCase) => ({
      ...testCase,
      inputs: testCase.inputs?.map((input) => ({ ...input })) ?? [],
    }));
  },
  { immediate: true, deep: true },
);

watch(
  localCases,
  (cases) => {
    const firstCase = cases[0];

    if (!firstCase) {
      activeId.value = "";
      return;
    }

    const exists = cases.some((testCase) => testCase.id === activeId.value);
    if (!exists) {
      activeId.value = firstCase.id;
    }
  },
  { immediate: true, deep: true },
);

watch(activeCaseLabel, (label) => {
  if (!label || !localCases.value.length) return;
  const matched = localCases.value.find((testCase) => testCase.label === label);
  if (matched && matched.id !== activeId.value) {
    activeId.value = matched.id;
  }
});

const activeCase = computed(() => {
  if (!localCases.value.length) return undefined;
  return (
    localCases.value.find((t) => t.id === activeId.value) ?? localCases.value[0]
  );
});

watch(
  () => activeCase.value?.label,
  (label) => {
    activeCaseLabel.value = label ?? null;
  },
  { immediate: true },
);

const inputFields = computed(() => activeCase.value?.inputs ?? []);
const canRemoveCases = computed(() => localCases.value.length > 1);

const addCase = () => {
  const template = activeCase.value ?? localCases.value[0];
  const newId = generateId("case");
  const nextIndex = localCases.value.length + 1;

  const newCase: ProblemTestCase = {
    id: newId,
    label: `Case ${nextIndex}`,
    explanation: template?.explanation,
    inputs: createEmptyInputs(template),
  };

  localCases.value = [...localCases.value, newCase];
  activeId.value = newId;
};

const selectCase = (id: string) => {
  activeId.value = id;
};

const removeCase = (id: string) => {
  if (!canRemoveCases.value) return;
  localCases.value = localCases.value.filter((testCase) => testCase.id !== id);
};
</script>

<template>
  <div class="flex h-full flex-col gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <Button
        v-for="testCase in localCases"
        :key="testCase.id"
        :variant="testCase.id === activeId ? 'secondary' : 'ghost'"
        size="sm"
        class="h-7 rounded-md px-3 text-xs font-medium"
        :class="
          testCase.id === activeId
            ? 'text-foreground shadow-none'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="selectCase(testCase.id)"
      >
        <span>{{ testCase.label }}</span>
        <button
          v-if="testCase.id === activeId && canRemoveCases"
          type="button"
          class="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-md text-[10px] text-muted-foreground hover:text-foreground"
          @click.stop="removeCase(testCase.id)"
        >
          <X class="h-3 w-3" />
        </button>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        class="h-7 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
        @click="addCase"
      >
        +
      </Button>
    </div>

    <div v-if="activeCase" class="space-y-4 text-xs md:text-sm">
      <div class="space-y-2">
        <template v-if="inputFields.length">
          <div v-for="field in inputFields" :key="field.id" class="space-y-1">
            <div class="text-xs font-medium text-muted-foreground">
              {{ field.label }} =
            </div>
            <Input
              v-model="field.value"
              class="font-mono text-xs md:text-sm bg-muted border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </template>
        <p v-else class="text-muted-foreground">
          No predefined inputs for this case.
        </p>
      </div>
    </div>
  </div>
</template>
