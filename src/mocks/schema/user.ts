export type UserId = string

export interface UserRow {
  id: UserId
  username: string
  name?: string
  email?: string
  avatar?: string
}

export type User = UserRow

export interface UserDataset {
  currentUserId: UserId
  users: UserRow[]
}
