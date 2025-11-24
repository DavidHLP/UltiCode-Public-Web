<script setup lang="ts">
import { ref, computed, type Component } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import * as LucideIcons from 'lucide-vue-next';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import type { HeaderModel } from "./components/types";

const activeIndex = ref(0);
const activeIndexTop = ref(0);
const activeIndexBottom = ref(0);

// 定义所有可用的 header 数据
const allHeaderData: HeaderModel[] = [
  {
    index: 0,
    title: '题目描述',
    icon: 'FileText',
    color: 'text-blue-600'
  },
  {
    index: 1,
    title: '题解',
    icon: 'Lightbulb',
    color: 'text-yellow-600'
  },
  {
    index: 2,
    title: '提交记录',
    icon: 'History',
    color: 'text-purple-600'
  },
  {
    index: 3,
    title: '代码',
    icon: 'Code2',
    color: 'text-green-600'
  },
  {
    index: 4,
    title: '测试用例',
    icon: 'FlaskConical',
    color: 'text-orange-600'
  },
  {
    index: 5,
    title: '测试结果',
    icon: 'ClipboardCheck',
    color: 'text-teal-600'
  }
];

// 三个面板的 header 数据（可拖拽）
const headerDataLeft = ref<HeaderModel[]>([
  allHeaderData[0]!, // 题目描述
  allHeaderData[1]!, // 题解
  allHeaderData[2]!, // 提交记录
]);

const headerDataTop = ref<HeaderModel[]>([
  allHeaderData[3]!, // 代码
  allHeaderData[4]!, // 测试用例
]);

const headerDataBottom = ref<HeaderModel[]>([
  allHeaderData[5]!, // 测试结果
]);

const handleHeaderClick = (index: number) => {
  activeIndex.value = index;
  console.log('切换到标签页(左侧):', index);
};

const handleHeaderClickTop = (index: number) => {
  activeIndexTop.value = index;
  console.log('切换到标签页(右上):', index);
};

const handleHeaderClickBottom = (index: number) => {
  activeIndexBottom.value = index;
  console.log('切换到标签页(右下):', index);
};

const currentTitle = computed(() => {
  return headerDataLeft.value[activeIndex.value]?.title || '';
});

const currentTitleTop = computed(() => {
  return headerDataTop.value[activeIndexTop.value]?.title || '';
});

const currentTitleBottom = computed(() => {
  return headerDataBottom.value[activeIndexBottom.value]?.title || '';
});

// 获取图标组件
const getIconComponent = (iconName: string) => {
  if (!iconName) return null;
  const icon = (LucideIcons as Record<string, unknown>)[iconName];
  if (icon && (typeof icon === "object" || typeof icon === "function")) {
    return icon as Component;
  }
  return null;
};
</script>

<template>
  <div class="h-screen w-full">
    <ResizablePanelGroup direction="horizontal" class="h-full w-full">
      <!-- 左侧面板 -->
      <ResizablePanel :default-size="50" :min-size="30">
        <div class="flex flex-col h-full">
          <!-- Header 区域 (可拖拽) -->
          <header class="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-t-lg border-b">
            <VueDraggable
              v-model="headerDataLeft"
              group="headers"
              :animation="150"
              class="flex items-center gap-2"
              handle=".drag-handle"
            >
              <template v-for="(header, index) in headerDataLeft" :key="header.index">
                <button 
                  class="drag-handle flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-move" 
                  :class="header.color"
                  @click="handleHeaderClick(index)"
                >
                  <component 
                    :is="getIconComponent(header.icon)" 
                    v-if="getIconComponent(header.icon)" 
                    class="h-4 w-4" 
                    :class="header.color || 'text-muted-foreground'"
                  />
                  <span class="whitespace-nowrap text-sm font-medium">{{ header.title }}</span>
                </button>
                <div v-if="index < headerDataLeft.length - 1" class="h-4 w-px bg-border" />
              </template>
            </VueDraggable>
          </header>
          
          <!-- Main 区域 -->
          <div class="flex flex-1 flex-col min-h-0">
            <div class="px-4 py-3 border-b">
              <h2 class="text-lg font-semibold">{{ currentTitle }}</h2>
            </div>
            <div class="flex-1 p-4 overflow-auto">
              <p>当前选中的标签页索引: {{ activeIndex }}</p>
              <p class="mt-2 text-muted-foreground">这里是 {{ currentTitle }} 的内容区域</p>
            </div>
          </div>
          
          <!-- Footer 区域 -->
          <footer class="flex items-center gap-2 bg-muted/50 px-2 py-1.5">
            <div class="flex items-center justify-between w-full">
              <div class="text-xs text-muted-foreground">Footer - {{ currentTitle }}</div>
              <div class="text-xs text-muted-foreground">索引: {{ activeIndex }}</div>
            </div>
          </footer>
        </div>
      </ResizablePanel>
      
      <ResizableHandle />
      
      <!-- 右侧面板（嵌套的垂直分割） -->
      <ResizablePanel :default-size="50" :min-size="30">
        <ResizablePanelGroup direction="vertical">
          <!-- 上部面板 -->
          <ResizablePanel :default-size="50" :min-size="20">
            <div class="flex flex-col h-full">
              <!-- Header 区域 (可拖拽) -->
              <header class="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-t-lg border-b">
                <VueDraggable
                  v-model="headerDataTop"
                  group="headers"
                  :animation="150"
                  class="flex items-center gap-2"
                  handle=".drag-handle"
                >
                  <template v-for="(header, index) in headerDataTop" :key="header.index">
                    <button 
                      class="drag-handle flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-move" 
                      :class="header.color"
                      @click="handleHeaderClickTop(index)"
                    >
                      <component 
                        :is="getIconComponent(header.icon)" 
                        v-if="getIconComponent(header.icon)" 
                        class="h-4 w-4" 
                        :class="header.color || 'text-muted-foreground'"
                      />
                      <span class="whitespace-nowrap text-sm font-medium">{{ header.title }}</span>
                    </button>
                    <div v-if="index < headerDataTop.length - 1" class="h-4 w-px bg-border" />
                  </template>
                </VueDraggable>
              </header>
              
              <!-- Main 区域 -->
              <div class="flex flex-1 flex-col min-h-0">
                <div class="px-4 py-3 border-b">
                  <h2 class="text-lg font-semibold">上部面板 - {{ currentTitleTop }}</h2>
                </div>
                <div class="flex-1 p-4 overflow-auto">
                  <p class="text-muted-foreground">这是右侧上部的内容 - {{ currentTitleTop }}</p>
                </div>
              </div>
              
              <!-- Footer 区域 -->
              <footer class="flex items-center gap-2 bg-muted/50 px-2 py-1.5">
                <div class="text-xs text-muted-foreground">上部 Footer - {{ currentTitleTop }}</div>
              </footer>
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          <!-- 下部面板 -->
          <ResizablePanel :default-size="50" :min-size="20">
            <div class="flex flex-col h-full">
              <!-- Header 区域 (可拖拽) -->
              <header class="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-t-lg border-b">
                <VueDraggable
                  v-model="headerDataBottom"
                  group="headers"
                  :animation="150"
                  class="flex items-center gap-2"
                  handle=".drag-handle"
                >
                  <template v-for="(header, index) in headerDataBottom" :key="header.index">
                    <button 
                      class="drag-handle flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-move" 
                      :class="header.color"
                      @click="handleHeaderClickBottom(index)"
                    >
                      <component 
                        :is="getIconComponent(header.icon)" 
                        v-if="getIconComponent(header.icon)" 
                        class="h-4 w-4" 
                        :class="header.color || 'text-muted-foreground'"
                      />
                      <span class="whitespace-nowrap text-sm font-medium">{{ header.title }}</span>
                    </button>
                    <div v-if="index < headerDataBottom.length - 1" class="h-4 w-px bg-border" />
                  </template>
                </VueDraggable>
              </header>
              
              <!-- Main 区域 -->
              <div class="flex flex-1 flex-col min-h-0">
                <div class="px-4 py-3 border-b">
                  <h2 class="text-lg font-semibold">下部面板 - {{ currentTitleBottom }}</h2>
                </div>
                <div class="flex-1 p-4 overflow-auto">
                  <p class="text-muted-foreground">这是右侧下部的内容 - {{ currentTitleBottom }}</p>
                </div>
              </div>
              
              <!-- Footer 区域 -->
              <footer class="flex items-center gap-2 bg-muted/50 px-2 py-1.5">
                <div class="text-xs text-muted-foreground">下部 Footer - {{ currentTitleBottom }}</div>
              </footer>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>
