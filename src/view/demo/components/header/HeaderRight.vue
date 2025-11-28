<script setup lang="ts">
import { computed } from "vue";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Layout, User, Check } from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

interface Props {
  currentLayout: 'preview' | 'leet' | 'classic' | 'compact' | 'wide';
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'layout-change': [layout: 'preview' | 'leet' | 'classic' | 'compact' | 'wide'];
}>();

// Layout options
const layoutOptions = [
  {
    id: "preview",
    label: "预设",
    value: "preview",
  },
  {
    id: "leet",
    label: "Leet",
    value: "leet",
  },
  {
    id: "classic",
    label: "经典",
    value: "classic",
  },
  {
    id: "compact",
    label: "紧凑",
    value: "compact",
  },
  {
    id: "wide",
    label: "宽屏",
    value: "wide",
  },
];

const selectedLayout = computed({
  get: () => props.currentLayout,
  set: (value: string) => {
    emit('layout-change', value as 'preview' | 'leet' | 'classic' | 'compact' | 'wide');
  },
});
</script>

<template>
  <div class="flex min-w-60 flex-1 items-center justify-end overflow-hidden">
    <div class="flex items-center overflow-hidden rounded focus:outline-none">
      <div class="relative group/nav-back flex items-center">
        <!-- Layout button with Dropdown Menu -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Layout"
              class="group flex-none cursor-pointer flex items-center h-8 transition-none hover:bg-gray-200 text-gray-600 w-8 focus:outline-none focus:ring-0 focus:ring-offset-0"
            >
              <Layout class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-96 p-4">
            <div class="space-y-3">
              <div class="text-sm font-semibold text-gray-900">布局</div>
              <DropdownMenuRadioGroup
                :model-value="selectedLayout"
                @update:model-value="(value) => emit('layout-change', value as 'preview' | 'leet' | 'classic' | 'compact' | 'wide')"
              >
                <div class="grid grid-cols-3 gap-4">
                  <DropdownMenuRadioItem
                    v-for="option in layoutOptions"
                    :key="option.id"
                    :value="option.value"
                    class="relative flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all duration-200 cursor-pointer data-[state=checked]:border-blue-500 data-[state=unchecked]:border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  >
                    <!-- Layout preview container -->
                    <div class="w-full aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 rounded-md flex items-center justify-center relative overflow-hidden border border-gray-200">
                      <!-- Selected indicator -->
                      <div
                        v-if="option.value === selectedLayout"
                        class="absolute inset-0 border-2 border-blue-500 rounded-md"
                      />
                      
                      <!-- Layout preview visualization -->
                      <div v-if="option.value === 'preview'" class="w-full h-full p-2 flex flex-col gap-1.5">
                        <div class="flex gap-1.5 flex-1">
                          <div class="flex-1 bg-white rounded border border-gray-300"></div>
                          <div class="flex-1 bg-white rounded border border-gray-300"></div>
                        </div>
                        <div class="flex-1 bg-white rounded border border-gray-300"></div>
                      </div>
                      <div v-else-if="option.value === 'leet'" class="w-full h-full p-2 flex flex-col gap-1.5">
                        <div class="flex-1 bg-white rounded border border-gray-300"></div>
                        <div class="flex gap-1.5 flex-1">
                          <div class="flex-1 bg-white rounded border border-gray-300"></div>
                          <div class="flex-1 bg-white rounded border border-gray-300"></div>
                        </div>
                      </div>
                      <div v-else-if="option.value === 'classic'" class="w-full h-full p-2 flex flex-col gap-1.5">
                        <div class="flex-1 bg-white rounded border border-gray-300"></div>
                        <div class="flex gap-1.5 flex-1">
                          <div class="flex-1 bg-white rounded border border-gray-300"></div>
                          <div class="flex-1 bg-white rounded border border-gray-300"></div>
                        </div>
                      </div>
                      <div v-else-if="option.value === 'compact'" class="w-full h-full p-2 flex flex-row gap-1.5">
                        <div class="flex flex-col gap-1.5 w-1/3">
                          <div class="flex-1 bg-white rounded border border-gray-300"></div>
                          <div class="flex-1 bg-white rounded border border-gray-300"></div>
                        </div>
                        <div class="flex-1 bg-white rounded border border-gray-300"></div>
                      </div>
                      <div v-else class="w-full h-full p-2 flex flex-row gap-1.5">
                        <div class="w-1/4 bg-white rounded border border-gray-300"></div>
                        <div class="flex-1 bg-white rounded border border-gray-300"></div>
                        <div class="w-1/4 bg-white rounded border border-gray-300"></div>
                      </div>
                      
                      <!-- Check mark indicator -->
                      <div
                        v-if="option.value === selectedLayout"
                        class="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm"
                      >
                        <Check class="w-3 h-3 text-white" />
                      </div>
                    </div>
                    
                    <!-- Label -->
                    <span class="text-xs font-medium text-gray-700 mt-1">{{
                      option.label
                    }}</span>
                  </DropdownMenuRadioItem>
                </div>
              </DropdownMenuRadioGroup>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" class="h-7 w-px flex-none bg-gray-200" />

        <!-- User button -->
        <Button
          variant="ghost"
          size="icon"
          aria-label="User"
          class="group flex-none cursor-pointer flex items-center h-8 transition-none hover:bg-gray-200 text-gray-600 w-8 focus:outline-none focus:ring-0 focus:ring-offset-0"
        >
          <User class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>