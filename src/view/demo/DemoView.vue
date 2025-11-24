<script setup lang="ts">
import { ref, computed, type Component } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import * as LucideIcons from 'lucide-vue-next';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import type { HeaderModel } from "./composables/types";

const activeHeaderId = ref(0); // 使用 header.index 作为唯一标识

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
// 测试场景：注释掉不同的面板数据，查看动态隐藏效果
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

const handleHeaderClick = (headerId: number) => {
  activeHeaderId.value = headerId;
  console.log('切换到标签页:', headerId);
};

const currentTitle = computed(() => {
  // 在所有面板中查找当前激活的 header
  const allHeaders = [
    ...(headerDataLeft.value || []),
    ...(headerDataTop.value || []),
    ...(headerDataBottom.value || [])
  ].filter(Boolean); // 过滤掉 undefined 或 null
  
  const activeHeader = allHeaders.find(h => h?.index === activeHeaderId.value);
  return activeHeader?.title || '';
});

// 判断各个面板是否有数据
const hasLeftPanel = computed(() => headerDataLeft.value && headerDataLeft.value.length > 0);
const hasTopPanel = computed(() => headerDataTop.value && headerDataTop.value.length > 0);
const hasBottomPanel = computed(() => headerDataBottom.value && headerDataBottom.value.length > 0);
const hasRightPanel = computed(() => hasTopPanel.value || hasBottomPanel.value);

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
    <!-- 只有一个面板时，不使用 ResizablePanelGroup -->
    <template v-if="!hasLeftPanel && !hasRightPanel">
      <div class="flex items-center justify-center h-full">
        <p class="text-muted-foreground">暂无面板数据</p>
      </div>
    </template>
    
    <!-- 只有左侧面板 -->
    <template v-else-if="hasLeftPanel && !hasRightPanel">
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
            <template v-for="header in headerDataLeft" :key="header?.index || Math.random()">
              <template v-if="header">
                <button 
                  class="drag-handle flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-move"
                  :class="[header.color, { 'opacity-50': activeHeaderId !== header.index }]"
                  @click="handleHeaderClick(header.index)"
                >
                  <component 
                    :is="getIconComponent(header.icon)" 
                    v-if="getIconComponent(header.icon)" 
                    class="h-4 w-4" 
                    :class="header.color || 'text-muted-foreground'"
                  />
                  <span class="whitespace-nowrap text-sm font-medium">{{ header.title }}</span>
                </button>
                <div v-if="header && header.index !== headerDataLeft[headerDataLeft.length - 1]?.index" class="h-4 w-px bg-border" />
              </template>
            </template>
          </VueDraggable>
        </header>
        
        <!-- Main 区域 -->
        <div class="flex flex-1 flex-col min-h-0">
          <div class="px-4 py-3 border-b">
            <h2 class="text-lg font-semibold">{{ currentTitle }}</h2>
          </div>
          <div class="flex-1 p-4 overflow-auto">
            <p>当前选中的页面 ID: {{ activeHeaderId }}</p>
            <p class="mt-2 text-muted-foreground">这里是 {{ currentTitle }} 的内容区域</p>
          </div>
        </div>
        
        <!-- Footer 区域 -->
        <footer class="flex items-center gap-2 bg-muted/50 px-2 py-1.5">
          <div class="flex items-center justify-between w-full">
            <div class="text-xs text-muted-foreground">Footer - {{ currentTitle }}</div>
            <div class="text-xs text-muted-foreground">ID: {{ activeHeaderId }}</div>
          </div>
        </footer>
      </div>
    </template>
    
    <!-- 只有右侧面板 -->
    <template v-else-if="!hasLeftPanel && hasRightPanel">
      <ResizablePanelGroup v-if="hasTopPanel && hasBottomPanel" direction="vertical" class="h-full w-full">
        <!-- 上部面板 -->
        <ResizablePanel :default-size="50" :min-size="20">
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
              <template v-for="header in headerDataLeft" :key="header?.index || Math.random()">
                <template v-if="header">
                  <button 
                    class="drag-handle flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-move"
                    :class="[header.color, { 'opacity-50': activeHeaderId !== header.index }]"
                    @click="handleHeaderClick(header.index)"
                  >
                    <component 
                      :is="getIconComponent(header.icon)" 
                      v-if="getIconComponent(header.icon)" 
                      class="h-4 w-4" 
                      :class="header.color || 'text-muted-foreground'"
                    />
                    <span class="whitespace-nowrap text-sm font-medium">{{ header.title }}</span>
                  </button>
                  <div v-if="header && header.index !== headerDataLeft[headerDataLeft.length - 1]?.index" class="h-4 w-px bg-border" />
                </template>
              </template>
            </VueDraggable>
          </header>
          
          <!-- Main 区域 -->
          <div class="flex flex-1 flex-col min-h-0">
            <div class="px-4 py-3 border-b">
              <h2 class="text-lg font-semibold">{{ currentTitle }}</h2>
            </div>
            <div class="flex-1 p-4 overflow-auto">
              <p>当前选中的页面 ID: {{ activeHeaderId }}</p>
              <p class="mt-2 text-muted-foreground">这里是 {{ currentTitle }} 的内容区域</p>
            </div>
          </div>
          
          <!-- Footer 区域 -->
          <footer class="flex items-center gap-2 bg-muted/50 px-2 py-1.5">
            <div class="flex items-center justify-between w-full">
              <div class="text-xs text-muted-foreground">Footer - {{ currentTitle }}</div>
              <div class="text-xs text-muted-foreground">ID: {{ activeHeaderId }}</div>
            </div>
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
                  v-model="headerDataTop"
                  group="headers"
                  :animation="150"
                  class="flex items-center gap-2"
                  handle=".drag-handle"
                >
                  <template v-for="header in headerDataTop" :key="header?.index || Math.random()">
                    <template v-if="header">
                      <button 
                        class="drag-handle flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-move"
                        :class="[header.color, { 'opacity-50': activeHeaderId !== header.index }]"
                        @click="handleHeaderClick(header.index)"
                      >
                        <component 
                          :is="getIconComponent(header.icon)" 
                          v-if="getIconComponent(header.icon)" 
                          class="h-4 w-4" 
                          :class="header.color || 'text-muted-foreground'"
                        />
                        <span class="whitespace-nowrap text-sm font-medium">{{ header.title }}</span>
                      </button>
                      <div v-if="header && header.index !== headerDataTop[headerDataTop.length - 1]?.index" class="h-4 w-px bg-border" />
                    </template>
                  </template>
                </VueDraggable>
              </header>
              
              <!-- Main 区域 -->
              <div class="flex flex-1 flex-col min-h-0">
                <div class="px-4 py-3 border-b">
                  <h2 class="text-lg font-semibold">上部面板 - {{ currentTitle }}</h2>
                </div>
                <div class="flex-1 p-4 overflow-auto">
                  <p class="text-muted-foreground">这是右侧上部的内容 - {{ currentTitle }}</p>
                </div>
              </div>
              
              <!-- Footer 区域 -->
              <footer class="flex items-center gap-2 bg-muted/50 px-2 py-1.5">
                <div class="text-xs text-muted-foreground">上部 Footer - {{ currentTitle }}</div>
              </footer>
            </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      <!-- 只有上部面板 -->
      <div v-else-if="hasTopPanel" class="flex flex-col h-full">
        <!-- Header 区域 (可拖拽) -->
        <header class="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-t-lg border-b">
          <VueDraggable
            v-model="headerDataTop"
            group="headers"
            :animation="150"
            class="flex items-center gap-2"
            handle=".drag-handle"
          >
            <template v-for="header in headerDataTop" :key="header?.index || Math.random()">
              <template v-if="header">
                <button 
                  class="drag-handle flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-move"
                  :class="[header.color, { 'opacity-50': activeHeaderId !== header.index }]"
                  @click="handleHeaderClick(header.index)"
                >
                  <component 
                    :is="getIconComponent(header.icon)" 
                    v-if="getIconComponent(header.icon)" 
                    class="h-4 w-4" 
                    :class="header.color || 'text-muted-foreground'"
                  />
                  <span class="whitespace-nowrap text-sm font-medium">{{ header.title }}</span>
                </button>
                <div v-if="header && header.index !== headerDataTop[headerDataTop.length - 1]?.index" class="h-4 w-px bg-border" />
              </template>
            </template>
          </VueDraggable>
        </header>
        
        <!-- Main 区域 -->
        <div class="flex flex-1 flex-col min-h-0">
          <div class="px-4 py-3 border-b">
            <h2 class="text-lg font-semibold">{{ currentTitle }}</h2>
          </div>
          <div class="flex-1 p-4 overflow-auto">
            <p class="text-muted-foreground">这是右侧上部的内容 - {{ currentTitle }}</p>
          </div>
        </div>
        
        <!-- Footer 区域 -->
        <footer class="flex items-center gap-2 bg-muted/50 px-2 py-1.5">
          <div class="text-xs text-muted-foreground">上部 Footer - {{ currentTitle }}</div>
        </footer>
      </div>
      
      <!-- 只有下部面板 -->
      <div v-else-if="hasBottomPanel" class="flex flex-col h-full">
        <!-- Header 区域 (可拖拽) -->
        <header class="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-t-lg border-b">
          <VueDraggable
            v-model="headerDataBottom"
            group="headers"
            :animation="150"
            class="flex items-center gap-2"
            handle=".drag-handle"
          >
            <template v-for="header in headerDataBottom" :key="header?.index || Math.random()">
              <template v-if="header">
                <button 
                  class="drag-handle flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-move"
                  :class="[header.color, { 'opacity-50': activeHeaderId !== header.index }]"
                  @click="handleHeaderClick(header.index)"
                >
                  <component 
                    :is="getIconComponent(header.icon)" 
                    v-if="getIconComponent(header.icon)" 
                    class="h-4 w-4" 
                    :class="header.color || 'text-muted-foreground'"
                  />
                  <span class="whitespace-nowrap text-sm font-medium">{{ header.title }}</span>
                </button>
                <div v-if="header && header.index !== headerDataBottom[headerDataBottom.length - 1]?.index" class="h-4 w-px bg-border" />
              </template>
            </template>
          </VueDraggable>
        </header>
        
        <!-- Main 区域 -->
        <div class="flex flex-1 flex-col min-h-0">
          <div class="px-4 py-3 border-b">
            <h2 class="text-lg font-semibold">{{ currentTitle }}</h2>
          </div>
          <div class="flex-1 p-4 overflow-auto">
            <p class="text-muted-foreground">这是右侧下部的内容 - {{ currentTitle }}</p>
          </div>
        </div>
        
        <!-- Footer 区域 -->
        <footer class="flex items-center gap-2 bg-muted/50 px-2 py-1.5">
          <div class="text-xs text-muted-foreground">下部 Footer - {{ currentTitle }}</div>
        </footer>
      </div>
    </template>
    
    <!-- 左右两个面板都存在 -->
    <ResizablePanelGroup v-else direction="horizontal" class="h-full w-full">
      <!-- 左侧面板 -->
      <ResizablePanel v-if="hasLeftPanel" :default-size="50" :min-size="30">
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
              <template v-for="header in headerDataLeft" :key="header?.index || Math.random()">
                <template v-if="header">
                  <button 
                    class="drag-handle flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-move"
                    :class="[header.color, { 'opacity-50': activeHeaderId !== header.index }]"
                    @click="handleHeaderClick(header.index)"
                  >
                    <component 
                      :is="getIconComponent(header.icon)" 
                      v-if="getIconComponent(header.icon)" 
                      class="h-4 w-4" 
                      :class="header.color || 'text-muted-foreground'"
                    />
                    <span class="whitespace-nowrap text-sm font-medium">{{ header.title }}</span>
                  </button>
                  <div v-if="header && header.index !== headerDataLeft[headerDataLeft.length - 1]?.index" class="h-4 w-px bg-border" />
                </template>
              </template>
            </VueDraggable>
          </header>
          
          <!-- Main 区域 -->
          <div class="flex flex-1 flex-col min-h-0">
            <div class="px-4 py-3 border-b">
              <h2 class="text-lg font-semibold">{{ currentTitle }}</h2>
            </div>
            <div class="flex-1 p-4 overflow-auto">
              <p>当前选中的页面 ID: {{ activeHeaderId }}</p>
              <p class="mt-2 text-muted-foreground">这里是 {{ currentTitle }} 的内容区域</p>
            </div>
          </div>
          
          <!-- Footer 区域 -->
          <footer class="flex items-center gap-2 bg-muted/50 px-2 py-1.5">
            <div class="flex items-center justify-between w-full">
              <div class="text-xs text-muted-foreground">Footer - {{ currentTitle }}</div>
              <div class="text-xs text-muted-foreground">ID: {{ activeHeaderId }}</div>
            </div>
          </footer>
        </div>
      </ResizablePanel>
      
      <ResizableHandle v-if="hasLeftPanel && hasRightPanel" />
      
      <!-- 右侧面板（嵌套的垂直分割） -->
      <ResizablePanel v-if="hasRightPanel" :default-size="50" :min-size="30">
        <!-- 右侧有上下两个面板 -->
        <ResizablePanelGroup v-if="hasTopPanel && hasBottomPanel" direction="vertical">
          <!-- 上部面板 -->
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
                  <template v-for="header in headerDataBottom" :key="header?.index || Math.random()">
                    <template v-if="header">
                      <button 
                        class="drag-handle flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-move"
                        :class="[header.color, { 'opacity-50': activeHeaderId !== header.index }]"
                        @click="handleHeaderClick(header.index)"
                      >
                        <component 
                          :is="getIconComponent(header.icon)" 
                          v-if="getIconComponent(header.icon)" 
                          class="h-4 w-4" 
                          :class="header.color || 'text-muted-foreground'"
                        />
                        <span class="whitespace-nowrap text-sm font-medium">{{ header.title }}</span>
                      </button>
                      <div v-if="header && header.index !== headerDataBottom[headerDataBottom.length - 1]?.index" class="h-4 w-px bg-border" />
                    </template>
                  </template>
                </VueDraggable>
              </header>
              
              <!-- Main 区域 -->
              <div class="flex flex-1 flex-col min-h-0">
                <div class="px-4 py-3 border-b">
                  <h2 class="text-lg font-semibold">下部面板 - {{ currentTitle }}</h2>
                </div>
                <div class="flex-1 p-4 overflow-auto">
                  <p class="text-muted-foreground">这是右侧下部的内容 - {{ currentTitle }}</p>
                </div>
              </div>
              
              <!-- Footer 区域 -->
              <footer class="flex items-center gap-2 bg-muted/50 px-2 py-1.5">
                <div class="text-xs text-muted-foreground">下部 Footer - {{ currentTitle }}</div>
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
                  <template v-for="header in headerDataBottom" :key="header?.index || Math.random()">
                    <template v-if="header">
                      <button 
                        class="drag-handle flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-move"
                        :class="[header.color, { 'opacity-50': activeHeaderId !== header.index }]"
                        @click="handleHeaderClick(header.index)"
                      >
                        <component 
                          :is="getIconComponent(header.icon)" 
                          v-if="getIconComponent(header.icon)" 
                          class="h-4 w-4" 
                          :class="header.color || 'text-muted-foreground'"
                        />
                        <span class="whitespace-nowrap text-sm font-medium">{{ header.title }}</span>
                      </button>
                      <div v-if="header && header.index !== headerDataBottom[headerDataBottom.length - 1]?.index" class="h-4 w-px bg-border" />
                    </template>
                  </template>
                </VueDraggable>
              </header>
              
              <!-- Main 区域 -->
              <div class="flex flex-1 flex-col min-h-0">
                <div class="px-4 py-3 border-b">
                  <h2 class="text-lg font-semibold">下部面板 - {{ currentTitle }}</h2>
                </div>
                <div class="flex-1 p-4 overflow-auto">
                  <p class="text-muted-foreground">这是右侧下部的内容 - {{ currentTitle }}</p>
                </div>
              </div>
              
              <!-- Footer 区域 -->
              <footer class="flex items-center gap-2 bg-muted/50 px-2 py-1.5">
                <div class="text-xs text-muted-foreground">下部 Footer - {{ currentTitle }}</div>
              </footer>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        
        <!-- 右侧只有上部面板 -->
        <div v-else-if="hasTopPanel" class="flex flex-col h-full">
          <!-- Header 区域 (可拖拽) -->
          <header class="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-t-lg border-b">
            <VueDraggable
              v-model="headerDataTop"
              group="headers"
              :animation="150"
              class="flex items-center gap-2"
              handle=".drag-handle"
            >
              <template v-for="header in headerDataTop" :key="header?.index || Math.random()">
                <template v-if="header">
                  <button 
                    class="drag-handle flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-move"
                    :class="[header.color, { 'opacity-50': activeHeaderId !== header.index }]"
                    @click="handleHeaderClick(header.index)"
                  >
                    <component 
                      :is="getIconComponent(header.icon)" 
                      v-if="getIconComponent(header.icon)" 
                      class="h-4 w-4" 
                      :class="header.color || 'text-muted-foreground'"
                    />
                    <span class="whitespace-nowrap text-sm font-medium">{{ header.title }}</span>
                  </button>
                  <div v-if="header && header.index !== headerDataTop[headerDataTop.length - 1]?.index" class="h-4 w-px bg-border" />
                </template>
              </template>
            </VueDraggable>
          </header>
          
          <!-- Main 区域 -->
          <div class="flex flex-1 flex-col min-h-0">
            <div class="px-4 py-3 border-b">
              <h2 class="text-lg font-semibold">上部面板 - {{ currentTitle }}</h2>
            </div>
            <div class="flex-1 p-4 overflow-auto">
              <p class="text-muted-foreground">这是右侧上部的内容 - {{ currentTitle }}</p>
            </div>
          </div>
          
          <!-- Footer 区域 -->
          <footer class="flex items-center gap-2 bg-muted/50 px-2 py-1.5">
            <div class="text-xs text-muted-foreground">上部 Footer - {{ currentTitle }}</div>
          </footer>
        </div>
        
        <!-- 右侧只有下部面板 -->
        <div v-else-if="hasBottomPanel" class="flex flex-col h-full">
          <!-- Header 区域 (可拖拽) -->
          <header class="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-t-lg border-b">
            <VueDraggable
              v-model="headerDataBottom"
              group="headers"
              :animation="150"
              class="flex items-center gap-2"
              handle=".drag-handle"
            >
              <template v-for="header in headerDataBottom" :key="header?.index || Math.random()">
                <template v-if="header">
                  <button 
                    class="drag-handle flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-move"
                    :class="[header.color, { 'opacity-50': activeHeaderId !== header.index }]"
                    @click="handleHeaderClick(header.index)"
                  >
                    <component 
                      :is="getIconComponent(header.icon)" 
                      v-if="getIconComponent(header.icon)" 
                      class="h-4 w-4" 
                      :class="header.color || 'text-muted-foreground'"
                    />
                    <span class="whitespace-nowrap text-sm font-medium">{{ header.title }}</span>
                  </button>
                  <div v-if="header && header.index !== headerDataBottom[headerDataBottom.length - 1]?.index" class="h-4 w-px bg-border" />
                </template>
              </template>
            </VueDraggable>
          </header>
          
          <!-- Main 区域 -->
          <div class="flex flex-1 flex-col min-h-0">
            <div class="px-4 py-3 border-b">
              <h2 class="text-lg font-semibold">下部面板 - {{ currentTitle }}</h2>
            </div>
            <div class="flex-1 p-4 overflow-auto">
              <p class="text-muted-foreground">这是右侧下部的内容 - {{ currentTitle }}</p>
            </div>
          </div>
          
          <!-- Footer 区域 -->
          <footer class="flex items-center gap-2 bg-muted/50 px-2 py-1.5">
            <div class="text-xs text-muted-foreground">下部 Footer - {{ currentTitle }}</div>
          </footer>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>
