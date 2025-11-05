import {requestData} from '@/utils/request';

export interface DifficultyInfo {
  id?: number | null;
  code?: string | null;
  label?: string | null;
}

export interface TagInfo {
  id?: number | null;
  name: string;
  slug?: string | null;
}

export interface ProblemStats {
  timeLimitMs?: number | null;
  memoryLimitKb?: number | null;
}

export interface ProblemMetadata {
  companies: string[];
  frequency?: number | null;
  paidOnly?: boolean | null;
  frontendId?: number | null;
  leetcodeStyle?: boolean | null;
}

export interface ProblemLanguageConfig {
  languageId?: number | null;
  languageCode?: string | null;
  languageName?: string | null;
  functionName?: string | null;
  starterCode?: string | null;
}

export interface ProblemCard {
  id: number;
  slug: string;
  title: string;
  difficulty?: DifficultyInfo | null;
  tags: TagInfo[];
  stats?: ProblemStats | null;
  metadata: ProblemMetadata;
  updatedAt?: string | null;
}

export interface ProblemListResponse {
  total: number;
  page: number;
  size: number;
  hasMore: boolean;
  items: ProblemCard[];
}

export interface ProblemDetail {
  id: number;
  slug: string;
  title: string;
  descriptionMd: string;
  constraintsMd?: string | null;
  examplesMd?: string | null;
  difficulty?: DifficultyInfo | null;
  stats?: ProblemStats | null;
  metadata: ProblemMetadata;
  tags: TagInfo[];
  languages: ProblemLanguageConfig[];
  updatedAt?: string | null;
}

export interface FetchProblemParams {
  page?: number;
  size?: number;
  lang?: string;
}

export interface FetchProblemDetailParams {
  lang?: string;
}

export function fetchPublicProblems(params?: FetchProblemParams) {
  return requestData<ProblemListResponse>({
    url: '/api/public/problems',
    method: 'GET',
    params
  });
}

export function fetchProblemDetail(slug: string, params?: FetchProblemDetailParams) {
  return requestData<ProblemDetail>({
    url: `/api/public/problems/${slug}`,
    method: 'GET',
    params
  });
}
