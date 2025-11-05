import type { ProblemMetadata, ProblemStats, TagInfo } from '@/api/problem/problems'

export const mockMetadata: ProblemMetadata = {
  companies: ['字节跳动', '阿里巴巴', '腾讯'],
  frequency: 87,
  paidOnly: false,
  frontendId: 1,
  leetcodeStyle: true,
}

export const mockStats: ProblemStats = {
  timeLimitMs: 1000,
  memoryLimitKb: 512 * 1024,
}

export const mockTags: TagInfo[] = [
  {
    id: 101,
    name: '数组',
    slug: 'array',
  },
  {
    id: 102,
    name: '哈希表',
    slug: 'hash-table',
  },
  {
    id: 103,
    name: '双指针',
    slug: 'two-pointers',
  },
]
