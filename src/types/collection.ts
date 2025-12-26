export enum CollectionTargetType {
  PROBLEM = "PROBLEM",
  SOLUTION = "SOLUTION",
  FORUM_POST = "FORUM_POST",
  PROBLEM_LIST = "PROBLEM_LIST",
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
  itemCount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItem {
  id: string;
  targetId: string;
  targetType: CollectionTargetType;
  sortOrder: number;
  note: string | null;
  createdAt: string;
}

export interface CollectionWithItems extends Omit<Collection, "itemCount"> {
  items: CollectionItem[];
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

export interface AddItemInput {
  targetId: string;
  targetType: CollectionTargetType;
  note?: string;
}

export interface UpdateItemInput {
  note?: string;
  sortOrder?: number;
}
