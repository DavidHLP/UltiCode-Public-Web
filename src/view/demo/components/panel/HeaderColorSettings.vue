<script setup lang="ts">
import { ref } from "vue";
import type { HeaderModel } from "@/stores/headerStore";
import ColorPicker from "./ColorPicker.vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const props = defineProps<{
  headers: HeaderModel[];
  onUpdate: (updatedHeaders: HeaderModel[]) => void;
}>();

const localHeaders = ref<HeaderModel[]>([...props.headers]);

const updateHeaderColor = (headerId: number, colorType: string, color: string) => {
  // 只允许更新color和iconColor属性
  if (colorType !== 'color' && colorType !== 'iconColor') return;
  
  const headerIndex = localHeaders.value.findIndex(h => h.id === headerId);
  if (headerIndex !== -1) {
    const updatedHeaders = [...localHeaders.value];
    updatedHeaders[headerIndex] = {
      ...updatedHeaders[headerIndex],
      [colorType]: color
    } as HeaderModel;
    localHeaders.value = updatedHeaders;
    props.onUpdate(updatedHeaders);
  }
};

const resetToDefault = (headerId: number) => {
  const headerIndex = localHeaders.value.findIndex(h => h.id === headerId);
  if (headerIndex !== -1) {
    const updatedHeaders = [...localHeaders.value];
    const originalHeader = props.headers.find(h => h.id === headerId);
    if (originalHeader) {
      updatedHeaders[headerIndex] = { ...originalHeader };
      localHeaders.value = updatedHeaders;
      props.onUpdate(updatedHeaders);
    }
  }
};
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>颜色设置</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <div 
        v-for="header in localHeaders" 
        :key="header.id"
        class="flex items-center justify-between p-2 border rounded-md"
      >
        <div class="flex items-center gap-2">
          <div 
            class="w-4 h-4 rounded-sm border" 
            :style="{ backgroundColor: header.color }"
          />
          <span>{{ header.title }}</span>
        </div>
        
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1">
            <label class="text-xs">文字:</label>
            <ColorPicker 
              :model-value="header.color || '#000000'" 
              @update:model-value="(color) => updateHeaderColor(header.id, 'color', color)" 
            />
          </div>
          

          
          <div class="flex items-center gap-1">
            <label class="text-xs">图标:</label>
            <ColorPicker 
              :model-value="header.iconColor || header.color || '#000000'" 
              @update:model-value="(color) => updateHeaderColor(header.id, 'iconColor', color)" 
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            class="h-6 px-2 text-xs"
            @click="resetToDefault(header.id)"
          >
            重置
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>