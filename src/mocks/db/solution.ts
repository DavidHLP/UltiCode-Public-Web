const data = {
  fallbackMetaId: "sol-two-sum",
  solution_filter_options: [
    {
      id: "quick-popular",
      kind: "quick",
      label: "Most popular",
      value: "popular",
    },
    { id: "quick-latest", kind: "quick", label: "Latest", value: "latest" },
    { id: "sort-likes", kind: "sort", label: "Most likes", value: "likes" },
    { id: "sort-newest", kind: "sort", label: "Newest", value: "newest" },
    { id: "sort-heat", kind: "sort", label: "Heat", value: "heat" },
  ],
  solution_authors: [
    {
      id: "author-system",
      name: "System",
      role: "Editorial",
      avatar_color: "#94a3b8",
    },
    {
      id: "author-lee",
      name: "Lee",
      role: "TypeScript · Demo",
      avatar_color: "#0ea5e9",
    },
    {
      id: "author-ivy",
      name: "Ivy",
      role: "Algorithms · Demo",
      avatar_color: "#10b981",
    },
    {
      id: "author-alex",
      name: "Alex",
      role: "Python Expert",
      avatar_color: "#f59e0b",
    },
    {
      id: "author-chen",
      name: "Chen",
      role: "Java Developer",
      avatar_color: "#8b5cf6",
    },
    {
      id: "author-kim",
      name: "Kim",
      role: "C++ Specialist",
      avatar_color: "#ec4899",
    },
  ],
  solution_badges: [
    { id: "badge-one-pass", label: "One pass" },
    { id: "badge-clear", label: "Clear reasoning" },
    { id: "badge-two-pointers", label: "Two pointers" },
    { id: "badge-bfs", label: "BFS" },
    { id: "badge-design", label: "Design" },
    { id: "badge-cache", label: "Cache" },
    { id: "badge-dynamic-programming", label: "DP" },
    { id: "badge-greedy", label: "Greedy" },
    { id: "badge-binary-search", label: "Binary Search" },
    { id: "badge-sliding-window", label: "Sliding Window" },
    { id: "badge-dfs", label: "DFS" },
    { id: "badge-backtracking", label: "Backtracking" },
  ],
  solution_metas: [
    {
      id: "sol-two-sum",
      highlight: "Two Sum: one-pass hashmap explained with diagrams",
      flair: "Featured",
      author_id: "author-lee",
      views_text: "12.3K",
      likes: 128,
      comments: 14,
      created_at: "2024-08-01T08:00:00.000Z",
      published_at: "2024-08-01T09:00:00.000Z",
      topic: "arrays",
      language_filter: "typescript",
      score: 90,
      content: `# Two Sum Solution

## Approach

Use a HashMap to implement a one-pass solution with O(n) time complexity.

## Algorithm Steps

1. Create a hash table to store visited numbers and their indices
2. Iterate through each element in the array
3. For current element nums[i], calculate complement = target - nums[i]
4. Check if complement exists in the hash table
5. If exists, return [hash table index, i]
6. If not, store current element and index in hash table

## Code Implementation

\`\`\`typescript
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}
\`\`\`

## Complexity Analysis

- **Time Complexity**: $O(n)$ - Only need to traverse the array once
- **Space Complexity**: $O(n)$ - Worst case needs to store n elements in hash table

## Key Points

- Use Map instead of object for better performance
- Search while traversing, no need for two passes
- Handle duplicate elements carefully`,
    },
    {
      id: "sol-container",
      highlight: "Container With Most Water: proof for the two-pointer shrink",
      flair: "Deep dive",
      author_id: "author-system",
      views_text: "9.1K",
      likes: 96,
      comments: 7,
      created_at: "2024-08-02T10:00:00.000Z",
      published_at: "2024-08-02T11:00:00.000Z",
      topic: "two-pointers",
      language_filter: "python",
      score: 86,
      content: `# Container With Most Water - Two Pointers

## Algorithm Approach

Use two pointers from both ends moving towards center, each time move the pointer with shorter height.

## Proof

The container area is determined by two factors:
1. Distance between two lines (width)
2. The shorter line (height)

When we move the shorter pointer, although width decreases, we might find a taller line to get larger area.

## Code Implementation

\`\`\`python
def maxArea(height: List[int]) -> int:
    left, right = 0, len(height) - 1
    max_area = 0
    
    while left < right:
        # Calculate current area
        width = right - left
        current_height = min(height[left], height[right])
        current_area = width * current_height
        max_area = max(max_area, current_area)
        
        # Move the shorter pointer
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    
    return max_area
\`\`\`

## Complexity

- **Time Complexity**: $O(n)$
- **Space Complexity**: $O(1)$`,
    },
    {
      id: "sol-level-order",
      highlight: "Binary Tree Level Order Traversal: queue-first BFS with diagrams",
      flair: "Editorial",
      author_id: "author-lee",
      views_text: "7.8K",
      likes: 88,
      comments: 6,
      created_at: "2024-08-04T08:00:00.000Z",
      published_at: "2024-08-04T09:00:00.000Z",
      topic: "tree",
      language_filter: "java",
      score: 82,
      content: `# Binary Tree Level Order Traversal - BFS

## Algorithm Approach

Use queue to implement Breadth-First Search (BFS), traverse tree level by level.

## Key Steps

1. Initialize queue and enqueue root node
2. For each level:
   - Record the number of nodes in current level
   - Dequeue these nodes sequentially
   - Enqueue their children
3. Repeat until queue is empty

## Code Implementation

\`\`\`java
public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;
    
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    
    while (!queue.isEmpty()) {
        int levelSize = queue.size();
        List<Integer> currentLevel = new ArrayList<>();
        
        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            currentLevel.add(node.val);
            
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        
        result.add(currentLevel);
    }
    
    return result;
}
\`\`\`

## Complexity Analysis

- **Time Complexity**: $O(n)$ - Traverse all nodes
- **Space Complexity**: $O(n)$ - Queue stores at most one level of nodes`,
    },
    {
      id: "sol-lru-cache",
      highlight: "LRU Cache: hashmap + doubly linked list implementation notes",
      flair: "Systems",
      author_id: "author-ivy",
      views_text: "15.2K",
      likes: 173,
      comments: 21,
      created_at: "2024-08-05T10:00:00.000Z",
      published_at: "2024-08-05T11:00:00.000Z",
      topic: "design",
      language_filter: "cpp",
      score: 93,
      content: `# LRU Cache Design

## Design Approach

Combine HashMap and Doubly Linked List to achieve O(1) time complexity for get and put operations.

## Core Data Structures

- **HashMap**: Achieve O(1) lookup
- **Doubly Linked List**: Maintain usage order, support O(1) insertion and deletion

## Key Operations

1. **get**: Find and move to head of list
2. **put**: Insert/update, remove least recently used item when necessary

## Code Implementation

\`\`\`cpp
class LRUCache {
private:
    struct Node {
        int key, value;
        Node *prev, *next;
        Node(int k, int v) : key(k), value(v), prev(nullptr), next(nullptr) {}
    };
    
    int capacity;
    unordered_map<int, Node*> cache;
    Node *head, *tail;
    
    void moveToHead(Node* node) {
        removeNode(node);
        addToHead(node);
    }
    
    void removeNode(Node* node) {
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }
    
    void addToHead(Node* node) {
        node->next = head->next;
        node->prev = head;
        head->next->prev = node;
        head->next = node;
    }
    
public:
    LRUCache(int cap) : capacity(cap) {
        head = new Node(0, 0);
        tail = new Node(0, 0);
        head->next = tail;
        tail->prev = head;
    }
    
    int get(int key) {
        if (cache.find(key) == cache.end()) return -1;
        Node* node = cache[key];
        moveToHead(node);
        return node->value;
    }
    
    void put(int key, int value) {
        if (cache.find(key) != cache.end()) {
            Node* node = cache[key];
            node->value = value;
            moveToHead(node);
        } else {
            Node* node = new Node(key, value);
            cache[key] = node;
            addToHead(node);
            
            if (cache.size() > capacity) {
                Node* removed = tail->prev;
                removeNode(removed);
                cache.erase(removed->key);
                delete removed;
            }
        }
    }
};
\`\`\`

## Complexity

- **Time Complexity**: Both get and put are $O(1)$
- **Space Complexity**: $O(capacity)$`,
    },
    {
      id: "sol-climbing-stairs",
      highlight: "Climbing Stairs: Dynamic Programming approach with optimization",
      flair: "Tutorial",
      author_id: "author-alex",
      views_text: "18.5K",
      likes: 245,
      comments: 32,
      created_at: "2024-08-06T14:00:00.000Z",
      published_at: "2024-08-06T15:00:00.000Z",
      topic: "dynamic-programming",
      language_filter: "python",
      score: 95,
      content: `# Climbing Stairs - Dynamic Programming

## Problem Analysis

Let f(n) represent the number of ways to reach the nth step, then f(n) = f(n-1) + f(n-2).

\`\`\`python
def climbStairs(n: int) -> int:
    if n <= 2:
        return n
    
    # Space optimization: only keep previous two states
    prev, curr = 1, 2
    
    for i in range(3, n + 1):
        prev, curr = curr, prev + curr
    
    return curr
\`\`\`

## Complexity

- **Time**: $O(n)$
- **Space**: $O(1)$`,
    },
    {
      id: "sol-merge-intervals",
      highlight: "Merge Intervals: Sorting and greedy algorithm explained",
      flair: "Popular",
      author_id: "author-chen",
      views_text: "10.2K",
      likes: 156,
      comments: 18,
      created_at: "2024-08-07T09:00:00.000Z",
      published_at: "2024-08-07T10:00:00.000Z",
      topic: "intervals",
      language_filter: "java",
      score: 88,
      content: `# Merge Intervals - Sort + Greedy

## Algorithm Steps

1. Sort intervals by start position
2. Iterate and merge overlapping intervals

\`\`\`java
public int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    List<int[]> result = new ArrayList<>();
    
    for (int[] interval : intervals) {
        if (result.isEmpty() || result.get(result.size()-1)[1] < interval[0]) {
            result.add(interval);
        } else {
            result.get(result.size()-1)[1] = Math.max(result.get(result.size()-1)[1], interval[1]);
        }
    }
    
    return result.toArray(new int[result.size()][]);
}
\`\`\`

## Complexity

- **Time**: $O(n \\log n)$
- **Space**: $O(n)$`,
    },
    {
      id: "sol-binary-search",
      highlight: "Binary Search: Template and variations with examples",
      flair: "Template",
      author_id: "author-kim",
      views_text: "14.8K",
      likes: 198,
      comments: 25,
      created_at: "2024-08-08T11:00:00.000Z",
      published_at: "2024-08-08T12:00:00.000Z",
      topic: "binary-search",
      language_filter: "cpp",
      score: 91,
      content: `# Binary Search Template

## Standard Template

\`\`\`cpp
int binarySearch(vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}
\`\`\`

## Complexity

- **Time**: $O(\\log n)$
- **Space**: $O(1)$`,
    },
    {
      id: "sol-sliding-window",
      highlight: "Longest Substring: Sliding window technique step by step",
      flair: "Beginner Friendly",
      author_id: "author-alex",
      views_text: "11.7K",
      likes: 142,
      comments: 19,
      created_at: "2024-08-09T08:00:00.000Z",
      published_at: "2024-08-09T09:00:00.000Z",
      topic: "string",
      language_filter: "javascript",
      score: 84,
      content: `# Longest Substring Without Repeating Characters - Sliding Window

## Algorithm Approach

Use two pointers to maintain a sliding window ensuring no duplicate characters.

\`\`\`javascript
function lengthOfLongestSubstring(s) {
    const set = new Set();
    let left = 0, maxLen = 0;
    
    for (let right = 0; right < s.length; right++) {
        while (set.has(s[right])) {
            set.delete(s[left]);
            left++;
        }
        set.add(s[right]);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    
    return maxLen;
}
\`\`\`

## Complexity: $O(n)$`,
    },
    {
      id: "sol-graph-dfs",
      highlight: "Graph DFS: Island counting with detailed walkthrough",
      flair: "Visual",
      author_id: "author-lee",
      views_text: "13.2K",
      likes: 167,
      comments: 22,
      created_at: "2024-08-10T13:00:00.000Z",
      published_at: "2024-08-10T14:00:00.000Z",
      topic: "graph",
      language_filter: "typescript",
      score: 89,
      content: `# Number of Islands - DFS Solution

\`\`\`typescript
function numIslands(grid: string[][]): number {
    let count = 0;
    
    function dfs(i: number, j: number) {
        if (i < 0 || j < 0 || i >= grid.length || j >= grid[0].length || grid[i][j] === '0') {
            return;
        }
        grid[i][j] = '0';
        dfs(i+1, j);
        dfs(i-1, j);
        dfs(i, j+1);
        dfs(i, j-1);
    }
    
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] === '1') {
                count++;
                dfs(i, j);
            }
        }
    }
    
    return count;
}
\`\`\`

## Complexity: $O(m \\times n)$`,
    },
    {
      id: "sol-backtrack",
      highlight: "N-Queens: Backtracking pattern with pruning optimization",
      flair: "Advanced",
      author_id: "author-chen",
      views_text: "8.9K",
      likes: 134,
      comments: 16,
      created_at: "2024-08-11T10:00:00.000Z",
      published_at: "2024-08-11T11:00:00.000Z",
      topic: "backtracking",
      language_filter: "python",
      score: 87,
      content: `# N-Queens Problem - Backtracking

\`\`\`python
def solveNQueens(n: int) -> List[List[str]]:
    result = []
    board = [['.'] * n for _ in range(n)]
    cols = set()
    diag1 = set()
    diag2 = set()
    
    def backtrack(row):
        if row == n:
            result.append([''.join(r) for r in board])
            return
        
        for col in range(n):
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue
            
            board[row][col] = 'Q'
            cols.add(col)
            diag1.add(row - col)
            diag2.add(row + col)
            
            backtrack(row + 1)
            
            board[row][col] = '.'
            cols.remove(col)
            diag1.remove(row - col)
            diag2.remove(row + col)
    
    backtrack(0)
    return result
\`\`\``,
    },
    {
      id: "sol-heap",
      highlight: "Top K Elements: Heap data structure master guide",
      flair: "Comprehensive",
      author_id: "author-kim",
      views_text: "16.4K",
      likes: 211,
      comments: 28,
      created_at: "2024-08-12T15:00:00.000Z",
      published_at: "2024-08-12T16:00:00.000Z",
      topic: "heap",
      language_filter: "java",
      score: 92,
      content: `# Top K Elements - Heap Solution

## Use Min Heap to Maintain K Largest Elements

\`\`\`java
public int[] topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> count = new HashMap<>();
    for (int num : nums) {
        count.put(num, count.getOrDefault(num, 0) + 1);
    }
    
    PriorityQueue<Integer> heap = new PriorityQueue<>(
        (a, b) -> count.get(a) - count.get(b)
    );
    
    for (int num : count.keySet()) {
        heap.offer(num);
        if (heap.size() > k) {
            heap.poll();
        }
    }
    
    int[] result = new int[k];
    for (int i = 0; i < k; i++) {
        result[i] = heap.poll();
    }
    return result;
}
\`\`\`

## Complexity: $O(n \\log k)$`,
    },
    {
      id: "sol-trie",
      highlight: "Trie Implementation: Auto-complete system design",
      flair: "System Design",
      author_id: "author-ivy",
      views_text: "12.1K",
      likes: 189,
      comments: 24,
      created_at: "2024-08-13T12:00:00.000Z",
      published_at: "2024-08-13T13:00:00.000Z",
      topic: "trie",
      language_filter: "cpp",
      score: 90,
      content: `# Trie Implementation - Prefix Tree

\`\`\`cpp
class Trie {
private:
    struct TrieNode {
        unordered_map<char, TrieNode*> children;
        bool isEnd = false;
    };
    TrieNode* root;
    
public:
    Trie() {
        root = new TrieNode();
    }
    
    void insert(string word) {
        TrieNode* node = root;
        for (char c : word) {
            if (!node->children.count(c)) {
                node->children[c] = new TrieNode();
            }
            node = node->children[c];
        }
        node->isEnd = true;
    }
    
    bool search(string word) {
        TrieNode* node = root;
        for (char c : word) {
            if (!node->children.count(c)) return false;
            node = node->children[c];
        }
        return node->isEnd;
    }
};
\`\`\`

## Complexity: $O(m)$, where m is string length`,
    },
  ],
  solution_badge_relations: [
    { badge_id: "badge-one-pass", meta_id: "sol-two-sum" },
    { badge_id: "badge-clear", meta_id: "sol-two-sum" },
    { badge_id: "badge-two-pointers", meta_id: "sol-container" },
    { badge_id: "badge-bfs", meta_id: "sol-level-order" },
    { badge_id: "badge-clear", meta_id: "sol-level-order" },
    { badge_id: "badge-design", meta_id: "sol-lru-cache" },
    { badge_id: "badge-cache", meta_id: "sol-lru-cache" },
    { badge_id: "badge-dynamic-programming", meta_id: "sol-climbing-stairs" },
    { badge_id: "badge-clear", meta_id: "sol-climbing-stairs" },
    { badge_id: "badge-greedy", meta_id: "sol-merge-intervals" },
    { badge_id: "badge-binary-search", meta_id: "sol-binary-search" },
    { badge_id: "badge-clear", meta_id: "sol-binary-search" },
    { badge_id: "badge-sliding-window", meta_id: "sol-sliding-window" },
    { badge_id: "badge-two-pointers", meta_id: "sol-sliding-window" },
    { badge_id: "badge-dfs", meta_id: "sol-graph-dfs" },
    { badge_id: "badge-clear", meta_id: "sol-graph-dfs" },
    { badge_id: "badge-backtracking", meta_id: "sol-backtrack" },
    { badge_id: "badge-dfs", meta_id: "sol-backtrack" },
    { badge_id: "badge-design", meta_id: "sol-heap" },
    { badge_id: "badge-clear", meta_id: "sol-heap" },
    { badge_id: "badge-design", meta_id: "sol-trie" },
    { badge_id: "badge-cache", meta_id: "sol-trie" },
  ],
} as const;

export default data;
