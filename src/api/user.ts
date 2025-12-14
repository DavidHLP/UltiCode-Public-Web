import { apiGet } from "@/utils/request";

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
  joined_at?: string;
  rank?: number;
  solved_count?: number;
  submission_count?: number;
}

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  return apiGet<UserProfile>(`/users/${userId}`);
}
