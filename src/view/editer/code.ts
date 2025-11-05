import type { DifficultyInfo, ProblemLanguageConfig } from '@/api/problem/problems'

export const mockProblemBasics: {
  id: number
  slug: string
  title: string
  difficulty: DifficultyInfo
  updatedAt: string
} = {
  id: 1001,
  slug: 'two-sum',
  title: '两数之和',
  difficulty: {
    code: 'easy',
    label: '简单',
  },
  updatedAt: '2024-01-01T08:00:00Z',
}

export const mockLanguages: ProblemLanguageConfig[] = [
  {
    languageId: 1,
    languageCode: 'javascript',
    languageName: 'JavaScript',
    functionName: 'twoSum',
    starterCode: `function twoSum(nums, target) {
  const indexByValue = new Map();
  for (let i = 0; i < nums.length; i += 1) {
    const complement = target - nums[i];
    if (indexByValue.has(complement)) {
      return [indexByValue.get(complement), i];
    }
    indexByValue.set(nums[i], i);
  }
  return [];
}
`,
  },
  {
    languageId: 2,
    languageCode: 'python',
    languageName: 'Python',
    functionName: 'twoSum',
    starterCode: `from typing import List


class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        index_by_value: dict[int, int] = {}
        for i, value in enumerate(nums):
            complement = target - value
            if complement in index_by_value:
                return [index_by_value[complement], i]
            index_by_value[value] = i
        return []
`,
  },
  {
    languageId: 3,
    languageCode: 'typescript',
    languageName: 'TypeScript',
    functionName: 'twoSum',
    starterCode: `export function twoSum(nums: number[], target: number): number[] {
  const indexByValue = new Map<number, number>();
  for (let i = 0; i < nums.length; i += 1) {
    const complement = target - nums[i];
    if (indexByValue.has(complement)) {
      return [indexByValue.get(complement) as number, i];
    }
    indexByValue.set(nums[i], i);
  }
  return [];
}
`,
  },
]
