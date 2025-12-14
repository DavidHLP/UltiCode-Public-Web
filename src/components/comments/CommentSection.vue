<template>
  <div class="max-w-4xl mx-auto py-10 px-6">
    <div class="bg-white">
      <h2 class="text-xl font-bold mb-8 pb-4 border-b">
        Comments (Vue 3 + TS)
      </h2>

      <div class="space-y-4">
        <CommentNode
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :is-last="true"
          :is-root="true"
          @reply="handleReply"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Comment } from "@/types/comment";
import CommentNode from "./CommentNode.vue";

const mockData: Comment[] = [
  {
    id: 1,
    author: "indicava",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=indicava",
    time: "1d ago",
    votes: 43,
    content: ['The hell is "AI Score"?', "“AI 分数”到底是什么？"],
    children: [
      {
        id: 2,
        author: "Hunting-Succcubus",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Hunting",
        time: "1d ago",
        votes: 22,
        content: [
          "Ai score is metric how much you can fool consumer",
          "AI 分数是衡量你能骗过消费者多少",
        ],
        children: [
          {
            id: 3,
            author: "geerlingguy",
            avatar:
              "https://api.dicebear.com/7.x/avataaars/svg?seed=geerlingguy",
            time: "12h ago",
            votes: 1,
            content: [
              'AI score means as much to me as "built in XX TOPS NPU". It\'s like the megahertz race of the 90s.',
              "AI 分数对我来说和“内置 XX 超过 NPU”一样重要。",
            ],
            children: [
              {
                id: 4,
                author: "FinalUser",
                avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Final",
                time: "10h ago",
                votes: 5,
                content: [
                  "Exactly. It creates a seamless experience now.",
                  "确实。现在看起来是无缝连接的。",
                ],
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 10,
    author: "TestSubject",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=test",
    time: "5h ago",
    votes: 12,
    content: [
      "This button is now an integral part of the SVG path.",
      "这个按钮现在是 SVG 路径的有机组成部分。",
    ],
    children: [
      {
        id: 11,
        author: "ChildNodeA",
        avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=a",
        time: "2h ago",
        votes: 3,
        content: [
          "Hovering me lights up the line, the button, and the parent's line as one unit.",
          "悬停我时，线条、按钮和父级线会作为一个整体亮起。",
        ],
        children: [
          {
            id: 12,
            author: "GrandChild",
            avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=b",
            time: "1h ago",
            votes: 1,
            content: ["Seamless vector graphics.", "无缝矢量图形。"],
            children: [],
          },
        ],
      },
    ],
  },
];

const comments = ref<Comment[]>(mockData);

const findAndAddReply = (
  nodes: Comment[],
  parentId: number | string,
  content: string
): boolean => {
  for (const node of nodes) {
    if (node.id === parentId) {
      if (!node.children) node.children = [];
      node.children.unshift({
        id: Date.now(),
        author: "Me",
        avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Me",
        time: "Just now",
        votes: 1,
        content: [content],
        children: [],
      });
      return true;
    }
    if (node.children && node.children.length > 0) {
      if (findAndAddReply(node.children, parentId, content)) return true;
    }
  }
  return false;
};

const handleReply = (parentId: number | string, content: string) => {
  findAndAddReply(comments.value, parentId, content);
};
</script>
