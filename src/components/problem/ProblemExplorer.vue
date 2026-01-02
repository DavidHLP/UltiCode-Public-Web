<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Problem } from "@/types/problem";

import { computed, onMounted, ref, watch, type Ref, markRaw } from "vue";
import {
  CheckCircle2,
  FileEdit,
  Search,
  ListFilter,
  X,
  ChevronDown,
  CircleDot,
} from "lucide-vue-next";
import CheckIcon from "~icons/radix-icons/check";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import ProblemTable from "./ProblemTable.vue";
import { fetchProblems, fetchRandomProblem } from "@/api/problem";
import { toast } from "vue-sonner";
import { fetchCurrentUserId } from "@/utils/auth";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import type { ProblemExplorerProps } from "./type";

const router = useRouter();
const { t } = useI18n();

const props = defineProps<ProblemExplorerProps>();

const emit = defineEmits<{
  remove: [problem: Problem];
}>();

const searchQuery = ref("");
const selectedTags = ref<string[]>([]);
const selectedStatus = ref<string[]>([]);
const selectedDifficulty = ref<string[]>([]);
const showPremium = ref<boolean | null>(null);
const problemsPerPage = 50;
const numProblemsToShow = ref(problemsPerPage);
const fallbackProblems = ref<Problem[]>([]);

import { PROBLEM_CATEGORIES } from "@/constants/problem-categories";

const categories = PROBLEM_CATEGORIES;

const selectedCategory = ref(props.initialCategory || "all");

watch(
  () => props.initialCategory,
  (newVal) => {
    selectedCategory.value = newVal || "all";
    void loadProblems();
  },
);

function selectCategory(cat: string) {
  selectedCategory.value = cat;
  void loadProblems();
}

const loadProblems = async () => {
  try {
    const userId = fetchCurrentUserId();
    fallbackProblems.value = await fetchProblems(userId ?? undefined, {
      category: selectedCategory.value,
    });
  } catch (error) {
    console.error("Failed to load problems", error);
    fallbackProblems.value = [];
  }
};

onMounted(() => {
  void loadProblems();
});

const sourceProblems = computed(() => props.problems ?? fallbackProblems.value);
const enrichedProblems = computed(() => {
  const enriched = sourceProblems.value.map((p) => {
    const status = p.status ?? "todo";
    const icon =
      status === "solved"
        ? markRaw(CheckCircle2)
        : status === "attempted"
          ? markRaw(CircleDot)
          : undefined;

    return {
      ...p,
      status,
      statusIcon: icon,
    };
  });
  return enriched;
});

// 搜索变化时，重置展示数量
watch(searchQuery, () => {
  numProblemsToShow.value = problemsPerPage;
});

const filteredProblems = computed(() => {
  return enrichedProblems.value.filter((p) => {
    const searchMatch =
      !searchQuery.value ||
      p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.id.toString().includes(searchQuery.value);
    const tagMatch =
      selectedTags.value.length === 0 ||
      selectedTags.value.some((tag) => p.tags.includes(tag));
    const statusMatch =
      selectedStatus.value.length === 0 ||
      (p.status && selectedStatus.value.includes(p.status));
    const difficultyMatch =
      selectedDifficulty.value.length === 0 ||
      selectedDifficulty.value.includes(p.difficulty);
    const premiumMatch =
      showPremium.value === null || p.isPremium === showPremium.value;

    const categoryConfig = PROBLEM_CATEGORIES.find(
      (c) => c.value === selectedCategory.value,
    );
    const categoryMatch =
      selectedCategory.value === "all" ||
      !categoryConfig ||
      (p.tags && p.tags.includes(categoryConfig.name));

    return (
      searchMatch &&
      tagMatch &&
      statusMatch &&
      difficultyMatch &&
      premiumMatch &&
      categoryMatch
    );
  });
});

const totalFilteredProblems = computed(() => filteredProblems.value.length);

const displayedProblems = computed(() => {
  return filteredProblems.value.slice(0, numProblemsToShow.value).map((p) => ({
    ...p,
    statusIcon:
      p.status === "solved"
        ? CheckCircle2
        : p.status === "attempted"
          ? FileEdit
          : undefined,
  }));
});

const allTags = computed(() => {
  const tags = new Set<string>();
  enrichedProblems.value.forEach((p) => p.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
});

const popularTags = ref([
  "Array",
  "Hash Table",
  "String",
  "Math",
  "Dynamic Programming",
  "Sorting",
]);
const otherTags = computed(() =>
  allTags.value.filter((t) => !popularTags.value.includes(t)),
);

function toggleStatusSolved(checked: boolean) {
  toggleFilter(selectedStatus, "solved", checked);
}
function toggleStatusAttempted(checked: boolean) {
  toggleFilter(selectedStatus, "attempted", checked);
}
function toggleStatusTodo(checked: boolean) {
  toggleFilter(selectedStatus, "todo", checked);
}
function toggleDifficultyEasy(checked: boolean) {
  toggleFilter(selectedDifficulty, "Easy", checked);
}
function toggleDifficultyMedium(checked: boolean) {
  toggleFilter(selectedDifficulty, "Medium", checked);
}
function toggleDifficultyHard(checked: boolean) {
  toggleFilter(selectedDifficulty, "Hard", checked);
}
function togglePremiumFree(checked: boolean) {
  togglePremiumFilter(false, checked);
}
function togglePremiumPremium(checked: boolean) {
  togglePremiumFilter(true, checked);
}

function toggleFilter(
  targetArray: Ref<string[]>,
  item: string,
  checked: boolean,
) {
  const currentItems = targetArray.value;
  const isPresent = currentItems.includes(item);

  if (checked && !isPresent) {
    targetArray.value = [...currentItems, item];
  } else if (!checked && isPresent) {
    targetArray.value = currentItems.filter((i) => i !== item);
  }
  numProblemsToShow.value = problemsPerPage;
}

function togglePremiumFilter(value: boolean, checked: boolean) {
  if (checked) {
    showPremium.value = value;
  } else {
    if (showPremium.value === value) {
      showPremium.value = null;
    }
  }
  numProblemsToShow.value = problemsPerPage;
}

function toggleTag(tag: string) {
  const index = selectedTags.value.indexOf(tag);
  toggleFilter(selectedTags, tag, index === -1);
}

function isTagSelected(tag: string) {
  return selectedTags.value.includes(tag);
}

function clearFilters() {
  searchQuery.value = "";
  selectedTags.value = [];
  selectedStatus.value = [];
  selectedDifficulty.value = [];
  showPremium.value = null;
  numProblemsToShow.value = problemsPerPage;
}

async function pickOne() {
  // Pick from current filtered problems if available
  const currentProblems = filteredProblems.value;
  if (currentProblems.length > 0) {
    const randomIndex = Math.floor(Math.random() * currentProblems.length);
    const problem = currentProblems[randomIndex];
    if (problem && problem.slug) {
      await router.push(`/problems/${problem.slug}`);
    }
    return;
  }

  // Fallback to fetch random from backend if no filtered problems
  try {
    const problem = await fetchRandomProblem();
    if (problem) {
      await router.push(`/problems/${problem.slug}`);
    } else {
      toast.error(t("problem.explorer.noProblemsAvailable"));
    }
  } catch (error) {
    console.error("Failed to fetch random problem", error);
    toast.error(t("problem.explorer.failedToPickRandom"));
  }
}

function loadMore() {
  if (numProblemsToShow.value < totalFilteredProblems.value) {
    numProblemsToShow.value += problemsPerPage;
  }
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <slot name="header" />

    <div class="space-y-4">
      <!-- Category Toggles -->
      <div class="flex flex-wrap gap-2 mb-2">
        <button
          v-for="cat in categories"
          :key="cat.name"
          @click="selectCategory(cat.value)"
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
          :class="
            selectedCategory === cat.value
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'
          "
        >
          <div
            class="p-1 rounded bg-white dark:bg-zinc-950 shadow-sm"
            :class="
              selectedCategory === cat.value ? 'text-primary' : 'text-zinc-400'
            "
          >
            <component :is="cat.icon" class="w-3 h-3" />
          </div>
          {{ t("problem.categories." + cat.value) }}
        </button>
      </div>

      <!-- Controls Bar -->
      <div
        class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <!-- Left: Search -->
        <div class="relative w-full max-w-md">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            v-model="searchQuery"
            :placeholder="t('problem.list.searchPlaceholder')"
            class="pl-9 h-10 rounded-full"
          />
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="outline"
                class="h-10 gap-2 border-dashed rounded-full"
              >
                <ListFilter class="h-4 w-4" />
                {{ t("problem.explorer.filters") }}
                <Badge
                  v-if="
                    selectedStatus.length +
                      selectedDifficulty.length +
                      (showPremium !== null ? 1 : 0) >
                    0
                  "
                  variant="secondary"
                  class="ml-1 h-5 px-1 text-[10px] rounded-full"
                >
                  {{
                    selectedStatus.length +
                    selectedDifficulty.length +
                    (showPremium !== null ? 1 : 0)
                  }}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56" align="end">
              <DropdownMenuLabel>{{
                t("problem.explorer.status")
              }}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                :checked="selectedStatus.includes('solved')"
                @click="
                  () => toggleStatusSolved(!selectedStatus.includes('solved'))
                "
              >
                <span class="flex items-center w-full">
                  {{ t("problem.status.solved") }}
                  <CheckIcon
                    v-if="selectedStatus.includes('solved')"
                    class="ml-auto h-4 w-4"
                  />
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                :checked="selectedStatus.includes('attempted')"
                @click="
                  () =>
                    toggleStatusAttempted(!selectedStatus.includes('attempted'))
                "
              >
                <span class="flex items-center w-full">
                  {{ t("problem.status.attempted") }}
                  <CheckIcon
                    v-if="selectedStatus.includes('attempted')"
                    class="ml-auto h-4 w-4"
                  />
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                :checked="selectedStatus.includes('todo')"
                @click="
                  () => toggleStatusTodo(!selectedStatus.includes('todo'))
                "
              >
                <span class="flex items-center w-full">
                  {{ t("problem.status.todo") }}
                  <CheckIcon
                    v-if="selectedStatus.includes('todo')"
                    class="ml-auto h-4 w-4"
                  />
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{{
                t("problem.explorer.difficulty")
              }}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                :checked="selectedDifficulty.includes('Easy')"
                @click="
                  () =>
                    toggleDifficultyEasy(!selectedDifficulty.includes('Easy'))
                "
              >
                <span class="flex items-center w-full">
                  {{ t("problem.difficulty.easy") }}
                  <CheckIcon
                    v-if="selectedDifficulty.includes('Easy')"
                    class="ml-auto h-4 w-4"
                  />
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                :checked="selectedDifficulty.includes('Medium')"
                @click="
                  () =>
                    toggleDifficultyMedium(
                      !selectedDifficulty.includes('Medium'),
                    )
                "
              >
                <span class="flex items-center w-full">
                  {{ t("problem.difficulty.medium") }}
                  <CheckIcon
                    v-if="selectedDifficulty.includes('Medium')"
                    class="ml-auto h-4 w-4"
                  />
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                :checked="selectedDifficulty.includes('Hard')"
                @click="
                  () =>
                    toggleDifficultyHard(!selectedDifficulty.includes('Hard'))
                "
              >
                <span class="flex items-center w-full">
                  {{ t("problem.difficulty.hard") }}
                  <CheckIcon
                    v-if="selectedDifficulty.includes('Hard')"
                    class="ml-auto h-4 w-4"
                  />
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{{
                t("problem.explorer.premium")
              }}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                :checked="showPremium === false"
                @click="() => togglePremiumFree(!(showPremium === false))"
              >
                <span class="flex items-center w-full">
                  {{ t("problem.explorer.free") }}
                  <CheckIcon
                    v-if="showPremium === false"
                    class="ml-auto h-4 w-4"
                  />
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                :checked="showPremium === true"
                @click="() => togglePremiumPremium(!(showPremium === true))"
              >
                <span class="flex items-center w-full">
                  {{ t("problem.explorer.premium") }}
                  <CheckIcon
                    v-if="showPremium === true"
                    class="ml-auto h-4 w-4"
                  />
                </span>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" class="h-10 rounded-full" @click="pickOne">
            {{ t("problem.explorer.pickOne") }}
          </Button>

          <Button
            v-if="
              searchQuery ||
              selectedTags.length ||
              selectedStatus.length ||
              selectedDifficulty.length ||
              showPremium !== null
            "
            variant="ghost"
            size="icon"
            class="h-10 w-10 rounded-full"
            @click="clearFilters"
            :aria-label="
              t('common.actions.clear') + ' ' + t('problem.explorer.filters')
            "
          >
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- Tags Section -->
      <Collapsible class="w-full space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <Badge
            v-for="tag in popularTags"
            :key="tag"
            :variant="isTagSelected(tag) ? 'default' : 'outline'"
            class="cursor-pointer px-3 py-1 hover:bg-primary/80 hover:text-primary-foreground transition-colors rounded-md"
            :class="{
              'bg-primary text-primary-foreground hover:bg-primary/90':
                isTagSelected(tag),
            }"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </Badge>
          <CollapsibleTrigger as-child>
            <Button
              variant="ghost"
              size="sm"
              class="gap-1 h-7 text-xs text-muted-foreground hover:text-foreground rounded-full"
            >
              {{ t("problem.explorer.showMoreTags") }}
              <ChevronDown class="h-3 w-3" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent class="animate-slide-down">
          <div class="flex flex-wrap gap-2 pt-2">
            <Badge
              v-for="tag in otherTags"
              :key="tag"
              variant="outline"
              class="cursor-pointer px-2.5 py-0.5 text-[11px] font-normal border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-md"
              :class="{
                'bg-zinc-900 text-zinc-50 border-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900':
                  isTagSelected(tag),
              }"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </Badge>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>

    <ProblemTable
      :displayed-problems="displayedProblems"
      :num-problems-to-show="numProblemsToShow"
      :total-filtered-problems="totalFilteredProblems"
      :editable="props.editable"
      @load-more="loadMore"
      @remove="(problem) => emit('remove', problem)"
    />
  </section>
</template>
