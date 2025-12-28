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
const tagInput = ref("");
const defaultTemplate = `## Context

Share the background briefly.

## Details

- What did you try?
- What did you learn?

## Question

What are you looking for from the community?
`;

const selectedTags = computed(() =>
  tagInput.value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0),
);

const flairOptions = [
  { value: "discussion", label: "Discussion" },
  { value: "question", label: "Question" },
  { value: "announcement", label: "Announcement" },
  { value: "showcase", label: "Showcase" },
  { value: "hiring", label: "Hiring" },
];

const suggestedTags = computed(() => {
  const chosen = new Set(selectedTags.value);
  return tags.value.filter((tag) => !chosen.has(tag.name)).slice(0, 8);
});

function applyPost(post: ForumPost) {
  title.value = post.title || "";
  excerpt.value = post.excerpt || "";
  communityId.value = post.community?.id || "";
  flairType.value = post.flair?.type ?? null;
  flairLabel.value = post.flair?.text ?? "";
  tagInput.value = Array.isArray(post.tags) ? post.tags.join(", ") : "";
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

function addSuggestedTag(tag: string) {
  const current = new Set(selectedTags.value);
  current.add(tag);
  tagInput.value = Array.from(current).join(", ");
}

onMounted(loadData);
</script>

<template>
  <div class="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">
          {{ isEditMode ? "Edit Post" : "Create Post" }}
        </h1>
        <p class="text-sm text-muted-foreground">
          Share your ideas with the community.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" @click="router.back()">Cancel</Button>
        <Button :disabled="isSaving || isLoading" @click="handleSave">
          {{ isEditMode ? "Update" : "Publish" }}
        </Button>
      </div>
    </div>

    <div v-if="isLoading" class="text-sm text-muted-foreground">
      Loading editor...
    </div>

    <div v-else class="space-y-4">
      <div class="space-y-2">
        <label class="text-sm font-medium">Title</label>
        <Input v-model="title" placeholder="Write a clear title" />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-medium">Community</label>
          <Select v-model="communityId">
            <SelectTrigger>
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
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Flair</label>
          <Select v-model="flairType">
            <SelectTrigger>
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
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">Flair Label (optional)</label>
        <Input v-model="flairLabel" placeholder="Custom flair label" />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">Tags</label>
        <Input
          v-model="tagInput"
          placeholder="Comma-separated tags (e.g. typescript, performance)"
        />
        <div v-if="suggestedTags.length > 0" class="flex flex-wrap gap-2">
          <Badge
            v-for="tag in suggestedTags"
            :key="tag.id"
            variant="secondary"
            class="cursor-pointer"
            @click="addSuggestedTag(tag.name)"
          >
            {{ tag.name }}
          </Badge>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">Content</label>
        <div class="grid gap-4 md:grid-cols-2">
          <MarkdownEdit
            v-model="excerpt"
            :default-value="defaultTemplate"
            editor-class="min-h-[320px]"
          />
          <div
            class="rounded-lg border bg-card p-4 text-sm text-muted-foreground"
          >
            <div class="mb-2 text-xs font-semibold uppercase tracking-wide">
              Preview
            </div>
            <MarkdownView :content="excerpt || defaultTemplate" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
