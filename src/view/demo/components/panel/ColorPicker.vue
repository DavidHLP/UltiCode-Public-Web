<script setup lang="ts">
import { ref, watch } from "vue";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const color = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    color.value = newValue;
  }
);

const presetColors = [
  "#16a34a", "#2563eb", "#9333ea", "#dc2626", "#ea580c", 
  "#0891b2", "#000000", "#ffffff", "#facc15", "#c026d3"
];

const updateColor = (newColor: string) => {
  color.value = newColor;
  emit("update:modelValue", newColor);
};

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  updateColor(target.value);
};
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" class="w-10 h-6 p-0">
        <div 
          class="w-full h-full rounded-sm border" 
          :style="{ backgroundColor: color }"
        />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-64">
      <div class="space-y-2">
        <div class="grid grid-cols-5 gap-2">
          <Button
            v-for="presetColor in presetColors"
            :key="presetColor"
            variant="outline"
            class="w-8 h-8 p-0"
            @click="updateColor(presetColor)"
          >
            <div 
              class="w-full h-full rounded-sm" 
              :style="{ backgroundColor: presetColor }"
            />
          </Button>
        </div>
        <div class="flex items-center gap-2">
          <Input
            type="color"
            :value="color"
            @input="handleInput"
            class="w-10 h-8 p-1"
          />
          <Input
            :value="color"
            @input="handleInput"
            class="flex-1 h-8 text-xs"
          />
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>