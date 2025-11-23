export interface SolutionTopic {
  id: string; // unique id, may be numeric but stored as string
  name: string; // English display name
  slug: string; // slug key
  nameTranslated: string; // localized name (may be empty)
}

export interface SolutionTopicsResponse {
  topics: SolutionTopic[];
}
