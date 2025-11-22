<template>
  <div class="h-[calc(100vh-130px-62px)] w-full overflow-x-hidden overflow-y-scroll px-4 py-2 md:h-[calc(100vh-110px-62px)] md:px-12 md:py-4">
    <div class="duration-400 transition-all" style="opacity: 1">
      <MdEditor
        v-model="editorContent"
        :options="editorOptions"
        class="w-full"
        @upload="handleUpload"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {MdEditor} from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import katex from 'katex'
import 'katex/dist/katex.css'

// 编辑器内容
const editorContent = ref<string>(`# 思路

> 你选用何种方法解题？

# 解题过程

> 这些方法具体怎么运用？

# 复杂度

- 时间复杂度: $O(*)$
- 空间复杂度: $O(*)$

# Code

\`\`\`java
class Solution {
   public int[] twoSum(int[] nums, int target) {
       for (int i = 0; i < nums.length; i++) {
           for (int j = i + 1; j < nums.length; j++) {
               if (nums[i] + nums[j] == target) {
                   return new int[] { i, j };
               }
           }
       }
       return new int[] {};
   }
}
\`\`\`
`)

// 编辑器配置
const editorOptions = {
  // 启用预览
  preview: 'editor',
  // 高度
  height: '100%',
  // 启用代码语法高亮
  codeBlockPreview: true,
  // 启用 KaTeX 数学公式
  katex: katex,
  // 工具栏配置
  toolbars: [
    'bold',
    'italic',
    'strikethrough',
    '|',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    '|',
    'ul',
    'ol',
    'todo',
    '|',
    'quote',
    'table',
    'code',
    'link',
    'image',
    '|',
    'undo',
    'redo',
    '|',
    'save',
  ],
  // 禁用某些功能
  disableCopy: false,
  // 文本模式下的行高
  lineNumbers: true,
  // 支持的脚本
  scriptUrlMap: {
    katex: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
    mermaid: 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js',
  },
  formatChinese: true,
}

// 处理文件上传
const handleUpload = async (files: File[]) => {
  // 这里处理文件上传逻辑
  console.log('Files uploaded:', files)
}
</script>

<style scoped>
:deep(.md-editor) {
  border-radius: 0;
  border: none;
  background: transparent;
}

:deep(.md-editor-container) {
  background: transparent;
}

:deep(.md-editor--preview-only) {
  background: transparent;
}

/* 调整编辑器样式以匹配原始设计 */
:deep(.md-editor-text-input) {
  background: transparent;
  font-family: inherit;
}

:deep(.md-editor-preview) {
  background: transparent;
}

:deep(.md-editor-toolbar) {
  border-bottom: 1px solid var(--color-border);
  background: transparent;
}

/* 代码块样式 */
:deep(.md-editor-preview code) {
  background: var(--fill-quaternary);
  border-radius: 0.5rem;
  padding: 1rem;
}

:deep(.md-editor-preview pre) {
  background: var(--fill-quaternary);
  border-radius: 0.5rem;
  overflow-x: auto;
  overflow-y: hidden;
}

/* 标题样式 */
:deep(.md-editor-preview h1) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

:deep(.md-editor-preview h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 0.875rem;
  margin-bottom: 0.5rem;
}

/* 引用块样式 */
:deep(.md-editor-preview blockquote) {
  border-left: 4px solid var(--color-border);
  padding-left: 1rem;
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

/* 列表样式 */
:deep(.md-editor-preview ul) {
  list-style: disc;
  margin-left: 1.5rem;
}

:deep(.md-editor-preview ol) {
  list-style: decimal;
  margin-left: 1.5rem;
}
</style>
