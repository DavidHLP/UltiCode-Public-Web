import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/types/collection";
import {
  fetchCollections,
  createCollection as apiCreateCollection,
  updateCollection as apiUpdateCollection,
  deleteCollection as apiDeleteCollection,
  reorderCollections as apiReorderCollections,
} from "@/api/collection";

export const useCollectionStore = defineStore("collection", () => {
  const collections = ref<Collection[]>([]);
  const isLoading = ref(false);
  const isLoaded = ref(false);

  const defaultCollection = computed(() =>
    collections.value.find((c) => c.isDefault),
  );

  const customCollections = computed(() =>
    collections.value.filter((c) => !c.isDefault),
  );

  async function loadCollections(force = false) {
    if (isLoaded.value && !force) return;

    isLoading.value = true;
    try {
      collections.value = await fetchCollections();
      isLoaded.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  async function createCollection(
    data: CreateCollectionInput,
  ): Promise<Collection> {
    const newCollection = await apiCreateCollection(data);
    collections.value.push(newCollection);
    return newCollection;
  }

  async function updateCollection(
    id: string,
    data: UpdateCollectionInput,
  ): Promise<Collection> {
    const updated = await apiUpdateCollection(id, data);
    const index = collections.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      collections.value[index] = updated;
    }
    return updated;
  }

  async function removeCollection(id: string): Promise<void> {
    await apiDeleteCollection(id);
    collections.value = collections.value.filter((c) => c.id !== id);
  }

  async function reorderCollections(ids: string[]): Promise<void> {
    await apiReorderCollections(ids);
    // Update local sort order
    ids.forEach((id, index) => {
      const collection = collections.value.find((c) => c.id === id);
      if (collection) {
        collection.sortOrder = index;
      }
    });
    // Re-sort the array
    collections.value.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return a.sortOrder - b.sortOrder;
    });
  }

  function updateItemCount(collectionId: string, delta: number) {
    const collection = collections.value.find((c) => c.id === collectionId);
    if (collection) {
      collection.itemCount = Math.max(0, collection.itemCount + delta);
    }
  }

  function reset() {
    collections.value = [];
    isLoaded.value = false;
    isLoading.value = false;
  }

  return {
    collections,
    isLoading,
    isLoaded,
    defaultCollection,
    customCollections,
    loadCollections,
    createCollection,
    updateCollection,
    removeCollection,
    reorderCollections,
    updateItemCount,
    reset,
  };
});
