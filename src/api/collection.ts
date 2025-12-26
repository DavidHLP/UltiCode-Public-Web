import { apiGet, apiPost, apiPatch, apiDelete } from "@/utils/request";
import type {
  Collection,
  CollectionWithItems,
  CollectionItem,
  CreateCollectionInput,
  UpdateCollectionInput,
  AddItemInput,
  UpdateItemInput,
  CollectionTargetType,
} from "@/types/collection";

export { CollectionTargetType } from "@/types/collection";

export async function fetchCollections(): Promise<Collection[]> {
  return apiGet<Collection[]>("/collections");
}

export async function fetchCollection(
  id: string,
): Promise<CollectionWithItems> {
  return apiGet<CollectionWithItems>(`/collections/${id}`);
}

export async function createCollection(
  data: CreateCollectionInput,
): Promise<Collection> {
  return apiPost<Collection>("/collections", data);
}

export async function updateCollection(
  id: string,
  data: UpdateCollectionInput,
): Promise<Collection> {
  return apiPatch<Collection>(`/collections/${id}`, data);
}

export async function deleteCollection(id: string): Promise<void> {
  await apiDelete(`/collections/${id}`);
}

export async function addItemToCollection(
  collectionId: string,
  data: AddItemInput,
): Promise<CollectionItem> {
  return apiPost<CollectionItem>(`/collections/${collectionId}/items`, data);
}

export async function removeItemFromCollection(
  collectionId: string,
  itemId: string,
): Promise<void> {
  await apiDelete(`/collections/${collectionId}/items/${itemId}`);
}

export async function removeItemByTarget(
  collectionId: string,
  targetType: CollectionTargetType,
  targetId: string,
): Promise<void> {
  await apiDelete(
    `/collections/${collectionId}/items/target/${targetType}/${targetId}`,
  );
}

export async function updateCollectionItem(
  collectionId: string,
  itemId: string,
  data: UpdateItemInput,
): Promise<CollectionItem> {
  return apiPatch<CollectionItem>(
    `/collections/${collectionId}/items/${itemId}`,
    data,
  );
}

export async function getItemCollections(
  targetType: CollectionTargetType,
  targetId: string,
): Promise<string[]> {
  return apiGet<string[]>(`/collections/item/${targetType}/${targetId}`);
}

export async function reorderCollections(
  collectionIds: string[],
): Promise<void> {
  await apiPost("/collections/reorder", { collectionIds });
}
