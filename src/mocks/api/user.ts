import userData from "@/mocks/db/user";
import type { User, UserDataset, UserId } from "@/mocks/schema/user";

const dataset = userData as unknown as UserDataset;

const userMap = new Map<UserId, User>(dataset.users.map((u) => [u.id, u]));

export function fetchCurrentUserId(): UserId {
  return dataset.currentUserId;
}

export function fetchCurrentUser(): User {
  const user = userMap.get(dataset.currentUserId);
  if (!user) {
    throw new Error("Current user not found in dataset");
  }
  return { ...user };
}

export function getUserById(id: UserId): User | undefined {
  const user = userMap.get(id);
  return user ? { ...user } : undefined;
}
