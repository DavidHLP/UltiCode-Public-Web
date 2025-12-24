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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  Bookmark,
  BookmarkMinus,
  FolderPlus,
  FolderInput,
  ChevronRight,
  User,
  Star,
} from "lucide-vue-next";
import { toast } from "vue-sonner";
import type {
  ProblemList,
  ProblemListCategory,
  UserProblemListsResponse,
} from "@/types/problem-list";
import {
  fetchUserProblemListsData,
  createProblemList,
  deleteProblemList,
  unsaveList,
  createCategory,
  updateCategory,
  deleteCategory,
  moveListToCategory,
} from "@/api/problem-list";
import { fetchCurrentUserId } from "@/utils/auth";

const router = useRouter();
const loading = ref(true);
const currentUserId = fetchCurrentUserId();
const activeTab = ref("my-lists");

// Data state
const data = ref<UserProblemListsResponse>({
  myLists: [],
  savedLists: [],
  featured: [],
  categories: [],
});

// Create list dialog state
const isCreateOpen = ref(false);
const isCreating = ref(false);
const createForm = ref({
  name: "",
  description: "",
  isPublic: false,
});

// Delete list dialog state
const isDeleteListOpen = ref(false);
const isDeletingList = ref(false);
const listToDelete = ref<ProblemList | null>(null);

// Create category dialog state
const isCreateCategoryOpen = ref(false);
const isCreatingCategory = ref(false);
const createCategoryForm = ref({ name: "" });

// Edit category dialog state
const isEditCategoryOpen = ref(false);
const isEditingCategory = ref(false);
const categoryToEdit = ref<ProblemListCategory | null>(null);
const editCategoryForm = ref({ name: "" });

// Delete category dialog state
const isDeleteCategoryOpen = ref(false);
const isDeletingCategory = ref(false);
const categoryToDelete = ref<ProblemListCategory | null>(null);

// Computed
const sortedMyLists = computed(() => {
  return [...data.value.myLists].sort((a, b) => {
    return b.problemCount - a.problemCount;
  });
});

const sortedSavedLists = computed(() => {
  // Filter out lists that are in categories
  const inCategoryIds = new Set(
    data.value.categories.flatMap((c) => c.lists.map((l) => l.id)),
  );
  return data.value.savedLists.filter((l) => !inCategoryIds.has(l.id));
});

const loadData = async () => {
  if (!currentUserId) {
    loading.value = false;
    return;
  }
  try {
    data.value = await fetchUserProblemListsData(currentUserId);
  } catch (e) {
    console.error("Failed to load problem lists", e);
    toast.error("Failed to load your problem lists");
  } finally {
    loading.value = false;
  }
};

// --- Create List ---
const handleCreateList = async () => {
  if (!currentUserId || !createForm.value.name.trim()) return;

  isCreating.value = true;
  try {
    const newList = await createProblemList(currentUserId, {
      name: createForm.value.name.trim(),
      description: createForm.value.description.trim() || undefined,
      isPublic: createForm.value.isPublic,
    });
    toast.success("Problem list created successfully");
    isCreateOpen.value = false;
    createForm.value = { name: "", description: "", isPublic: false };
    router.push(`/problemset/list/${newList.id}`);
  } catch (e) {
    console.error("Failed to create problem list", e);
    toast.error("Failed to create problem list");
  } finally {
    isCreating.value = false;
  }
};

// --- Delete List ---
const openDeleteListDialog = (list: ProblemList) => {
  listToDelete.value = list;
  isDeleteListOpen.value = true;
};

const handleDeleteList = async () => {
  if (!currentUserId || !listToDelete.value) return;

  isDeletingList.value = true;
  try {
    await deleteProblemList(listToDelete.value.id, currentUserId);
    toast.success("Problem list deleted successfully");
    isDeleteListOpen.value = false;
    listToDelete.value = null;
    await loadData();
  } catch (e) {
    console.error("Failed to delete problem list", e);
    toast.error("Failed to delete problem list");
  } finally {
    isDeletingList.value = false;
  }
};

// --- Unsave List ---
const handleUnsaveList = async (list: ProblemList) => {
  if (!currentUserId) return;
  try {
    await unsaveList(list.id, currentUserId);
    toast.success(`Removed "${list.name}" from saved`);
    await loadData();
  } catch (e) {
    console.error("Failed to unsave list", e);
    toast.error("Failed to remove from saved");
  }
};

// --- Move List to Category ---
const handleMoveToCategory = async (
  list: ProblemList,
  categoryId: string | null,
) => {
  if (!currentUserId) return;
  try {
    await moveListToCategory(list.id, currentUserId, categoryId);
    toast.success(
      categoryId
        ? `Moved "${list.name}" to category`
        : `Removed "${list.name}" from category`,
    );
    await loadData();
  } catch (e) {
    console.error("Failed to move list", e);
    toast.error("Failed to move list");
  }
};

// --- Create Category ---
const handleCreateCategory = async () => {
  if (!currentUserId || !createCategoryForm.value.name.trim()) return;
  isCreatingCategory.value = true;
  try {
    await createCategory(currentUserId, {
      name: createCategoryForm.value.name.trim(),
    });
    toast.success("Category created successfully");
    isCreateCategoryOpen.value = false;
    createCategoryForm.value = { name: "" };
    await loadData();
  } catch (e) {
    console.error("Failed to create category", e);
    toast.error("Failed to create category");
  } finally {
    isCreatingCategory.value = false;
  }
};

// --- Edit Category ---
const openEditCategoryDialog = (category: ProblemListCategory) => {
  categoryToEdit.value = category;
  editCategoryForm.value = { name: category.name };
  isEditCategoryOpen.value = true;
};

const handleEditCategory = async () => {
  if (!currentUserId || !categoryToEdit.value) return;
  if (!editCategoryForm.value.name.trim()) {
    toast.error("Category name is required");
    return;
  }
  isEditingCategory.value = true;
  try {
    await updateCategory(categoryToEdit.value.id, currentUserId, {
      name: editCategoryForm.value.name.trim(),
    });
    toast.success("Category updated successfully");
    isEditCategoryOpen.value = false;
    await loadData();
  } catch (e) {
    console.error("Failed to update category", e);
    toast.error("Failed to update category");
  } finally {
    isEditingCategory.value = false;
  }
};

// --- Delete Category ---
const openDeleteCategoryDialog = (category: ProblemListCategory) => {
  categoryToDelete.value = category;
  isDeleteCategoryOpen.value = true;
};

const handleDeleteCategory = async () => {
  if (!currentUserId || !categoryToDelete.value) return;
  isDeletingCategory.value = true;
  try {
    await deleteCategory(categoryToDelete.value.id, currentUserId);
    toast.success("Category deleted successfully");
    isDeleteCategoryOpen.value = false;
    await loadData();
  } catch (e) {
    console.error("Failed to delete category", e);
    toast.error("Failed to delete category");
  } finally {
    isDeletingCategory.value = false;
  }
};

onMounted(loadData);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Problem Lists</h1>
        <p class="text-muted-foreground">
          Manage your created and saved problem lists
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          @click="isCreateCategoryOpen = true"
          class="gap-2"
        >
          <FolderPlus class="h-4 w-4" />
          New Category
        </Button>
        <Button @click="isCreateOpen = true" class="gap-2">
          <Plus class="h-4 w-4" />
          New List
        </Button>
      </div>
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

    <!-- Main Content -->
    <div v-else>
      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="mb-4">
          <TabsTrigger value="my-lists" class="gap-2">
            <User class="h-4 w-4" />
            My Lists
            <Badge variant="secondary" class="ml-1">{{
              data.myLists.length
            }}</Badge>
          </TabsTrigger>
          <TabsTrigger value="saved" class="gap-2">
            <Bookmark class="h-4 w-4" />
            Saved
            <Badge variant="secondary" class="ml-1">{{
              data.savedLists.length
            }}</Badge>
          </TabsTrigger>
          <TabsTrigger value="featured" class="gap-2">
            <Star class="h-4 w-4" />
            Featured
            <Badge variant="secondary" class="ml-1">{{
              data.featured.length
            }}</Badge>
          </TabsTrigger>
        </TabsList>

        <!-- My Lists Tab -->
        <TabsContent value="my-lists" class="mt-0">
          <Empty
            v-if="data.myLists.length === 0"
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

          <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card
              v-for="list in sortedMyLists"
              :key="list.id"
              class="group hover:shadow-md transition-shadow cursor-pointer"
            >
              <RouterLink :to="`/problemset/list/${list.id}`" class="block">
                <CardHeader class="pb-3">
                  <div class="flex items-start justify-between">
                    <div class="space-y-1 flex-1 min-w-0">
                      <CardTitle class="text-lg truncate">{{
                        list.name
                      }}</CardTitle>
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
                          @click.prevent="openDeleteListDialog(list)"
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
                  <div
                    class="flex items-center gap-4 text-xs text-muted-foreground"
                  >
                    <span class="flex items-center gap-1">
                      <List class="h-3 w-3" />
                      {{ list.problemCount }} problems
                    </span>
                  </div>
                </CardContent>
              </RouterLink>
            </Card>
          </div>
        </TabsContent>

        <!-- Saved Lists Tab -->
        <TabsContent value="saved" class="mt-0 space-y-6">
          <!-- Uncategorized Saved Lists -->
          <div v-if="sortedSavedLists.length > 0">
            <h3 class="text-lg font-semibold mb-4">Uncategorized</h3>
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card
                v-for="list in sortedSavedLists"
                :key="list.id"
                class="group hover:shadow-md transition-shadow cursor-pointer"
              >
                <RouterLink :to="`/problemset/list/${list.id}`" class="block">
                  <CardHeader class="pb-3">
                    <div class="flex items-start justify-between">
                      <div class="space-y-1 flex-1 min-w-0">
                        <CardTitle class="text-lg truncate">{{
                          list.name
                        }}</CardTitle>
                        <div class="flex items-center gap-2">
                          <Badge variant="secondary" class="gap-1 text-xs">
                            <Bookmark class="h-3 w-3" />
                            Saved
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
                        <DropdownMenuContent align="end" class="w-48">
                          <DropdownMenuSub
                            v-if="data.categories.length > 0"
                          >
                            <DropdownMenuSubTrigger>
                              <FolderInput class="mr-2 h-4 w-4" />
                              Move to Category
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                v-for="cat in data.categories"
                                :key="cat.id"
                                @click.prevent="
                                  handleMoveToCategory(list, cat.id)
                                "
                              >
                                {{ cat.name }}
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            @click.prevent="handleUnsaveList(list)"
                          >
                            <BookmarkMinus class="mr-2 h-4 w-4" />
                            Unsave
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
                    <div
                      class="flex items-center gap-4 text-xs text-muted-foreground"
                    >
                      <span class="flex items-center gap-1">
                        <List class="h-3 w-3" />
                        {{ list.problemCount }} problems
                      </span>
                    </div>
                  </CardContent>
                </RouterLink>
              </Card>
            </div>
          </div>

          <!-- Categories -->
          <div
            v-for="category in data.categories"
            :key="category.id"
            class="space-y-4"
          >
            <Collapsible :default-open="true">
              <div class="flex items-center justify-between">
                <CollapsibleTrigger
                  class="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <ChevronRight
                    class="h-4 w-4 transition-transform ui-open:rotate-90"
                  />
                  <h3 class="text-lg font-semibold">{{ category.name }}</h3>
                  <Badge variant="secondary">{{ category.lists.length }}</Badge>
                </CollapsibleTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-8 w-8">
                      <MoreHorizontal class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      @click="openEditCategoryDialog(category)"
                    >
                      <Pencil class="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      class="text-destructive focus:text-destructive"
                      @click="openDeleteCategoryDialog(category)"
                    >
                      <Trash2 class="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CollapsibleContent class="mt-4">
                <div
                  v-if="category.lists.length === 0"
                  class="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg"
                >
                  No lists in this category yet
                </div>
                <div
                  v-else
                  class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                  <Card
                    v-for="list in category.lists"
                    :key="list.id"
                    class="group hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <RouterLink
                      :to="`/problemset/list/${list.id}`"
                      class="block"
                    >
                      <CardHeader class="pb-3">
                        <div class="flex items-start justify-between">
                          <div class="space-y-1 flex-1 min-w-0">
                            <CardTitle class="text-lg truncate">{{
                              list.name
                            }}</CardTitle>
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
                            <DropdownMenuContent align="end" class="w-48">
                              <DropdownMenuItem
                                @click.prevent="
                                  handleMoveToCategory(list, null)
                                "
                              >
                                <FolderInput class="mr-2 h-4 w-4" />
                                Remove from Category
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                @click.prevent="handleUnsaveList(list)"
                              >
                                <BookmarkMinus class="mr-2 h-4 w-4" />
                                Unsave
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div
                          class="flex items-center gap-4 text-xs text-muted-foreground"
                        >
                          <span class="flex items-center gap-1">
                            <List class="h-3 w-3" />
                            {{ list.problemCount }} problems
                          </span>
                        </div>
                      </CardContent>
                    </RouterLink>
                  </Card>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <!-- Empty State for Saved -->
          <Empty
            v-if="data.savedLists.length === 0 && data.categories.length === 0"
            class="h-80 border border-dashed border-border/60 bg-muted/20 rounded-xl"
          >
            <EmptyContent>
              <EmptyMedia
                variant="icon"
                class="bg-background p-4 rounded-full shadow-sm mb-4"
              >
                <Bookmark class="h-8 w-8 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <h3 class="text-xl font-semibold text-foreground mb-1">
                  No saved lists yet
                </h3>
                <EmptyDescription class="text-base">
                  Save problem lists from others to find them here.
                </EmptyDescription>
              </EmptyHeader>
            </EmptyContent>
          </Empty>
        </TabsContent>

        <!-- Featured Tab -->
        <TabsContent value="featured" class="mt-0">
          <Empty
            v-if="data.featured.length === 0"
            class="h-80 border border-dashed border-border/60 bg-muted/20 rounded-xl"
          >
            <EmptyContent>
              <EmptyMedia
                variant="icon"
                class="bg-background p-4 rounded-full shadow-sm mb-4"
              >
                <Star class="h-8 w-8 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <h3 class="text-xl font-semibold text-foreground mb-1">
                  No featured lists
                </h3>
                <EmptyDescription class="text-base">
                  Featured problem lists will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </EmptyContent>
          </Empty>

          <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card
              v-for="list in data.featured"
              :key="list.id"
              class="group hover:shadow-md transition-shadow cursor-pointer"
            >
              <RouterLink :to="`/problemset/list/${list.id}`" class="block">
                <CardHeader class="pb-3">
                  <div class="flex items-start justify-between">
                    <div class="space-y-1 flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <CardTitle class="text-lg truncate">{{
                          list.name
                        }}</CardTitle>
                        <Star class="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </div>
                      <div class="flex items-center gap-2">
                        <Badge
                          v-if="list.isSaved"
                          variant="secondary"
                          class="gap-1 text-xs"
                        >
                          <Bookmark class="h-3 w-3" />
                          Saved
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p
                    v-if="list.description"
                    class="text-sm text-muted-foreground line-clamp-2 mb-3"
                  >
                    {{ list.description }}
                  </p>
                  <div
                    class="flex items-center gap-4 text-xs text-muted-foreground"
                  >
                    <span class="flex items-center gap-1">
                      <List class="h-3 w-3" />
                      {{ list.problemCount }} problems
                    </span>
                  </div>
                </CardContent>
              </RouterLink>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>

    <!-- Create List Dialog -->
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
            @click="handleCreateList"
            :disabled="isCreating || !createForm.name.trim()"
          >
            {{ isCreating ? "Creating..." : "Create List" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete List Confirmation -->
    <AlertDialog v-model:open="isDeleteListOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Problem List</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{{ listToDelete?.name }}"? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isDeletingList">Cancel</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="handleDeleteList"
            :disabled="isDeletingList"
          >
            {{ isDeletingList ? "Deleting..." : "Delete" }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Create Category Dialog -->
    <Dialog v-model:open="isCreateCategoryOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Create a category to organize your saved lists.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="category-name">Category Name</Label>
            <Input
              id="category-name"
              v-model="createCategoryForm.name"
              placeholder="e.g. Interview Prep"
              @keydown.enter="handleCreateCategory"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            @click="isCreateCategoryOpen = false"
            :disabled="isCreatingCategory"
          >
            Cancel
          </Button>
          <Button
            @click="handleCreateCategory"
            :disabled="isCreatingCategory || !createCategoryForm.name.trim()"
          >
            {{ isCreatingCategory ? "Creating..." : "Create" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Edit Category Dialog -->
    <Dialog v-model:open="isEditCategoryOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Category</DialogTitle>
          <DialogDescription>
            Enter a new name for this category.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="edit-category-name">Category Name</Label>
            <Input
              id="edit-category-name"
              v-model="editCategoryForm.name"
              @keydown.enter="handleEditCategory"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            @click="isEditCategoryOpen = false"
            :disabled="isEditingCategory"
          >
            Cancel
          </Button>
          <Button
            @click="handleEditCategory"
            :disabled="isEditingCategory || !editCategoryForm.name.trim()"
          >
            {{ isEditingCategory ? "Saving..." : "Save" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Category Confirmation -->
    <AlertDialog v-model:open="isDeleteCategoryOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{{ categoryToDelete?.name }}"?
            Lists in this category will be moved back to uncategorized.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isDeletingCategory"
            >Cancel</AlertDialogCancel
          >
          <AlertDialogAction
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="handleDeleteCategory"
            :disabled="isDeletingCategory"
          >
            {{ isDeletingCategory ? "Deleting..." : "Delete" }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
