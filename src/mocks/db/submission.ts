import type { MockDatabase } from '../validation/validator'

const data = {
  submissions: [
    {
      id: 'sub-two-sum-accepted',
      problem_id: 1,
      user_id: 'u-001',
      status: 'Accepted',
      runtime: '42 ms',
      memory: '7.2 MB',
      language: 'TypeScript',
      submitted_at: '2024-11-12T08:10:00Z',
      runtime_percentile: 78,
      memory_percentile: 64,
      code:
        'function twoSum(nums:number[], target:number){ const seen=new Map(); for(let i=0;i<nums.length;i++){ const other=target-nums[i]; if(seen.has(other)) return [seen.get(other), i]; seen.set(nums[i], i);} return [] }',
      notes: 'Single pass hashmap with early exit.',
      tags_json: ['hash-map', 'one-pass'],
      runtime_dist: [1, 3, 8, 10, 6, 2],
      runtime_dist_bins: [0, 10, 20, 30, 40, 50],
    },
    {
      id: 'sub-add-two-wa',
      problem_id: 2,
      user_id: 'u-001',
      status: 'Wrong Answer',
      runtime: '58 ms',
      memory: '8.1 MB',
      language: 'TypeScript',
      submitted_at: '2024-11-12T08:18:00Z',
      runtime_percentile: 52,
      memory_percentile: 47,
      code:
        'function addTwoNumbers(l1,l2){ let carry=0, head={val:0,next:null}, cur=head; while(l1||l2){ const sum=(l1?.val||0)+(l2?.val||0)+carry; carry=Math.floor(sum/10); cur.next={val:sum%10,next:null}; cur=cur.next; l1=l1?.next; l2=l2?.next;} return head.next }',
      notes: 'Forgot to handle remaining carry when both lists end.',
      tags_json: ['linked-list'],
      runtime_dist: [2, 4, 6, 4, 1],
      runtime_dist_bins: [0, 20, 40, 60, 80],
    },
    {
      id: 'sub-container-accepted',
      problem_id: 3,
      user_id: 'u-002',
      status: 'Accepted',
      runtime: '65 ms',
      memory: '6.9 MB',
      language: 'TypeScript',
      submitted_at: '2024-11-12T08:25:00Z',
      runtime_percentile: 81,
      memory_percentile: 73,
      code:
        'function maxArea(h){ let l=0,r=h.length-1,b=0; while(l<r){ b=Math.max(b, Math.min(h[l],h[r])*(r-l)); if(h[l]<h[r]) l++; else r--; } return b }',
      notes: 'Standard two-pointer sweep.',
      tags_json: ['two-pointers'],
      runtime_dist: [1, 5, 7, 5, 2],
      runtime_dist_bins: [0, 20, 40, 60, 80],
    },
  ],
  submission_tests: [
    { id: 'st-two-sum', submission_id: 'sub-two-sum-accepted', label: 'Primary', status: 'Accepted', runtime: '2 ms' },
    { id: 'st-add-two', submission_id: 'sub-add-two-wa', label: 'Primary', status: 'Wrong Answer', runtime: '—' },
    { id: 'st-container', submission_id: 'sub-container-accepted', label: 'Primary', status: 'Accepted', runtime: '3 ms' },
  ],
} as const satisfies MockDatabase

export default data
