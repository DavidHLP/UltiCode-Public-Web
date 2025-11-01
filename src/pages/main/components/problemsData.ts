// 难度配置
export const difficultyOptions = [
  {
    label: '简单',
    value: 'easy',
    icon: null,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
  },
  {
    label: '中等',
    value: 'medium',
    icon: null,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
  },
  {
    label: '困难',
    value: 'hard',
    icon: null,
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
  },
]

// 题目状态配置
export const problemStatuses = [
  {
    value: 'unsolved',
    label: '未解决',
    icon: null,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300'
  },
  {
    value: 'solved',
    label: '已解决',
    icon: null,
    color: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300'
  },
  {
    value: 'attempted',
    label: '尝试过',
    icon: null,
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300'
  },
]

// 常见标签配置（可以根据实际数据动态生成）
export const commonTags = [
  { label: '数组', value: 'array', category: '数据结构' },
  { label: '链表', value: 'linked-list', category: '数据结构' },
  { label: '字符串', value: 'string', category: '算法' },
  { label: '动态规划', value: 'dynamic-programming', category: '算法' },
  { label: '双指针', value: 'two-pointers', category: '算法' },
  { label: '哈希表', value: 'hash-table', category: '数据结构' },
  { label: '树', value: 'tree', category: '数据结构' },
  { label: '二叉树', value: 'binary-tree', category: '数据结构' },
  { label: '图', value: 'graph', category: '数据结构' },
  { label: '深度优先搜索', value: 'dfs', category: '算法' },
  { label: '广度优先搜索', value: 'bfs', category: '算法' },
  { label: '二分查找', value: 'binary-search', category: '算法' },
  { label: '排序', value: 'sorting', category: '算法' },
  { label: '贪心', value: 'greedy', category: '算法' },
  { label: '回溯', value: 'backtracking', category: '算法' },
  { label: '栈', value: 'stack', category: '数据结构' },
  { label: '队列', value: 'queue', category: '数据结构' },
  { label: '堆', value: 'heap', category: '数据结构' },
  { label: '递归', value: 'recursion', category: '算法' },
  { label: '数学', value: 'math', category: '数学' },
  { label: '位运算', value: 'bit-manipulation', category: '算法' },
]

// 公司标签配置
export const companyOptions = [
  { label: '阿里巴巴', value: 'alibaba' },
  { label: '腾讯', value: 'tencent' },
  { label: '百度', value: 'baidu' },
  { label: '字节跳动', value: 'bytedance' },
  { label: '美团', value: 'meituan' },
  { label: '京东', value: 'jd' },
  { label: '网易', value: 'netease' },
  { label: '小米', value: 'xiaomi' },
  { label: '华为', value: 'huawei' },
  { label: '苹果', value: 'apple' },
  { label: '谷歌', value: 'google' },
  { label: '微软', value: 'microsoft' },
  { label: '亚马逊', value: 'amazon' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Netflix', value: 'netflix' },
]

// 分页选项
export const pageSizeOptions = [10, 20, 30, 40, 50, 100]

// 默认显示列配置
export const defaultVisibleColumns = [
  'select',
  'id',
  'title',
  'difficulty',
  'tags',
  'actions'
]