<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  fetchForumCommunities,
  fetchForumPost,
  fetchForumTags,
  createForumPost,
  updateForumPost,
} from "@/api/forum";
import type { ForumCommunity, ForumPost, ForumTag } from "@/types/forum";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "vue-sonner";
import { isAuthenticated } from "@/utils/auth";
import { MarkdownEdit, MarkdownView } from "@/components/markdown";
import { ArrowLeft, SendHorizonal, X, Tag, Check } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

const isEditMode = computed(() => Boolean(route.params.postId));
const isLoading = ref(true);
const isSaving = ref(false);

const communities = ref<ForumCommunity[]>([]);
const tags = ref<ForumTag[]>([]);

const title = ref("");
const excerpt = ref("");
const communityId = ref("");
const flairType = ref<string | null>(null);
const flairLabel = ref("");
const selectedTags = ref<string[]>([]);
const showTagPicker = ref(false);

const defaultTemplate = `## Context

Share the background briefly.

## Details

- What did you try?
- What did you learn?

## Question

What are you looking for from the community?
`;

const flairOptions = [
  { value: "discussion", label: "Discussion" },
  { value: "question", label: "Question" },
  { value: "announcement", label: "Announcement" },
  { value: "showcase", label: "Showcase" },
  { value: "hiring", label: "Hiring" },
];

function applyPost(post: ForumPost) {
  title.value = post.title || "";
  excerpt.value = post.excerpt || "";
  communityId.value = post.community?.id || "";
  flairType.value = post.flair?.type ?? null;
  flairLabel.value = post.flair?.text ?? "";
  selectedTags.value = Array.isArray(post.tags) ? [...post.tags] : [];
}

async function loadData() {
  isLoading.value = true;
  try {
    const [communityRows, tagRows] = await Promise.all([
      fetchForumCommunities(),
      fetchForumTags(),
    ]);
    communities.value = communityRows;
    tags.value = tagRows;

    if (isEditMode.value) {
      const postId = route.params.postId as string;
      const post = await fetchForumPost(postId);
      if (!post) {
        toast.error("Post not found.");
        return;
      }
      applyPost(post);
    } else if (communityRows.length > 0) {
      communityId.value = communityRows[0].id;
    }
  } catch (error) {
    console.error("Failed to load editor data", error);
    toast.error("Failed to load editor data");
  } finally {
    isLoading.value = false;
  }
}

async function handleSave() {
  if (!isAuthenticated()) {
    toast.error("Please log in to publish.");
    return;
  }
  if (!title.value.trim() || !excerpt.value.trim() || !communityId.value) {
    toast.error("Please fill in the title, content, and community.");
    return;
  }
  isSaving.value = true;
  try {
    const payload = {
      title: title.value.trim(),
      excerpt: excerpt.value.trim(),
      tags: selectedTags.value,
      flairType: flairType.value,
      flairLabel: flairLabel.value.trim() || undefined,
    };

    if (isEditMode.value) {
      const postId = route.params.postId as string;
      await updateForumPost(postId, payload);
      toast.success("Post updated.");
      router.push({ name: "forum-thread", params: { postId } });
    } else {
      const post = await createForumPost({
        ...payload,
        communityId: communityId.value,
      });
      toast.success("Post published.");
      router.push({ name: "forum-thread", params: { postId: post.id } });
    }
  } catch (error) {
    console.error("Failed to save post", error);
    toast.error("Failed to save post.");
  } finally {
    isSaving.value = false;
  }
}

function toggleTag(tagName: string) {
  if (selectedTags.value.includes(tagName)) {
    selectedTags.value = selectedTags.value.filter((t) => t !== tagName);
  } else {
    selectedTags.value.push(tagName);
  }
}

function removeTag(tagName: string) {
  selectedTags.value = selectedTags.value.filter((t) => t !== tagName);
}

const handleGoBack = () => {
  router.back();
};

onMounted(loadData);
</script>

<template>
  <div class="flex h-screen w-full flex-col overflow-hidden bg-background">
    <!-- Header -->
    <header class="flex h-14 flex-shrink-0 items-center border-b px-4 gap-2">
      <Button variant="ghost" size="sm" class="gap-2" @click="handleGoBack">
        <ArrowLeft class="h-4 w-4" />
        Back
      </Button>
      <div class="flex-1" />
      <Button
        size="sm"
        class="gap-2"
        :disabled="isSaving || isLoading"
        @click="handleSave"
      >
        <SendHorizonal class="h-4 w-4" />
        {{ isEditMode ? "Update Post" : "Publish Post" }}
      </Button>
    </header>

    <!-- Main Content -->
    <main class="flex flex-1 overflow-hidden">
      <div class="flex w-full flex-col overflow-hidden">
        <!-- Meta Section -->
        <div class="flex flex-shrink-0 flex-col gap-3 px-4 py-3">
          <div class="rounded-lg border bg-card p-3 space-y-3">
            <Input
              v-model="title"
              placeholder="Enter title"
              class="rounded-none border-0 border-b bg-transparent px-0 text-base font-medium shadow-none focus-visible:ring-0"
            />

            <div class="flex flex-wrap gap-2 items-center">
              <Select v-model="communityId">
                <SelectTrigger class="w-[200px] h-8 text-sm">
                  <SelectValue placeholder="Select community" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="community in communities"
                    :key="community.id"
                    :value="community.id"
                  >
                    {{ community.name }}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select v-model="flairType">
                <SelectTrigger class="w-[150px] h-8 text-sm">
                  <SelectValue placeholder="Select flair" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="flair in flairOptions"
                    :key="flair.value"
                    :value="flair.value"
                  >
                    {{ flair.label }}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Input
                v-if="flairType"
                v-model="flairLabel"
                placeholder="Flair label"
                class="h-8 w-[150px] text-sm"
              />

              <div class="relative">
                <button
                  type="button"
                  class="flex h-8 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  @click="showTagPicker = !showTagPicker"
                >
                  <Tag class="h-3.5 w-3.5" />
                  Tags
                </button>
                <div
                  v-if="showTagPicker"
                  class="absolute left-0 top-10 z-50 w-64 rounded-md border border-border bg-popover shadow-md"
                >
                  <div class="border-b border-border px-3 py-2">
                    <h4 class="text-xs font-semibold">Select Tags</h4>
                  </div>
                  <div class="max-h-64 overflow-y-auto p-1">
                    <button
                      v-for="tag in tags"
                      :key="tag.id"
                      type="button"
                      class="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-muted cursor-default"
                      @click="toggleTag(tag.name)"
                    >
                      <span>{{ tag.name }}</span>
                      <Check
                        v-if="selectedTags.includes(tag.name)"
                        class="h-4 w-4 opacity-100"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="selectedTags.length > 0"
              class="flex flex-wrap gap-2 text-xs items-center mt-2"
            >
              <Badge
                v-for="tag in selectedTags"
                :key="tag"
                variant="secondary"
                class="flex items-center gap-1 h-6 px-2"
              >
                {{ tag }}
                <button
                  type="button"
                  class="ml-1 hover:text-destructive focus:outline-none"
                  @click="removeTag(tag)"
                >
                  <X class="h-3 w-3" />
                </button>
              </Badge>
            </div>
          </div>
        </div>

        <!-- Editor Section -->
        <div class="flex-1 px-4 pb-4 overflow-hidden">
          <div class="grid h-full grid-cols-2 gap-4">
            <MarkdownEdit v-model="excerpt" :default-value="defaultTemplate" />

            <div
              class="flex flex-col rounded-lg border bg-card overflow-hidden"
            >
              <div
                class="flex items-center border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground"
              >
                Preview
              </div>
              <div class="flex-1 overflow-y-auto p-4">
                <MarkdownView :content="excerpt || defaultTemplate" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
.markdown-content h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.markdown-content h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 0.875rem;
  margin-bottom: 0.5rem;
}

.markdown-content blockquote {
  border-left: 4px solid var(--color-border);
  padding-left: 1rem;
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.markdown-content ul {
  list-style: disc;
  margin-left: 1.5rem;
}

.markdown-content ol {
  list-style: decimal;
  margin-left: 1.5rem;
}

.markdown-content pre {
  background-color: var(--color-secondary);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-content code {
  font-family: "Fira Code", monospace;
  font-size: 0.875rem;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
}

.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid var(--color-border);
  padding: 0.5rem;
  text-align: left;
}

.markdown-content th {
  background-color: var(--color-muted);
}

.markdown-content a {
  color: var(--color-primary);
  text-decoration: underline;
}
</style>
