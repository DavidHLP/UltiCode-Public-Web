<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  List,
  Globe,
  Lock,
  Calendar,
} from "lucide-vue-next";
import { toast } from "vue-sonner";
import type { ProblemListItem } from "@/types/problem-list";
import {
  fetchUserProblemLists,
  createProblemList,
  deleteProblemList,
} from "@/api/problem-list";
import { fetchCurrentUserId } from "@/utils/auth";

const router = useRouter();
const loading = ref(true);
const lists = ref<ProblemListItem[]>([]);
const currentUserId = fetchCurrentUserId();

// Create dialog state
const isCreateOpen = ref(false);
const isCreating = ref(false);
const createForm = ref({
  name: "",
  description: "",
  isPublic: false,
});

// Delete dialog state
const isDeleteOpen = ref(false);
const isDeleting = ref(false);
const listToDelete = ref<ProblemListItem | null>(null);

const sortedLists = computed(() => {
  return [...lists.value].sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  });
});

const loadLists = async () => {
  if (!currentUserId) {
    loading.value = false;
    return;
  }
  try {
    lists.value = await fetchUserProblemLists(currentUserId);
  } catch (e) {
    console.error("Failed to load problem lists", e);
    toast.error("Failed to load your problem lists");
  } finally {
    loading.value = false;
  }
};

const handleCreate = async () => {
  if (!currentUserId || !createForm.value.name.trim()) return;

  isCreating.value = true;
  try {
    const newList = await createProblemList(currentUserId, {
      name: createForm.value.name.trim(),
      description: createForm.value.description.trim() || undefined,
      isPublic: createForm.value.isPublic,
    });
    lists.value.unshift(newList);
    toast.success("Problem list created successfully");
    isCreateOpen.value = false;
    createForm.value = { name: "", description: "", isPublic: false };
    // Navigate to the new list
    router.push(`/problemset/list/${newList.id}`);
  } catch (e) {
    console.error("Failed to create problem list", e);
    toast.error("Failed to create problem list");
  } finally {
    isCreating.value = false;
  }
};

const openDeleteDialog = (list: ProblemListItem) => {
  listToDelete.value = list;
  isDeleteOpen.value = true;
};

const handleDelete = async () => {
  if (!currentUserId || !listToDelete.value) return;

  isDeleting.value = true;
  try {
    await deleteProblemList(listToDelete.value.id, currentUserId);
    lists.value = lists.value.filter((l) => l.id !== listToDelete.value?.id);
    toast.success("Problem list deleted successfully");
    isDeleteOpen.value = false;
    listToDelete.value = null;
  } catch (e) {
    console.error("Failed to delete problem list", e);
    toast.error("Failed to delete problem list");
  } finally {
    isDeleting.value = false;
  }
};

const formatDate = (date?: string) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

onMounted(loadLists);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">My Problem Lists</h1>
        <p class="text-muted-foreground">
          Create and manage your custom problem lists
        </p>
      </div>
      <Button @click="isCreateOpen = true" class="gap-2">
        <Plus class="h-4 w-4" />
        New List
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex h-64 items-center justify-center">
      <div class="text-muted-foreground">Loading your lists...</div>
    </div>

    <!-- Not Logged In State -->
    <div
      v-else-if="!currentUserId"
      class="flex h-64 items-center justify-center"
    >
      <div class="text-center space-y-4">
        <p class="text-muted-foreground">
          Please log in to view your problem lists.
        </p>
        <Button as-child>
          <RouterLink to="/login">Sign In</RouterLink>
        </Button>
      </div>
    </div>

    <!-- Empty State -->
    <Empty
      v-else-if="lists.length === 0"
      class="h-80 border border-dashed border-border/60 bg-muted/20 rounded-xl"
    >
      <EmptyContent>
        <EmptyMedia
          variant="icon"
          class="bg-background p-4 rounded-full shadow-sm mb-4"
        >
          <List class="h-8 w-8 text-muted-foreground" />
        </EmptyMedia>
        <EmptyHeader>
          <h3 class="text-xl font-semibold text-foreground mb-1">
            No problem lists yet
          </h3>
          <EmptyDescription class="text-base">
            Create your first problem list to organize your practice.
          </EmptyDescription>
        </EmptyHeader>
        <Button class="mt-6" size="lg" @click="isCreateOpen = true">
          <Plus class="mr-2 h-4 w-4" />
          Create Your First List
        </Button>
      </EmptyContent>
    </Empty>

    <!-- Lists Grid -->
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card
        v-for="list in sortedLists"
        :key="list.id"
        class="group hover:shadow-md transition-shadow cursor-pointer"
      >
        <RouterLink :to="`/problemset/list/${list.id}`" class="block">
          <CardHeader class="pb-3">
            <div class="flex items-start justify-between">
              <div class="space-y-1 flex-1 min-w-0">
                <CardTitle class="text-lg truncate">{{ list.name }}</CardTitle>
                <div
                  class="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <Badge
                    v-if="list.isPublic"
                    variant="secondary"
                    class="gap-1 text-xs"
                  >
                    <Globe class="h-3 w-3" />
                    Public
                  </Badge>
                  <Badge v-else variant="outline" class="gap-1 text-xs">
                    <Lock class="h-3 w-3" />
                    Private
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger as-child @click.prevent>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem as-child>
                    <RouterLink :to="`/problemset/list/${list.id}`">
                      <Pencil class="mr-2 h-4 w-4" />
                      Edit
                    </RouterLink>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    class="text-destructive focus:text-destructive"
                    @click.prevent="openDeleteDialog(list)"
                  >
                    <Trash2 class="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <p
              v-if="list.description"
              class="text-sm text-muted-foreground line-clamp-2 mb-3"
            >
              {{ list.description }}
            </p>
            <div class="flex items-center gap-4 text-xs text-muted-foreground">
              <span v-if="list.updatedAt" class="flex items-center gap-1">
                <Calendar class="h-3 w-3" />
                {{ formatDate(list.updatedAt) }}
              </span>
            </div>
          </CardContent>
        </RouterLink>
      </Card>
    </div>

    <!-- Create Dialog -->
    <Dialog v-model:open="isCreateOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New List</DialogTitle>
          <DialogDescription>
            Create a new problem list to organize your practice.
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="create-name" class="text-right">Name</Label>
            <Input
              id="create-name"
              v-model="createForm.name"
              class="col-span-3"
              placeholder="My Problem List"
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="create-description" class="text-right"
              >Description</Label
            >
            <Textarea
              id="create-description"
              v-model="createForm.description"
              class="col-span-3"
              placeholder="Optional description..."
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="create-public" class="text-right">Public</Label>
            <div class="col-span-3 flex items-center space-x-2">
              <Switch
                id="create-public"
                v-model:checked="createForm.isPublic"
              />
              <span class="text-sm text-muted-foreground">
                {{
                  createForm.isPublic
                    ? "Everyone can see this list"
                    : "Only you can see this list"
                }}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isCreateOpen = false"
            >Cancel</Button
          >
          <Button
            @click="handleCreate"
            :disabled="isCreating || !createForm.name.trim()"
          >
            {{ isCreating ? "Creating..." : "Create List" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="isDeleteOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Problem List</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "<strong>{{
              listToDelete?.name
            }}</strong
            >"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" @click="isDeleteOpen = false"
            >Cancel</Button
          >
          <Button
            variant="destructive"
            @click="handleDelete"
            :disabled="isDeleting"
          >
            {{ isDeleting ? "Deleting..." : "Delete" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
