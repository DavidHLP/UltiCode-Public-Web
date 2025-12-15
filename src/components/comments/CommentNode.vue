<template>
  <div class="comment-node relative group">
    <!-- SVG Thread Lines -->
    <div v-if="!isRoot" class="lines-svg-container">
      <svg class="tree-svg" preserveAspectRatio="none">
        <!-- 1. Vertical Rail -->
        <line
          v-if="!isLast"
          x1="20"
          y1="0"
          x2="20"
          y2="100%"
          class="svg-path"
        />

        <!-- 2. Curve -->
        <path d="M 20,0 L 20,32 Q 20,44 56,44" class="svg-path" />

        <!-- 3. Button Group -->
        <g class="toggle-group" @click.stop="toggleCollapse">
          <!-- Background Circle -->
          <circle cx="20" cy="44" r="7" class="toggle-circle" />

          <!-- Minus Icon (Expanded) -->
          <line
            v-if="!isCollapsed"
            x1="15"
            y1="44"
            x2="25"
            y2="44"
            class="toggle-icon"
          />

          <!-- Plus Icon (Collapsed) -->
          <g v-else>
            <line x1="15" y1="44" x2="25" y2="44" class="toggle-icon" />
            <line x1="20" y1="39" x2="20" y2="49" class="toggle-icon" />
          </g>
        </g>
      </svg>
    </div>

    <!-- Content Layer -->
    <div class="flex relative z-10 bg-white pl-1">
      <!-- Left Column: Avatar -->
      <div
        class="flex-shrink-0 mr-3 flex flex-col items-center pt-1 relative w-8 avatar-col"
      >
        <div
          class="w-8 h-8 rounded-full overflow-hidden relative cursor-pointer bg-gray-100 ring-1 ring-gray-100 hover:ring-gray-300 transition-all z-20"
          @click="toggleCollapse"
        >
          <img
            :src="comment.avatar"
            class="w-full h-full object-cover"
            alt="avatar"
          />
        </div>

        <!-- Thread Line Parent -->
        <div
          v-if="!isCollapsed && hasChildren"
          class="thread-line-parent"
        ></div>
      </div>

      <!-- Right Column: Content -->
      <div class="flex-grow pb-1">
        <div class="flex items-center text-xs mb-1 h-5">
          <span
            class="font-bold text-black mr-1 hover:underline cursor-pointer"
            >{{ comment.author }}</span
          >
          <span
            v-if="comment.isOp"
            class="text-blue-600 font-bold ml-1 text-[10px]"
            >OP</span
          >
          <span class="text-gray-400 mx-1">•</span>
          <span class="text-gray-500">{{ comment.time }}</span>
        </div>

        <div
          v-if="isCollapsed"
          class="py-1 cursor-pointer select-none"
          @click="toggleCollapse"
        >
          <span
            class="text-xs text-gray-400 italic font-medium hover:text-gray-600"
          >
            Collapsed ({{ comment.children ? comment.children.length : 0 }}
            children)
          </span>
        </div>

        <div v-else>
          <div class="text-sm text-[#1a1a1b] leading-relaxed mb-2">
            <MarkdownView :content="comment.content" />
          </div>

          <div
            class="flex items-center space-x-2 text-gray-500 font-bold text-xs select-none"
          >
            <div
              class="flex items-center bg-gray-100 rounded-full px-1 py-0.5 space-x-0.5 border border-transparent hover:border-gray-300 transition-colors"
            >
              <button
                class="p-1 hover:bg-gray-200 hover:text-orange-600 rounded-full transition-colors"
              >
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
              <span
                class="text-xs px-1 text-black font-semibold min-w-[16px] text-center"
                >{{ formatVotes(comment.votes) }}</span
              >
              <button
                class="p-1 hover:bg-gray-200 hover:text-blue-600 rounded-full transition-colors"
              >
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </button>
            </div>
            <button
              class="action-btn flex items-center space-x-1 px-2 py-1.5 rounded text-gray-500 hover:bg-gray-100 transition-colors"
              @click="toggleReply"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="2" x2="22" y2="6"></line>
                <path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"></path>
              </svg>
              <span class="hidden sm:inline">Reply</span>
            </button>
            <button
              class="action-btn flex items-center space-x-1 px-2 py-1.5 rounded text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              <span class="hidden sm:inline">Share</span>
            </button>
          </div>

          <!-- Reply Input -->
          <div v-if="isReplying" class="mt-2">
            <CommentInput
              :parent-id="comment.id"
              :on-cancel="() => (isReplying = false)"
              @submit="handleReplySubmit"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Children -->
    <div
      v-if="!isCollapsed && hasChildren"
      class="children-container pl-[36px] relative"
    >
      <CommentNode
        v-for="(child, index) in comment.children"
        :key="child.id"
        :comment="child"
        :is-last="index === (comment?.children?.length ?? 0) - 1"
        :is-root="false"
        @reply="
          (id: number | string, content: string) => emit('reply', id, content)
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { Comment } from "@/types/comment";
import CommentInput from "./CommentInput.vue";
import MarkdownView from "@/components/markdown/MarkdownView.vue";

const props = defineProps<{
  comment: Comment;
  isLast?: boolean;
  isRoot?: boolean;
}>();

const emit = defineEmits<{
  (e: "reply", commentId: number | string, content: string): void;
}>();

const isCollapsed = ref(false);
const isReplying = ref(false);

// Ensure reactivity for children length update
const hasChildren = computed(() => (props.comment.children?.length ?? 0) > 0);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const toggleReply = () => {
  isReplying.value = !isReplying.value;
};

const handleReplySubmit = (content: string) => {
  emit("reply", props.comment.id, content);
  isReplying.value = false;
  isCollapsed.value = false;
};

const formatVotes = (num: number) => {
  return num >= 1000 ? (num / 1000).toFixed(1) + "k" : num;
};
</script>

<style scoped>
:root {
  --indent-width: 36px;
  --line-color: #edeff1;
  --line-color-hover: #8c8c8c;
  --line-width: 2px;
}

.lines-svg-container {
  position: absolute;
  left: -36px; /* -var(--indent-width) */
  top: -20px;
  bottom: 0;
  width: 36px; /* var(--indent-width) */
  z-index: 10;
  overflow: visible;
  pointer-events: none;
}

.tree-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.svg-path {
  fill: none;
  stroke: #edeff1;
  stroke-width: 2px;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: stroke 0.2s;
}

.toggle-group {
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.2s;
  transform-origin: 20px 44px;
}

.toggle-circle {
  fill: white;
  stroke: #edeff1;
  stroke-width: 2px;
  transition:
    stroke 0.2s,
    fill 0.2s;
}

.toggle-icon {
  stroke: #878a8c;
  stroke-width: 2px;
  stroke-linecap: round;
  transition: stroke 0.2s;
}

.thread-line-parent {
  width: 2px;
  background-color: #edeff1;
  flex-grow: 1;
  margin-top: 4px;
  margin-bottom: 0;
  margin-left: auto;
  margin-right: auto;
  transition: background-color 0.2s;
}

/* Hover Effects */
/* Removed line highlights as requested */

.toggle-group:hover {
  transform: scale(1.1);
}
.toggle-group:hover .toggle-circle {
  stroke: #1a1a1b !important;
}
.toggle-group:hover .toggle-icon {
  stroke: #1a1a1b !important;
}
</style>
