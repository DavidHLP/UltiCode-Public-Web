<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Plus, Loader2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import CollectionList from "@/components/collection/CollectionList.vue";
import CreateCollectionDialog from "@/components/collection/CreateCollectionDialog.vue";
import { useCollectionStore } from "@/stores/collection";
import { fetchCollection } from "@/api/collection";
import type {
  Collection,
  CollectionWithItems,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/types/collection";
import { toast } from "vue-sonner";

const store = useCollectionStore();

const selectedCollectionId = ref<string | null>(null);
const selectedCollectionDetails = ref<CollectionWithItems | null>(null);
const isLoadingDetails = ref(false);

const showCreateDialog = ref(false);
const editingCollection = ref<Collection | null>(null);
const showDeleteDialog = ref(false);
const deletingCollection = ref<Collection | null>(null);

const selectedCollection = computed(() =>
  store.collections.find((c) => c.id === selectedCollectionId.value),
);

async function loadCollectionDetails(id: string) {
  isLoadingDetails.value = true;
  try {
    selectedCollectionDetails.value = await fetchCollection(id);
  } catch (error) {
    console.error("Failed to load collection details:", error);
    toast.error("Failed to load collection");
  } finally {
    isLoadingDetails.value = false;
  }
}

function handleSelectCollection(collection: Collection) {
  selectedCollectionId.value = collection.id;
  loadCollectionDetails(collection.id);
}

function handleEditCollection(collection: Collection) {
  editingCollection.value = collection;
  showCreateDialog.value = true;
}

function handleDeleteCollection(collection: Collection) {
  deletingCollection.value = collection;
  showDeleteDialog.value = true;
}

async function handleCreateCollection(data: CreateCollectionInput) {
  try {
    const newCollection = await store.createCollection(data);
    toast.success("Collection created");
    handleSelectCollection(newCollection);
  } catch (error) {
    console.error("Failed to create collection:", error);
    toast.error("Failed to create collection");
  }
}

async function handleUpdateCollection(id: string, data: UpdateCollectionInput) {
  try {
    await store.updateCollection(id, data);
    toast.success("Collection updated");
    if (selectedCollectionId.value === id) {
      loadCollectionDetails(id);
    }
  } catch (error) {
    console.error("Failed to update collection:", error);
    toast.error("Failed to update collection");
  }
}

async function confirmDelete() {
  if (!deletingCollection.value) return;

  try {
    await store.removeCollection(deletingCollection.value.id);
    toast.success("Collection deleted");
    if (selectedCollectionId.value === deletingCollection.value.id) {
      selectedCollectionId.value = null;
      selectedCollectionDetails.value = null;
    }
  } catch (error) {
    console.error("Failed to delete collection:", error);
    toast.error("Failed to delete collection");
  } finally {
    showDeleteDialog.value = false;
    deletingCollection.value = null;
  }
}

function handleDialogClose() {
  showCreateDialog.value = false;
  editingCollection.value = null;
}

onMounted(() => {
  store.loadCollections(true);
});
</script>

<template>
  <div class="container mx-auto py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">My Collections</h1>
      <Button @click="showCreateDialog = true">
        <Plus class="mr-2 h-4 w-4" />
        New Collection
      </Button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Collection List -->
      <Card class="md:col-span-1">
        <CardHeader>
          <CardTitle class="text-lg">Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="store.isLoading" class="flex justify-center py-8">
            <Loader2 class="h-6 w-6 animate-spin" />
          </div>
          <CollectionList
            v-else
            :collections="store.collections"
            :selected-id="selectedCollectionId ?? undefined"
            @select="handleSelectCollection"
            @edit="handleEditCollection"
            @delete="handleDeleteCollection"
          />
        </CardContent>
      </Card>

      <!-- Collection Details -->
      <Card class="md:col-span-2">
        <CardHeader>
          <CardTitle class="text-lg">
            {{ selectedCollection?.name ?? "Select a collection" }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="isLoadingDetails" class="flex justify-center py-8">
            <Loader2 class="h-6 w-6 animate-spin" />
          </div>
          <div
            v-else-if="!selectedCollectionDetails"
            class="py-8 text-center text-muted-foreground"
          >
            Select a collection to view its items
          </div>
          <div
            v-else-if="selectedCollectionDetails.items.length === 0"
            class="py-8 text-center text-muted-foreground"
          >
            This collection is empty
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="item in selectedCollectionDetails.items"
              :key="item.id"
              class="flex items-center justify-between p-3 rounded-md border"
            >
              <div>
                <p class="text-sm font-medium">{{ item.targetType }}</p>
                <p class="text-xs text-muted-foreground">
                  ID: {{ item.targetId }}
                </p>
                <p v-if="item.note" class="text-xs text-muted-foreground mt-1">
                  {{ item.note }}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Create/Edit Dialog -->
    <CreateCollectionDialog
      :open="showCreateDialog"
      :collection="editingCollection"
      @update:open="handleDialogClose"
      @create="handleCreateCollection"
      @update="handleUpdateCollection"
    />

    <!-- Delete Confirmation Dialog -->
    <AlertDialog
      :open="showDeleteDialog"
      @update:open="showDeleteDialog = $event"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Collection</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{{ deletingCollection?.name }}"?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteDialog = false">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="confirmDelete"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
