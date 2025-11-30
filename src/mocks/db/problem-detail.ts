

const now = "2024-11-01T00:00:00.000Z";

const data = {
  problem_details: [
    {
      id: "pd-two-sum",
      problem_id: 1,
      slug: "two-sum",
      summary:
        "Given an integer array and a target, return the indices of the two numbers that add up to the target so that $nums[i] + nums[j] = target$. Exactly one valid pair exists per test case, and an element cannot be reused.",
      companies: ["Amazon", "Google"],
      interactions: {
        counts: { likes: 1240, dislikes: 42, favorites: 580 },
        viewer: { reaction: "like", isFavorite: true },
      },
      difficulty_rating: 1197,
      updated_at: now,
      follow_up: "How would you handle a sorted array without extra space?",
      constraints_json: ["$2 \\leq n \\leq 10^4$", "$-10^9 \\leq nums[i], target \\leq 10^9$"],
    },
    {
      id: "pd-add-two-numbers",
      problem_id: 2,
      slug: "add-two-numbers",
      summary:
        "Two non-empty linked lists represent non-negative integers in reverse order. Add them digit by digit with carry where $carry = \\lfloor (x + y + carry) / 10 \\rfloor$, and return the sum as a linked list in the same reversed order.",
      companies: ["Microsoft", "ByteDance"],
      interactions: {
        counts: { likes: 980, dislikes: 31, favorites: 460 },
        viewer: { reaction: null, isFavorite: false },
      },
      difficulty_rating: 1420,
      updated_at: now,
      follow_up: "Try writing a recursive variant and discuss its stack cost.",
      constraints_json: ["$1 \\leq len(l1), len(l2) \\leq 100$", "Nodes store a single digit"],
    },
    {
      id: "pd-container",
      problem_id: 3,
      slug: "container-with-most-water",
      summary:
        "Given n vertical lines represented by an array of heights, pick two lines that maximize container area $A(i,j) = \\min(h_i, h_j) \\times (j - i)$. Return the maximal area.",
      companies: ["Meta"],
      interactions: {
        counts: { likes: 840, dislikes: 22, favorites: 390 },
        viewer: { reaction: "like", isFavorite: false },
      },
      difficulty_rating: 1360,
      updated_at: now,
      follow_up: "Discuss why a greedy inward two-pointer scan is optimal.",
      constraints_json: ["$2 \\leq n \\leq 10^5$", "$0 \\leq height[i] \\leq 10^4$"],
    },
    {
      id: "pd-min-cost",
      problem_id: 4,
      slug: "min-cost-to-connect-all-points",
      summary:
        "You are given n points on a 2D plane. Connect all points so the total cost of edges defined by $|x_i - x_j| + |y_i - y_j|$ is minimized; return the minimum spanning tree cost.",
      companies: ["Amazon", "Uber"],
      interactions: {
        counts: { likes: 760, dislikes: 28, favorites: 320 },
        viewer: { reaction: null, isFavorite: false },
      },
      difficulty_rating: 1820,
      updated_at: now,
      follow_up:
        "Can you avoid materializing all $O(n^2)$ edges by using Prim with a priority queue?",
      constraints_json: [
        "$1 \\leq n \\leq 1000$",
        "$points[i].length = 2$",
        "$-10^6 \\leq points[i][j] \\leq 10^6$",
      ],
    },
    {
      id: "pd-level-order",
      problem_id: 5,
      slug: "binary-tree-level-order-traversal",
      summary:
        "Given the root of a binary tree, return its node values level by level from top to bottom using breadth-first search with $O(n)$ time and $O(n)$ space.",
      companies: ["Google", "Bloomberg"],
      interactions: {
        counts: { likes: 1340, dislikes: 58, favorites: 640 },
        viewer: { reaction: "dislike", isFavorite: true },
      },
      difficulty_rating: 1510,
      updated_at: now,
      follow_up: "How would you produce a zigzag level order in one pass?",
      constraints_json: [
        "$0 \\leq nodes \\leq 10^4$",
        "$-1000 \\leq Node.val \\leq 1000$",
        "Tree may be unbalanced",
      ],
    },
    {
      id: "pd-lru-cache",
      problem_id: 6,
      slug: "lru-cache",
      summary:
        "Design a Least Recently Used (LRU) cache that supports $O(1)$ `get` and `put` by combining a hash map with a doubly linked list, evicting the least recently used key when capacity is exceeded.",
      companies: ["Amazon", "Apple"],
      interactions: {
        counts: { likes: 1780, dislikes: 210, favorites: 880 },
        viewer: { reaction: "like", isFavorite: false },
      },
      difficulty_rating: 1910,
      updated_at: now,
      follow_up: "Discuss how you would make the cache thread-safe or add TTL eviction.",
      constraints_json: [
        "$1 \\leq capacity \\leq 3000$",
        "$0 \\leq key, value \\leq 10^4$",
        "At most $10^5$ operations",
      ],
    },
  ],
  problem_examples: [
    {
      id: "ex-two-sum-1",
      problem_id: 1,
      example_order: 0,
      input_text: "nums = [2,7,11,15], target = 9",
      output_text: "[0,1]",
      explanation: "7 + 2 = 9 so indices 0 and 1 satisfy the condition.",
    },
    {
      id: "ex-add-two-1",
      problem_id: 2,
      example_order: 0,
      input_text: "l1 = [2,4,3], l2 = [5,6,4]",
      output_text: "[7,0,8]",
      explanation: "342 + 465 = 807, returned in reversed order.",
    },
    {
      id: "ex-container-1",
      problem_id: 3,
      example_order: 0,
      input_text: "height = [1,8,6,2,5,4,8,3,7]",
      output_text: "49",
      explanation: "Lines at index 1 and 8 form the optimal container.",
    },
    {
      id: "ex-min-cost-1",
      problem_id: 4,
      example_order: 0,
      input_text: "points = [[0,0],[2,2],[3,10],[5,2],[7,0]]",
      output_text: "20",
      explanation:
        "The MST uses edges (0-1),(1-3),(3-4),(1-2) with weights 4 + 3 + 4 + 9 = 20.",
    },
    {
      id: "ex-min-cost-2",
      problem_id: 4,
      example_order: 1,
      input_text: "points = [[3,12],[-2,5],[-4,1]]",
      output_text: "18",
      explanation:
        "Connecting [-4,1] → [-2,5] → [3,12] yields total cost 18.",
    },
    {
      id: "ex-level-order-1",
      problem_id: 5,
      example_order: 0,
      input_text: "root = [3,9,20,null,null,15,7]",
      output_text: "[[3],[9,20],[15,7]]",
      explanation: "Queue breadth-first traversal groups nodes by depth.",
    },
    {
      id: "ex-level-order-2",
      problem_id: 5,
      example_order: 1,
      input_text: "root = [1]",
      output_text: "[[1]]",
      explanation: "Single node forms one level.",
    },
    {
      id: "ex-lru-cache-1",
      problem_id: 6,
      example_order: 0,
      input_text:
        'operations = ["LRUCache","put","put","get","put","get","put","get","get","get"], values = [[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]',
      output_text: "[null,null,null,1,null,-1,null,-1,3,4]",
      explanation:
        "Key 2 becomes least used after accessing 1, so it is evicted when 4 is inserted.",
    },
  ],
  problem_approaches: [
    {
      id: "ap-two-sum-one-pass",
      problem_id: 1,
      title: "One-pass hashmap",
      summary:
        "Scan once using a hash map from value to index to find complements in O(n).",
      time_complexity: "O(n)",
      space_complexity: "O(n)",
      code_snippet:
        "function twoSum(nums: number[], target: number) {\n  const seen = new Map<number, number>()\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i]\n    if (seen.has(complement)) return [seen.get(complement)!, i]\n    seen.set(nums[i], i)\n  }\n  return []\n}",
      language: "TypeScript",
    },
    {
      id: "ap-two-sum-brute-force",
      problem_id: 1,
      title: "Brute force approach",
      summary:
        "Use two nested loops to check every pair of numbers until finding the target sum.",
      time_complexity: "O(n^2)",
      space_complexity: "O(1)",
      code_snippet:
        "function twoSum(nums: number[], target: number): number[] {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) {\n        return [i, j]\n      }\n    }\n  }\n  return []\n}",
      language: "TypeScript",
    },
    {
      id: "ap-add-two-iterative",
      problem_id: 2,
      title: "Iterative carry propagation",
      summary:
        "Walk both lists, compute digit sums with carry, and append nodes to a new list.",
      time_complexity: "O(m+n)",
      space_complexity: "O(max(m,n))",
      code_snippet:
        "function addTwoNumbers(l1, l2) {\n  let carry = 0, head = { val: 0, next: null }, cur = head\n  while (l1 || l2 || carry) {\n    const x = l1?.val ?? 0, y = l2?.val ?? 0\n    const sum = x + y + carry\n    carry = Math.floor(sum / 10)\n    cur.next = { val: sum % 10, next: null }\n    cur = cur.next\n    l1 = l1?.next ?? null\n    l2 = l2?.next ?? null\n  }\n  return head.next\n}",
      language: "JavaScript",
    },
    {
      id: "ap-add-two-recursive",
      problem_id: 2,
      title: "Recursive solution",
      summary:
        "Recursively add corresponding digits with carry propagation through function calls.",
      time_complexity: "O(m+n)",
      space_complexity: "O(max(m,n))",
      code_snippet:
        "function addTwoNumbers(l1, l2, carry = 0) {\n  if (!l1 && !l2 && !carry) return null\n  const sum = (l1?.val ?? 0) + (l2?.val ?? 0) + carry\n  const node = { val: sum % 10, next: null }\n  node.next = addTwoNumbers(\n    l1?.next ?? null,\n    l2?.next ?? null,\n    Math.floor(sum / 10)\n  )\n  return node\n}",
      language: "JavaScript",
    },
    {
      id: "ap-container-two-pointers",
      problem_id: 3,
      title: "Two-pointer shrink",
      summary:
        "Start at both ends and move the smaller height inward to maximize area greedily.",
      time_complexity: "O(n)",
      space_complexity: "O(1)",
      code_snippet:
        "function maxArea(h: number[]) {\n  let l = 0, r = h.length - 1, best = 0\n  while (l < r) {\n    best = Math.max(best, Math.min(h[l], h[r]) * (r - l))\n    if (h[l] < h[r]) l++\n    else r--\n  }\n  return best\n}",
      language: "TypeScript",
    },
    {
      id: "ap-container-brute-force",
      problem_id: 3,
      title: "Brute force all pairs",
      summary:
        "Check every possible pair of lines to find the maximum container area.",
      time_complexity: "O(n^2)",
      space_complexity: "O(1)",
      code_snippet:
        "function maxArea(height: number[]): number {\n  let maxArea = 0\n  for (let i = 0; i < height.length; i++) {\n    for (let j = i + 1; j < height.length; j++) {\n      const area = Math.min(height[i], height[j]) * (j - i)\n      maxArea = Math.max(maxArea, area)\n    }\n  }\n  return maxArea\n}",
      language: "TypeScript",
    },
    {
      id: "ap-min-cost-kruskal",
      problem_id: 4,
      title: "Kruskal with union-find",
      summary:
        "Enumerate all O(n^2) edges with Manhattan weight, sort them, and connect components greedily.",
      time_complexity: "O(n^2 log n)",
      space_complexity: "O(n^2)",
      code_snippet:
        "function minCostConnectPoints(points: number[][]): number {\n  const n = points.length\n  const parent = Array.from({ length: n }, (_, i) => i)\n  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))\n  const union = (a: number, b: number): boolean => {\n    const pa = find(a), pb = find(b)\n    if (pa === pb) return false\n    parent[pb] = pa\n    return true\n  }\n  const edges: Array<[number, number, number]> = []\n  for (let i = 0; i < n; i++) {\n    for (let j = i + 1; j < n; j++) {\n      const w = Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1])\n      edges.push([w, i, j])\n    }\n  }\n  edges.sort((a, b) => a[0] - b[0])\n  let cost = 0, used = 0\n  for (const [w, u, v] of edges) {\n    if (union(u, v)) {\n      cost += w\n      if (++used === n - 1) break\n    }\n  }\n  return cost\n}",
      language: "TypeScript",
    },
    {
      id: "ap-min-cost-prim",
      problem_id: 4,
      title: "Prim's algorithm with priority queue",
      summary:
        "Start from any point and greedily add the minimum cost edge to expand the MST.",
      time_complexity: "O(n^2 log n)",
      space_complexity: "O(n)",
      code_snippet:
        "function minCostConnectPoints(points: number[][]): number {\n  const n = points.length\n  const visited = new Set<number>()\n  const minHeap: [number, number][] = [[0, 0]] // [cost, point]\n  let totalCost = 0\n\n  while (visited.size < n) {\n    minHeap.sort((a, b) => a[0] - b[0])\n    const [cost, point] = minHeap.shift()!\n    if (visited.has(point)) continue\n    \n    visited.add(point)\n    totalCost += cost\n\n    for (let next = 0; next < n; next++) {\n      if (!visited.has(next)) {\n        const dist = Math.abs(points[point][0] - points[next][0]) +\n                     Math.abs(points[point][1] - points[next][1])\n        minHeap.push([dist, next])\n      }\n    }\n  }\n  return totalCost\n}",
      language: "TypeScript",
    },
    {
      id: "ap-level-order-bfs",
      problem_id: 5,
      title: "Queue breadth-first scan",
      summary:
        "Walk the tree with a queue, processing a fixed level length each iteration to group nodes by depth.",
      time_complexity: "O(n)",
      space_complexity: "O(n)",
      code_snippet:
        "interface TreeNode { val: number; left: TreeNode | null; right: TreeNode | null }\nfunction levelOrder(root: TreeNode | null): number[][] {\n  if (!root) return []\n  const res: number[][] = []\n  const queue: TreeNode[] = [root]\n  while (queue.length) {\n    const size = queue.length\n    const level: number[] = []\n    for (let i = 0; i < size; i++) {\n      const node = queue.shift()!\n      level.push(node.val)\n      if (node.left) queue.push(node.left)\n      if (node.right) queue.push(node.right)\n    }\n    res.push(level)\n  }\n  return res\n}",
      language: "TypeScript",
    },
    {
      id: "ap-level-order-recursive",
      problem_id: 5,
      title: "Recursive DFS with level tracking",
      summary:
        "Use recursion with depth parameter to collect nodes at each level into the corresponding result array.",
      time_complexity: "O(n)",
      space_complexity: "O(h)",
      code_snippet:
        "interface TreeNode { val: number; left: TreeNode | null; right: TreeNode | null }\nfunction levelOrder(root: TreeNode | null): number[][] {\n  const result: number[][] = []\n  \n  function dfs(node: TreeNode | null, level: number) {\n    if (!node) return\n    if (result.length === level) result.push([])\n    result[level].push(node.val)\n    dfs(node.left, level + 1)\n    dfs(node.right, level + 1)\n  }\n  \n  dfs(root, 0)\n  return result\n}",
      language: "TypeScript",
    },
    {
      id: "ap-lru-dll",
      problem_id: 6,
      title: "Hash map + doubly linked list",
      summary:
        "Track nodes in a hash map and move them to the head of a doubly linked list on access; evict from the tail when capacity is full.",
      time_complexity: "O(1) per op",
      space_complexity: "O(capacity)",
      code_snippet:
        "class LRUCache {\n  private capacity: number\n  private map = new Map<number, { key: number; value: number; prev: any; next: any }>()\n  private head = { key: -1, value: -1, prev: null as any, next: null as any }\n  private tail = { key: -1, value: -1, prev: null as any, next: null as any }\n  constructor(capacity: number) {\n    this.capacity = capacity\n    this.head.next = this.tail\n    this.tail.prev = this.head\n  }\n  private remove(node: any) {\n    node.prev.next = node.next\n    node.next.prev = node.prev\n  }\n  private addFront(node: any) {\n    node.next = this.head.next\n    node.prev = this.head\n    this.head.next.prev = node\n    this.head.next = node\n  }\n  get(key: number): number {\n    const node = this.map.get(key)\n    if (!node) return -1\n    this.remove(node)\n    this.addFront(node)\n    return node.value\n  }\n  put(key: number, value: number): void {\n    if (this.map.has(key)) {\n      const node = this.map.get(key)!\n      node.value = value\n      this.remove(node)\n      this.addFront(node)\n      return\n    }\n    if (this.map.size === this.capacity) {\n      const lru = this.tail.prev!\n      this.remove(lru)\n      this.map.delete(lru.key)\n    }\n    const node = { key, value, prev: null as any, next: null as any }\n    this.addFront(node)\n    this.map.set(key, node)\n  }\n}",
      language: "TypeScript",
    },
    {
      id: "ap-lru-ordered-map",
      problem_id: 6,
      title: "Using OrderedDict/Map",
      summary:
        "Leverage built-in ordered map to track access order and evict oldest entry when at capacity.",
      time_complexity: "O(1) per op",
      space_complexity: "O(capacity)",
      code_snippet:
        "class LRUCache {\n  private capacity: number\n  private cache: Map<number, number>\n\n  constructor(capacity: number) {\n    this.capacity = capacity\n    this.cache = new Map()\n  }\n\n  get(key: number): number {\n    if (!this.cache.has(key)) return -1\n    const value = this.cache.get(key)!\n    // Re-insert to update order\n    this.cache.delete(key)\n    this.cache.set(key, value)\n    return value\n  }\n\n  put(key: number, value: number): void {\n    if (this.cache.has(key)) {\n      this.cache.delete(key)\n    } else if (this.cache.size >= this.capacity) {\n      // Remove oldest (first) entry\n      const firstKey = this.cache.keys().next().value\n      this.cache.delete(firstKey)\n    }\n    this.cache.set(key, value)\n  }\n}",
      language: "TypeScript",
    },
  ],
  problem_approach_steps: [
    {
      id: "step-two-sum-1",
      approach_id: "ap-two-sum-one-pass",
      step_order: 0,
      content: "Maintain a map from value to index as you iterate.",
    },
    {
      id: "step-two-sum-2",
      approach_id: "ap-two-sum-one-pass",
      step_order: 1,
      content:
        "For each value, look up its complement before inserting the current number.",
    },
    {
      id: "step-two-sum-3",
      approach_id: "ap-two-sum-one-pass",
      step_order: 2,
      content:
        "Return the stored index and current index once a complement is found.",
    },
    {
      id: "step-add-two-1",
      approach_id: "ap-add-two-iterative",
      step_order: 0,
      content: "Iterate through both lists while a node or carry exists.",
    },
    {
      id: "step-add-two-2",
      approach_id: "ap-add-two-iterative",
      step_order: 1,
      content: "Compute digit sum plus carry, push a new node, update carry.",
    },
    {
      id: "step-add-two-3",
      approach_id: "ap-add-two-iterative",
      step_order: 2,
      content: "Advance pointers and return the built list head.",
    },
    {
      id: "step-container-1",
      approach_id: "ap-container-two-pointers",
      step_order: 0,
      content: "Initialize two pointers at the ends of the array.",
    },
    {
      id: "step-container-2",
      approach_id: "ap-container-two-pointers",
      step_order: 1,
      content:
        "Compute area and move the pointer on the smaller height inward.",
    },
    {
      id: "step-container-3",
      approach_id: "ap-container-two-pointers",
      step_order: 2,
      content: "Track the maximum area until pointers cross.",
    },
    {
      id: "step-min-cost-1",
      approach_id: "ap-min-cost-kruskal",
      step_order: 0,
      content: "Generate all pairwise Manhattan edge weights from the points list.",
    },
    {
      id: "step-min-cost-2",
      approach_id: "ap-min-cost-kruskal",
      step_order: 1,
      content: "Sort edges ascending so the smallest bridge is always considered first.",
    },
    {
      id: "step-min-cost-3",
      approach_id: "ap-min-cost-kruskal",
      step_order: 2,
      content:
        "Use union-find to connect components and add an edge only if it links two different sets.",
    },
    {
      id: "step-level-order-1",
      approach_id: "ap-level-order-bfs",
      step_order: 0,
      content: "Return early if the root is null to avoid empty queue access.",
    },
    {
      id: "step-level-order-2",
      approach_id: "ap-level-order-bfs",
      step_order: 1,
      content: "Push the root into a queue and iterate while the queue has nodes.",
    },
    {
      id: "step-level-order-3",
      approach_id: "ap-level-order-bfs",
      step_order: 2,
      content:
        "For each level, read the current queue length, process that many nodes, and enqueue children.",
    },
    {
      id: "step-level-order-4",
      approach_id: "ap-level-order-bfs",
      step_order: 3,
      content: "Append the collected values per level to the result array.",
    },
    {
      id: "step-lru-1",
      approach_id: "ap-lru-dll",
      step_order: 0,
      content: "Use dummy head/tail nodes so inserts and removals never need null checks.",
    },
    {
      id: "step-lru-2",
      approach_id: "ap-lru-dll",
      step_order: 1,
      content: "On get, move the node to the front and return its value.",
    },
    {
      id: "step-lru-3",
      approach_id: "ap-lru-dll",
      step_order: 2,
      content:
        "On put, update and promote existing nodes; otherwise evict the tail's previous node when full, then insert the new node at the front.",
    },
  ],
  problem_languages: [
    {
      id: "lang-ts-1",
      problem_id: 1,
      label: "TypeScript",
      value: "typescript",
      starter_code:
        "function twoSum(nums: number[], target: number): number[] {\n  const seen = new Map<number, number>()\n  for (let i = 0; i < nums.length; i++) {\n    const other = target - nums[i]\n    if (seen.has(other)) return [seen.get(other)!, i]\n    seen.set(nums[i], i)\n  }\n  return []\n}",
    },
    {
      id: "lang-ts-2",
      problem_id: 2,
      label: "TypeScript",
      value: "typescript",
      starter_code:
        "interface ListNode { val: number; next: ListNode | null }\nfunction addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {\n  let carry = 0\n  const dummy: ListNode = { val: 0, next: null }\n  let cur = dummy\n  while (l1 || l2 || carry) {\n    const sum = (l1?.val ?? 0) + (l2?.val ?? 0) + carry\n    carry = Math.floor(sum / 10)\n    cur.next = { val: sum % 10, next: null }\n    cur = cur.next\n    l1 = l1?.next ?? null\n    l2 = l2?.next ?? null\n  }\n  return dummy.next\n}",
    },
    {
      id: "lang-ts-3",
      problem_id: 3,
      label: "TypeScript",
      value: "typescript",
      starter_code:
        "function maxArea(height: number[]): number {\n  let l = 0, r = height.length - 1, best = 0\n  while (l < r) {\n    best = Math.max(best, Math.min(height[l], height[r]) * (r - l))\n    if (height[l] < height[r]) l++\n    else r--\n  }\n  return best\n}",
    },
    {
      id: "lang-ts-4",
      problem_id: 4,
      label: "TypeScript",
      value: "typescript",
      starter_code:
        "function minCostConnectPoints(points: number[][]): number {\n  const n = points.length\n  const parent = Array.from({ length: n }, (_, i) => i)\n  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))\n  const union = (a: number, b: number): boolean => {\n    const pa = find(a), pb = find(b)\n    if (pa === pb) return false\n    parent[pb] = pa\n    return true\n  }\n  const edges: Array<[number, number, number]> = []\n  for (let i = 0; i < n; i++) {\n    for (let j = i + 1; j < n; j++) {\n      const w = Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1])\n      edges.push([w, i, j])\n    }\n  }\n  edges.sort((a, b) => a[0] - b[0])\n  let cost = 0, used = 0\n  for (const [w, u, v] of edges) {\n    if (union(u, v)) {\n      cost += w\n      if (++used === n - 1) break\n    }\n  }\n  return cost\n}",
    },
    {
      id: "lang-ts-5",
      problem_id: 5,
      label: "TypeScript",
      value: "typescript",
      starter_code:
        "interface TreeNode { val: number; left: TreeNode | null; right: TreeNode | null }\nfunction levelOrder(root: TreeNode | null): number[][] {\n  const result: number[][] = []\n  // TODO: implement BFS\n  return result\n}",
    },
    {
      id: "lang-ts-6",
      problem_id: 6,
      label: "TypeScript",
      value: "typescript",
      starter_code:
        "class LRUCache {\n  constructor(capacity: number) {\n    // TODO: store capacity and init linked list sentinels\n  }\n  get(key: number): number {\n    return -1\n  }\n  put(key: number, value: number): void {\n    // TODO: update or insert and evict LRU when full\n  }\n}",
    },
  ],
  problem_starter_notes: [
    {
      id: "note-two-sum",
      problem_id: 1,
      content:
        "Store complements before inserting current value to avoid duplicate reuse.",
    },
    {
      id: "note-add-two",
      problem_id: 2,
      content:
        "Remember to handle the final carry after processing both lists.",
    },
    {
      id: "note-container",
      problem_id: 3,
      content: "Only the smaller edge can improve area when moved inward.",
    },
    {
      id: "note-min-cost",
      problem_id: 4,
      content:
        "Union-find keeps Kruskal simple here; Prim with a priority queue reduces memory if n grows.",
    },
    {
      id: "note-level-order",
      problem_id: 5,
      content: "Read the queue length up front for each layer so new children do not leak into the current level.",
    },
    {
      id: "note-lru-cache",
      problem_id: 6,
      content: "The node right before the tail sentinel is always the eviction target; move nodes to the head when touched.",
    },
  ],
  problem_recent_results: [
    {
      id: "recent-two-sum",
      problem_id: 1,
      case_label: "Sanity",
      status: "Accepted",
      runtime: "2 ms",
      memory: "3.9 MB",
      detail: "Hash map hits the pair early.",
    },
    {
      id: "recent-add-two",
      problem_id: 2,
      case_label: "Carry stress",
      status: "Accepted",
      runtime: "8 ms",
      memory: "6.2 MB",
      detail: "Carry propagates across long list.",
    },
    {
      id: "recent-container",
      problem_id: 3,
      case_label: "Wide span",
      status: "Accepted",
      runtime: "5 ms",
      memory: "5.1 MB",
      detail: "Two-pointer sweep finds max span.",
    },
    {
      id: "recent-min-cost",
      problem_id: 4,
      case_label: "Dense edges",
      status: "Accepted",
      runtime: "112 ms",
      memory: "55.3 MB",
      detail: "Sorting O(n^2) edges still passes for n up to 1e3.",
    },
    {
      id: "recent-level-order",
      problem_id: 5,
      case_label: "Layered BFS",
      status: "Accepted",
      runtime: "54 ms",
      memory: "44.1 MB",
      detail: "Queue length guards prevent cross-level mixing on skewed trees.",
    },
    {
      id: "recent-lru-cache",
      problem_id: 6,
      case_label: "Eviction",
      status: "Accepted",
      runtime: "112 ms",
      memory: "14.2 MB",
      detail: "Tail eviction fired twice after promoting hot keys to the head.",
    },
  ],
} as const;

export default data;
