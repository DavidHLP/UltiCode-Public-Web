import type { MockDatabase } from "../validation/validator";

const now = "2024-11-01T00:00:00.000Z";

const data = {
  problem_details: [
    {
      id: "pd-two-sum",
      problem_id: 1,
      slug: "two-sum",
      summary:
        "Return the indices of two numbers that sum to a target. Exactly one pair exists in each test.",
      companies: ["Amazon", "Google"],
      likes: 1240,
      dislikes: 42,
      difficulty_rating: 1197,
      updated_at: now,
      follow_up: "How would you handle a sorted array without extra space?",
      constraints_json: ["2 <= n <= 1e4", "-1e9 <= nums[i], target <= 1e9"],
    },
    {
      id: "pd-add-two-numbers",
      problem_id: 2,
      slug: "add-two-numbers",
      summary:
        "Add two numbers represented by linked lists, returning a new list in reversed digit order.",
      companies: ["Microsoft", "ByteDance"],
      likes: 980,
      dislikes: 31,
      difficulty_rating: 1420,
      updated_at: now,
      follow_up: "Try writing a recursive variant and discuss its stack cost.",
      constraints_json: [
        "1 <= len(l1), len(l2) <= 100",
        "Nodes store a single digit",
      ],
    },
    {
      id: "pd-container",
      problem_id: 3,
      slug: "container-with-most-water",
      summary:
        "Given line heights, find two lines that form the container with the maximum water.",
      companies: ["Meta"],
      likes: 840,
      dislikes: 22,
      difficulty_rating: 1360,
      updated_at: now,
      follow_up: "Discuss why a greedy inward two-pointer scan is optimal.",
      constraints_json: ["2 <= n <= 1e5", "0 <= height[i] <= 1e4"],
    },
    {
      id: "pd-min-cost",
      problem_id: 4,
      slug: "min-cost-to-connect-all-points",
      summary:
        "Connect every point with edges weighted by Manhattan distance while minimizing the total cost.",
      companies: ["Amazon", "Uber"],
      likes: 760,
      dislikes: 28,
      difficulty_rating: 1820,
      updated_at: now,
      follow_up:
        "Can you avoid materializing all O(n^2) edges by using Prim with a priority queue?",
      constraints_json: [
        "1 <= n <= 1000",
        "points[i].length == 2",
        "-1e6 <= points[i][j] <= 1e6",
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
  ],
} as const satisfies MockDatabase;

export default data;
