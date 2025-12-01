const data = {
  submissions: [
    {
      id: "sub-two-sum-accepted",
      problem_id: 1,
      user_id: "u-001",
      status: "Accepted",
      runtime: "42 ms",
      memory: "7.2 MB",
      language: "TypeScript",
      submitted_at: "2024-11-12T08:10:00Z",
      runtime_percentile: 78,
      memory_percentile: 64,
      code: `
function twoSum(nums: number[], target: number) {
  const seen = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const other = target - nums[i];
    if (seen.has(other)) return [seen.get(other), i];
    seen.set(nums[i], i);
  }

  return [];
}
      `.trim(),
      notes: "Single pass hashmap with early exit.",
      tags_json: ["hash-map", "one-pass"],
      runtime_dist: [1, 3, 8, 10, 6, 2],
      runtime_dist_bins: [0, 10, 20, 30, 40, 50],
    },
    {
      id: "sub-add-two-wa",
      problem_id: 2,
      user_id: "u-001",
      status: "Wrong Answer",
      runtime: "58 ms",
      memory: "8.1 MB",
      language: "TypeScript",
      submitted_at: "2024-11-12T08:18:00Z",
      runtime_percentile: 52,
      memory_percentile: 47,
      code: `
function addTwoNumbers(l1, l2) {
  let carry = 0;
  const head = { val: 0, next: null };
  let cur = head;

  while (l1 || l2) {
    const sum = (l1?.val || 0) + (l2?.val || 0) + carry;
    carry = Math.floor(sum / 10);

    cur.next = { val: sum % 10, next: null };
    cur = cur.next;

    l1 = l1?.next;
    l2 = l2?.next;
  }

  return head.next;
}
      `.trim(),
      notes: "Forgot to handle remaining carry when both lists end.",
      tags_json: ["linked-list"],
      runtime_dist: [2, 4, 6, 4, 1],
      runtime_dist_bins: [0, 20, 40, 60, 80],
    },
    {
      id: "sub-container-accepted",
      problem_id: 3,
      user_id: "u-002",
      status: "Accepted",
      runtime: "65 ms",
      memory: "6.9 MB",
      language: "TypeScript",
      submitted_at: "2024-11-12T08:25:00Z",
      runtime_percentile: 81,
      memory_percentile: 73,
      code: `
function maxArea(h) {
  let l = 0;
  let r = h.length - 1;
  let b = 0;

  while (l < r) {
    b = Math.max(b, Math.min(h[l], h[r]) * (r - l));
    if (h[l] < h[r]) l++;
    else r--;
  }

  return b;
}
      `.trim(),
      notes: "Standard two-pointer sweep.",
      tags_json: ["two-pointers"],
      runtime_dist: [1, 5, 7, 5, 2],
      runtime_dist_bins: [0, 20, 40, 60, 80],
    },
    {
      id: "sub-level-order-accepted",
      problem_id: 5,
      user_id: "u-001",
      status: "Accepted",
      runtime: "54 ms",
      memory: "44.1 MB",
      language: "TypeScript",
      submitted_at: "2024-11-12T08:40:00Z",
      runtime_percentile: 84,
      memory_percentile: 69,
      code: `
function levelOrder(root) {
  if (!root) return [];

  const q = [root];
  const res = [];

  while (q.length) {
    const size = q.length;
    const level = [];

    for (let i = 0; i < size; i++) {
      const n = q.shift();
      level.push(n.val);
      n.left && q.push(n.left);
      n.right && q.push(n.right);
    }

    res.push(level);
  }

  return res;
}
      `.trim(),
      notes: "Queue sized by level so children go to the next layer.",
      tags_json: ["bfs", "tree"],
      runtime_dist: [1, 4, 9, 6, 2],
      runtime_dist_bins: [0, 20, 40, 60, 80],
    },
    {
      id: "sub-lru-cache-accepted",
      problem_id: 6,
      user_id: "u-001",
      status: "Accepted",
      runtime: "112 ms",
      memory: "14.2 MB",
      language: "TypeScript",
      submitted_at: "2024-11-12T08:55:00Z",
      runtime_percentile: 74,
      memory_percentile: 58,
      code: `
class LRUCache {
  constructor(c) {
    this.c = c;
    this.m = new Map();
    this.h = { p: null, n: null };
    this.t = { p: this.h, n: null };
    this.h.n = this.t;
    this.t.p = this.h;
  }

  rm(x) {
    x.p.n = x.n;
    x.n.p = x.p;
  }

  ad(x) {
    x.n = this.h.n;
    x.p = this.h;
    this.h.n.p = x;
    this.h.n = x;
  }

  get(k) {
    const n = this.m.get(k);
    if (!n) return -1;
    this.rm(n);
    this.ad(n);
    return n.v;
  }

  put(k, v) {
    if (this.m.has(k)) {
      const n = this.m.get(k);
      n.v = v;
      this.rm(n);
      this.ad(n);
      return;
    }

    if (this.m.size === this.c) {
      const l = this.t.p;
      this.rm(l);
      this.m.delete(l.k);
    }

    const node = { k, v, p: null, n: null };
    this.ad(node);
    this.m.set(k, node);
  }
}
      `.trim(),
      notes: "Dummy head/tail keeps removals and inserts constant time.",
      tags_json: ["design", "hash-map", "linked-list"],
      runtime_dist: [0, 3, 7, 8, 5, 1],
      runtime_dist_bins: [0, 25, 50, 75, 100, 125],
    },
  ],
  submission_tests: [
    {
      id: "st-two-sum",
      submission_id: "sub-two-sum-accepted",
      label: "Primary",
      status: "Accepted",
      runtime: "2 ms",
    },
    {
      id: "st-add-two",
      submission_id: "sub-add-two-wa",
      label: "Primary",
      status: "Wrong Answer",
      runtime: "—",
    },
    {
      id: "st-container",
      submission_id: "sub-container-accepted",
      label: "Primary",
      status: "Accepted",
      runtime: "3 ms",
    },
    {
      id: "st-level-order",
      submission_id: "sub-level-order-accepted",
      label: "Primary",
      status: "Accepted",
      runtime: "54 ms",
    },
    {
      id: "st-lru-cache",
      submission_id: "sub-lru-cache-accepted",
      label: "Primary",
      status: "Accepted",
      runtime: "112 ms",
    },
  ],
} as const;

export default data;
