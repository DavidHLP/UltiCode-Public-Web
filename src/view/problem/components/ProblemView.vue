<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Problem } from "@/mocks/schema/problem";
import { computed, onMounted, ref, watch, type Ref } from "vue";
import {
  CheckCircle2,
  FileEdit,
  Search,
  ListFilter,
  X,
  ChevronDown,
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
import { fetchProblems } from "@/api/problem";

const props = defineProps<{
  problems?: Problem[];
}>();

const searchQuery = ref("");
const selectedTags = ref<string[]>([]);
const selectedStatus = ref<string[]>([]);
const selectedDifficulty = ref<string[]>([]);
const showPremium = ref<boolean | null>(null);
const problemsPerPage = 50;
const numProblemsToShow = ref(problemsPerPage);
const fallbackProblems = ref<Problem[]>([]);

onMounted(async () => {
  try {
    fallbackProblems.value = await fetchProblems();
  } catch (error) {
    console.error("Failed to load problems", error);
    fallbackProblems.value = [];
  }
});

const sourceProblems = computed(() => props.problems ?? fallbackProblems.value);

// 搜索变化时，重置展示数量
watch(searchQuery, () => {
  numProblemsToShow.value = problemsPerPage;
});

const filteredProblems = computed(() => {
  return sourceProblems.value.filter((p) => {
    const searchMatch =
      !searchQuery.value ||
      p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.id.toString().includes(searchQuery.value);
    const tagMatch =
      selectedTags.value.length === 0 ||
      selectedTags.value.some((tag) => p.tags.includes(tag));
    const statusMatch =
      selectedStatus.value.length === 0 ||
      selectedStatus.value.includes(p.status);
    const difficultyMatch =
      selectedDifficulty.value.length === 0 ||
      selectedDifficulty.value.includes(p.difficulty);
    const premiumMatch =
      showPremium.value === null || p.isPremium === showPremium.value;

    return (
      searchMatch && tagMatch && statusMatch && difficultyMatch && premiumMatch
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
  sourceProblems.value.forEach((p) => p.tags.forEach((t) => tags.add(t)));
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

function pickOne() {
  const problems = filteredProblems.value;
  if (problems.length > 0) {
    const randomIndex = Math.floor(Math.random() * problems.length);
    const problem = problems[randomIndex];
    if (problem) {
      alert(`Let's try: ${problem.id}. ${problem.title}`);
    }
  } else {
    alert("No problems to pick from. Try clearing your filters.");
  }
}

function loadMore() {
  if (numProblemsToShow.value < totalFilteredProblems.value) {
    numProblemsToShow.value += problemsPerPage;
  }
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <slot name="header" />
    <header class="flex items-center gap-2">
      <div class="relative w-full max-w-sm">
        <Search
          class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
        />
        <Input
          v-model="searchQuery"
          placeholder="Search problems..."
          class="pl-9"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="gap-2">
            <ListFilter class="h-4 w-4" />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-56">
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            :checked="selectedStatus.includes('solved')"
            @click="
              () => toggleStatusSolved(!selectedStatus.includes('solved'))
            "
          >
            <span class="flex items-center">
              <span class="w-4 h-4 mr-2">
                <CheckIcon
                  v-if="selectedStatus.includes('solved')"
                  class="h-4 w-4"
                />
              </span>
              Solved
            </span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            :checked="selectedStatus.includes('attempted')"
            @click="
              () => toggleStatusAttempted(!selectedStatus.includes('attempted'))
            "
          >
            <span class="flex items-center">
              <span class="w-4 h-4 mr-2">
                <CheckIcon
                  v-if="selectedStatus.includes('attempted')"
                  class="h-4 w-4"
                />
              </span>
              Attempted
            </span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            :checked="selectedStatus.includes('todo')"
            @click="() => toggleStatusTodo(!selectedStatus.includes('todo'))"
          >
            <span class="flex items-center">
              <span class="w-4 h-4 mr-2">
                <CheckIcon
                  v-if="selectedStatus.includes('todo')"
                  class="h-4 w-4"
                />
              </span>
              Todo
            </span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Difficulty</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            :checked="selectedDifficulty.includes('Easy')"
            @click="
              () => toggleDifficultyEasy(!selectedDifficulty.includes('Easy'))
            "
          >
            <span class="flex items-center">
              <span class="w-4 h-4 mr-2">
                <CheckIcon
                  v-if="selectedDifficulty.includes('Easy')"
                  class="h-4 w-4"
                />
              </span>
              Easy
            </span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            :checked="selectedDifficulty.includes('Medium')"
            @click="
              () =>
                toggleDifficultyMedium(!selectedDifficulty.includes('Medium'))
            "
          >
            <span class="flex items-center">
              <span class="w-4 h-4 mr-2">
                <CheckIcon
                  v-if="selectedDifficulty.includes('Medium')"
                  class="h-4 w-4"
                />
              </span>
              Medium
            </span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            :checked="selectedDifficulty.includes('Hard')"
            @click="
              () => toggleDifficultyHard(!selectedDifficulty.includes('Hard'))
            "
          >
            <span class="flex items-center">
              <span class="w-4 h-4 mr-2">
                <CheckIcon
                  v-if="selectedDifficulty.includes('Hard')"
                  class="h-4 w-4"
                />
              </span>
              Hard
            </span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Premium</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            :checked="showPremium === false"
            @click="() => togglePremiumFree(!(showPremium === false))"
          >
            <span class="flex items-center">
              <span class="w-4 h-4 mr-2">
                <CheckIcon v-if="showPremium === false" class="h-4 w-4" />
              </span>
              Free
            </span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            :checked="showPremium === true"
            @click="() => togglePremiumPremium(!(showPremium === true))"
          >
            <span class="flex items-center">
              <span class="w-4 h-4 mr-2">
                <CheckIcon v-if="showPremium === true" class="h-4 w-4" />
              </span>
              Premium
            </span>
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" @click="pickOne"> Pick One </Button>
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
        @click="clearFilters"
      >
        <X class="h-4 w-4" />
      </Button>
    </header>
    <Collapsible class="w-full space-y-2">
      <section class="flex flex-wrap items-center gap-2">
        <Badge
          v-for="tag in popularTags"
          :key="tag"
          :variant="isTagSelected(tag) ? 'default' : 'secondary'"
          class="cursor-pointer"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </Badge>
        <CollapsibleTrigger as-child>
          <Button variant="ghost" size="sm" class="gap-1">
            More
            <ChevronDown class="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </section>
      <CollapsibleContent class="flex flex-wrap gap-2">
        <Badge
          v-for="tag in otherTags"
          :key="tag"
          :variant="isTagSelected(tag) ? 'default' : 'secondary'"
          class="cursor-pointer"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </Badge>
      </CollapsibleContent>
    </Collapsible>
    <ProblemTable
      :displayed-problems="displayedProblems"
      :num-problems-to-show="numProblemsToShow"
      :total-filtered-problems="totalFilteredProblems"
      @load-more="loadMore"
    />
  </section>
</template>
