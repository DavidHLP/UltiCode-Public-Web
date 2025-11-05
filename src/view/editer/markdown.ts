export const mockMarkdownDescription = `
# 示例题目：两数之和

给定一个整数数组 \`nums\` 和一个目标值 \`target\`，请在数组中找出和为目标值的两个整数，并返回它们的数组下标。

可以假设每种输入只会对应一个答案，但是，数组中同一个元素在答案里不能重复出现。你可以按任意顺序返回答案。
`

export const mockMarkdownConstraints = `
## 约束条件

- $2 \\leq nums.length \\leq 10^4$
- $-10^9 \\leq nums[i] \\leq 10^9$
- $-10^9 \\leq target \\leq 10^9$
- **仅存在一个有效答案**
`

export const mockMarkdownExamples = `
## 样例一

\`\`\`text
输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：nums[0] + nums[1] == 9，返回 [0,1]
\`\`\`

## 样例二

\`\`\`text
输入：nums = [3,2,4], target = 6
输出：[1,2]
\`\`\`

## 样例三

\`\`\`text
输入：nums = [3,3], target = 6
输出：[0,1]
\`\`\`
`
