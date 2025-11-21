import type {
  Problem,
  ProblemRow,
  ProblemTagRelationRow,
  ProblemTagRow,
} from "@/mocks/schema/problem";
import rawProblemsData from "@/mocks/db/problems";

const problemsData = rawProblemsData as {
  problems: ProblemRow[];
  problem_tags: ProblemTagRow[];
  problem_tag_relations: ProblemTagRelationRow[];
};

const tagLookup = new Map(
  problemsData.problem_tags.map((tag) => [tag.id, tag.label]),
);

const problemTagsMap = problemsData.problem_tag_relations.reduce<
  Map<number, string[]>
>((acc, relation) => {
  const label = tagLookup.get(relation.tag_id) ?? relation.tag_id;
  if (!acc.has(relation.problem_id)) {
    acc.set(relation.problem_id, []);
  }
  acc.get(relation.problem_id)!.push(label);
  return acc;
}, new Map());

const problems: Problem[] = problemsData.problems.map((problem) => {
  const { acceptance_rate, is_premium, has_solution, completed_time, ...rest } = problem;
  return {
    ...rest,
    acceptanceRate: acceptance_rate,
    isPremium: is_premium,
    hasSolution: has_solution,
    completedTime: completed_time,
    tags: problemTagsMap.get(problem.id) ?? [],
  };
});

export function fetchProblems(): Problem[] {
  return problems;
}

export function fetchProblemById(id: number): Problem | undefined {
  return problems.find((problem) => problem.id === id);
}

export function fetchProblemsByIds(ids: number[]): Problem[] {
  const idSet = new Set(ids);
  return problems.filter((problem) => idSet.has(problem.id));
}
