import type { MockDatabase } from '../validation/validator'

const data = {
  test_cases: [
    { id: 'tc-two-sum', problem_id: 1, label: 'Basic pair', explanation: 'Simple complement lookup.' },
    { id: 'tc-add-two', problem_id: 2, label: 'Carry chain', explanation: 'Multiple carries in a row.' },
    { id: 'tc-container', problem_id: 3, label: 'Wide span', explanation: 'Max area near the edges.' },
  ],
  test_case_inputs: [
    {
      id: 'tci-two-sum-nums',
      test_case_id: 'tc-two-sum',
      field_name: 'nums',
      label: 'nums',
      value: '[2,7,11,15]',
    },
    {
      id: 'tci-two-sum-target',
      test_case_id: 'tc-two-sum',
      field_name: 'target',
      label: 'target',
      value: '9',
    },
    {
      id: 'tci-add-two-l1',
      test_case_id: 'tc-add-two',
      field_name: 'l1',
      label: 'l1',
      value: '[9,9,9]',
    },
    {
      id: 'tci-add-two-l2',
      test_case_id: 'tc-add-two',
      field_name: 'l2',
      label: 'l2',
      value: '[1]',
    },
    {
      id: 'tci-container-height',
      test_case_id: 'tc-container',
      field_name: 'height',
      label: 'height',
      value: '[1,8,6,2,5,4,8,3,7]',
    },
  ],
} as const satisfies MockDatabase

export default data
