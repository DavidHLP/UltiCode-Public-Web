/**
 * Mock Data Validator
 *
 * Validates mock data integrity including:
 * - Primary key uniqueness and type consistency
 * - Foreign key referential integrity
 * - ENUM value constraints
 * - Required field validation
 * - JSON field validity
 */

export interface ValidationError {
  entity: string;
  field: string;
  value: any;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface MockDatabase {
  [entityName: string]: any[];
}

/**
 * Schema metadata defining validation rules
 */
interface SchemaMetadata {
  primaryKey: {
    field: string;
    type: "number" | "string";
    autoIncrement?: boolean;
  };
  foreignKeys?: Array<{
    field: string;
    references: {
      entity: string;
      field: string;
    };
  }>;
  enums?: Record<string, string[]>;
  requiredFields?: string[];
  jsonFields?: string[];
  uniqueConstraints?: string[];
}

const SCHEMA_METADATA: Record<string, SchemaMetadata> = {
  problems: {
    primaryKey: { field: "id", type: "number", autoIncrement: true },
    enums: {
      difficulty: ["Easy", "Medium", "Hard"],
      status: ["solved", "attempted", "todo"],
    },
    requiredFields: [
      "id",
      "slug",
      "title",
      "difficulty",
      "acceptance_rate",
      "status",
      "is_premium",
      "has_solution",
    ],
  },
  problem_tags: {
    primaryKey: { field: "id", type: "string" },
    requiredFields: ["id", "label"],
  },
  problem_tag_relations: {
    primaryKey: { field: "problem_id,tag_id", type: "string" }, // composite key
    foreignKeys: [
      { field: "problem_id", references: { entity: "problems", field: "id" } },
      { field: "tag_id", references: { entity: "problem_tags", field: "id" } },
    ],
    requiredFields: ["problem_id", "tag_id"],
  },
  problem_details: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "problem_id", references: { entity: "problems", field: "id" } },
    ],
    uniqueConstraints: ["problem_id"],
    jsonFields: ["companies", "constraints_json"],
    requiredFields: [
      "id",
      "problem_id",
      "slug",
      "summary",
      "likes",
      "dislikes",
      "difficulty_rating",
      "updated_at",
      "constraints_json",
    ],
  },
  problem_examples: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "problem_id", references: { entity: "problems", field: "id" } },
    ],
    requiredFields: [
      "id",
      "problem_id",
      "example_order",
      "input_text",
      "output_text",
    ],
  },
  problem_approaches: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "problem_id", references: { entity: "problems", field: "id" } },
    ],
    requiredFields: [
      "id",
      "problem_id",
      "title",
      "summary",
      "time_complexity",
      "space_complexity",
      "code_snippet",
      "language",
    ],
  },
  problem_approach_steps: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      {
        field: "approach_id",
        references: { entity: "problem_approaches", field: "id" },
      },
    ],
    requiredFields: ["id", "approach_id", "step_order", "content"],
  },
  problem_languages: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "problem_id", references: { entity: "problems", field: "id" } },
    ],
    requiredFields: ["id", "problem_id", "label", "value", "starter_code"],
  },
  problem_starter_notes: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "problem_id", references: { entity: "problems", field: "id" } },
    ],
    requiredFields: ["id", "problem_id", "content"],
  },
  problem_recent_results: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "problem_id", references: { entity: "problems", field: "id" } },
    ],
    enums: {
      status: [
        "Accepted",
        "Wrong Answer",
        "Runtime Error",
        "Time Limit Exceeded",
        "Pending",
      ],
    },
    requiredFields: [
      "id",
      "problem_id",
      "case_label",
      "status",
      "runtime",
      "memory",
      "detail",
    ],
  },
  test_cases: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "problem_id", references: { entity: "problems", field: "id" } },
    ],
    requiredFields: ["id", "problem_id", "label"],
  },
  test_case_inputs: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      {
        field: "test_case_id",
        references: { entity: "test_cases", field: "id" },
      },
    ],
    requiredFields: ["id", "test_case_id", "field_name", "label", "value"],
  },
  solution_authors: {
    primaryKey: { field: "id", type: "string" },
    requiredFields: ["id", "name", "role", "avatar_color"],
  },
  solution_filter_options: {
    primaryKey: { field: "id", type: "string" },
    enums: {
      kind: ["quick", "sort"],
    },
    requiredFields: ["id", "label", "value", "kind"],
  },
  solution_badges: {
    primaryKey: { field: "id", type: "string" },
    requiredFields: ["id", "label"],
  },
  solution_metas: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      {
        field: "author_id",
        references: { entity: "solution_authors", field: "id" },
      },
    ],
    requiredFields: [
      "id",
      "highlight",
      "author_id",
      "views_text",
      "likes",
      "comments",
      "created_at",
      "published_at",
      "topic",
      "language_filter",
      "score",
    ],
  },
  solution_badge_relations: {
    primaryKey: { field: "badge_id,meta_id", type: "string" }, // composite key
    foreignKeys: [
      {
        field: "badge_id",
        references: { entity: "solution_badges", field: "id" },
      },
      {
        field: "meta_id",
        references: { entity: "solution_metas", field: "id" },
      },
    ],
    requiredFields: ["badge_id", "meta_id"],
  },
  submissions: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "problem_id", references: { entity: "problems", field: "id" } },
    ],
    enums: {
      status: [
        "Accepted",
        "Wrong Answer",
        "Runtime Error",
        "Time Limit Exceeded",
      ],
    },
    jsonFields: ["tags_json", "runtime_dist", "runtime_dist_bins"],
    requiredFields: [
      "id",
      "problem_id",
      "user_id",
      "status",
      "runtime",
      "memory",
      "language",
      "submitted_at",
      "runtime_percentile",
      "memory_percentile",
      "code",
    ],
  },
  submission_tests: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      {
        field: "submission_id",
        references: { entity: "submissions", field: "id" },
      },
    ],
    enums: {
      status: [
        "Accepted",
        "Wrong Answer",
        "Runtime Error",
        "Time Limit Exceeded",
      ],
    },
    requiredFields: ["id", "submission_id", "label", "status", "runtime"],
  },
  run_results: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      {
        field: "submission_id",
        references: { entity: "submissions", field: "id" },
      },
      { field: "problem_id", references: { entity: "problems", field: "id" } },
    ],
    enums: {
      verdict: [
        "Accepted",
        "Wrong Answer",
        "Runtime Error",
        "Time Limit Exceeded",
        "Pending",
      ],
    },
    requiredFields: [
      "id",
      "submission_id",
      "problem_id",
      "user_id",
      "verdict",
      "runtime",
      "memory",
    ],
  },
  run_cases: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      {
        field: "run_result_id",
        references: { entity: "run_results", field: "id" },
      },
      {
        field: "submission_test_id",
        references: { entity: "submission_tests", field: "id" },
      },
      {
        field: "test_case_id",
        references: { entity: "test_cases", field: "id" },
      },
    ],
    enums: {
      status: [
        "Accepted",
        "Wrong Answer",
        "Runtime Error",
        "Time Limit Exceeded",
        "Pending",
      ],
    },
    requiredFields: [
      "id",
      "run_result_id",
      "submission_test_id",
      "test_case_id",
      "status",
      "runtime",
      "memory",
      "detail",
      "output_text",
      "expected_output_text",
    ],
  },
  run_case_inputs: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      {
        field: "run_case_id",
        references: { entity: "run_cases", field: "id" },
      },
      {
        field: "test_case_input_id",
        references: { entity: "test_case_inputs", field: "id" },
      },
    ],
    requiredFields: [
      "id",
      "run_case_id",
      "test_case_input_id",
      "field_name",
      "label",
      "value",
    ],
  },
  problem_list_groups: {
    primaryKey: { field: "id", type: "string" },
    requiredFields: ["id", "name", "sort_order"],
  },
  problem_lists: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      {
        field: "group_id",
        references: { entity: "problem_list_groups", field: "id" },
      },
    ],
    requiredFields: [
      "id",
      "group_id",
      "name",
      "author_id",
      "is_public",
      "created_at",
      "updated_at",
    ],
  },
  problem_list_relations: {
    primaryKey: { field: "list_id,problem_id", type: "string" }, // composite key
    foreignKeys: [
      {
        field: "list_id",
        references: { entity: "problem_lists", field: "id" },
      },
      { field: "problem_id", references: { entity: "problems", field: "id" } },
    ],
    requiredFields: ["list_id", "problem_id"],
  },
  problem_list_saved_relations: {
    primaryKey: { field: "user_id,list_id", type: "string" }, // composite key
    foreignKeys: [
      {
        field: "list_id",
        references: { entity: "problem_lists", field: "id" },
      },
    ],
    requiredFields: ["user_id", "list_id"],
  },
  problem_list_favorite_relations: {
    primaryKey: { field: "user_id,list_id", type: "string" }, // composite key
    foreignKeys: [
      {
        field: "list_id",
        references: { entity: "problem_lists", field: "id" },
      },
    ],
    requiredFields: ["user_id", "list_id"],
  },
  contests: {
    primaryKey: { field: "id", type: "string" },
    requiredFields: ["id", "name", "featured_event_id"],
  },
  contest_events: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "contest_id", references: { entity: "contests", field: "id" } },
    ],
    enums: {
      status: ["live", "registration", "upcoming", "archived"],
      mode: ["solo", "team"],
    },
    jsonFields: ["tags"],
    requiredFields: [
      "id",
      "contest_id",
      "title",
      "description",
      "status",
      "division",
      "difficulty",
      "tags",
      "start_time",
      "end_time",
      "is_rated",
      "mode",
      "registered",
    ],
  },
  contest_insights: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "contest_id", references: { entity: "contests", field: "id" } },
    ],
    requiredFields: ["id", "contest_id", "label", "value", "status"],
  },
  contest_leaderboard: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "contest_id", references: { entity: "contests", field: "id" } },
    ],
    requiredFields: [
      "id",
      "contest_id",
      "division_tag",
      "rank",
      "team_name",
      "score",
      "solved",
      "penalty",
    ],
  },
  contest_tracks: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "contest_id", references: { entity: "contests", field: "id" } },
    ],
    requiredFields: ["id", "contest_id", "title", "summary"],
  },
  contest_resources: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "contest_id", references: { entity: "contests", field: "id" } },
    ],
    requiredFields: ["id", "contest_id", "title", "url", "kind"],
  },
  contest_faq: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "contest_id", references: { entity: "contests", field: "id" } },
    ],
    requiredFields: ["id", "contest_id", "question", "answer"],
  },
  contest_ops_checkpoints: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "contest_id", references: { entity: "contests", field: "id" } },
    ],
    requiredFields: [
      "id",
      "contest_id",
      "phase",
      "status",
      "description",
      "timestamp",
    ],
  },
  contest_crew: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "contest_id", references: { entity: "contests", field: "id" } },
    ],
    requiredFields: ["id", "contest_id", "name", "role", "contact"],
  },
  forum_communities: {
    primaryKey: { field: "id", type: "string" },
    requiredFields: ["id", "name", "slug", "description", "members", "online"],
  },
  forum_community_rules: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      {
        field: "community_id",
        references: { entity: "forum_communities", field: "id" },
      },
    ],
    requiredFields: ["id", "community_id", "title", "body"],
  },
  forum_community_links: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      {
        field: "community_id",
        references: { entity: "forum_communities", field: "id" },
      },
    ],
    requiredFields: ["id", "community_id", "label", "url"],
  },
  forum_users: {
    primaryKey: { field: "username", type: "string" },
    requiredFields: ["username", "karma"],
  },
  forum_moderators: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      {
        field: "community_id",
        references: { entity: "forum_communities", field: "id" },
      },
      {
        field: "username",
        references: { entity: "forum_users", field: "username" },
      },
    ],
    requiredFields: ["id", "community_id", "username", "title"],
  },
  forum_posts: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      {
        field: "community_id",
        references: { entity: "forum_communities", field: "id" },
      },
      {
        field: "user_id",
        references: { entity: "forum_users", field: "username" },
      },
    ],
    enums: {
      flair_type: [
        "announcement",
        "discussion",
        "showcase",
        "question",
        "hiring",
      ],
      vote_state: ["upvoted", "downvoted", "neutral"],
    },
    jsonFields: ["tags", "media", "recommendation"],
    requiredFields: [
      "id",
      "community_id",
      "user_id",
      "title",
      "tags",
      "is_saved",
      "impressions",
      "is_pinned",
      "is_locked",
      "created_at",
    ],
  },
  forum_post_stats: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "post_id", references: { entity: "forum_posts", field: "id" } },
    ],
    uniqueConstraints: ["post_id"],
    requiredFields: [
      "id",
      "post_id",
      "score",
      "comments",
      "awards",
      "saves",
      "shares",
    ],
  },
  forum_awards: {
    primaryKey: { field: "id", type: "string" },
    requiredFields: ["id", "label"],
  },
  forum_post_awards: {
    primaryKey: { field: "post_id,award_id", type: "string" }, // composite key
    foreignKeys: [
      { field: "post_id", references: { entity: "forum_posts", field: "id" } },
      {
        field: "award_id",
        references: { entity: "forum_awards", field: "id" },
      },
    ],
    requiredFields: ["post_id", "award_id", "count"],
  },
  forum_comments: {
    primaryKey: { field: "id", type: "string" },
    foreignKeys: [
      { field: "post_id", references: { entity: "forum_posts", field: "id" } },
      {
        field: "parent_id",
        references: { entity: "forum_comments", field: "id" },
      },
      {
        field: "author_id",
        references: { entity: "forum_users", field: "username" },
      },
    ],
    requiredFields: [
      "id",
      "post_id",
      "author_id",
      "body",
      "upvotes",
      "created_at",
    ],
  },
  forum_quick_filters: {
    primaryKey: { field: "id", type: "string" },
    requiredFields: ["id", "label", "value"],
  },
  forum_trending_topics: {
    primaryKey: { field: "id", type: "string" },
    enums: {
      trend: ["up", "down"],
    },
    requiredFields: ["id", "title", "posts", "trend"],
  },
};

export class MockDataValidator {
  /**
   * Validate primary key uniqueness and type consistency
   */
  validatePrimaryKeys(data: MockDatabase): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    for (const [entityName, records] of Object.entries(data)) {
      const schema = SCHEMA_METADATA[entityName];
      if (!schema || !records) continue;

      const pkField = schema.primaryKey.field;
      const pkType = schema.primaryKey.type;
      const isComposite = pkField.includes(",");

      if (isComposite) {
        // Handle composite keys
        const fields = pkField.split(",");
        const seen = new Set<string>();

        for (const record of records) {
          const compositeValue = fields.map((f) => record[f]).join("|");

          if (seen.has(compositeValue)) {
            errors.push({
              entity: entityName,
              field: pkField,
              value: compositeValue,
              message: `Duplicate composite primary key: ${compositeValue}`,
              severity: "error",
            });
          }
          seen.add(compositeValue);
        }
      } else {
        // Handle single primary keys
        const seen = new Set<any>();

        for (const record of records) {
          const pkValue = record[pkField];

          // Check for duplicates
          if (seen.has(pkValue)) {
            errors.push({
              entity: entityName,
              field: pkField,
              value: pkValue,
              message: `Duplicate primary key: ${pkValue}`,
              severity: "error",
            });
          }
          seen.add(pkValue);

          // Check type consistency
          const actualType = typeof pkValue;
          if (pkType === "number" && actualType !== "number") {
            errors.push({
              entity: entityName,
              field: pkField,
              value: pkValue,
              message: `Primary key type mismatch: expected number, got ${actualType}`,
              severity: "error",
            });
          } else if (pkType === "string" && actualType !== "string") {
            errors.push({
              entity: entityName,
              field: pkField,
              value: pkValue,
              message: `Primary key type mismatch: expected string, got ${actualType}`,
              severity: "error",
            });
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate foreign key referential integrity
   */
  validateForeignKeys(data: MockDatabase): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    for (const [entityName, records] of Object.entries(data)) {
      const schema = SCHEMA_METADATA[entityName];
      if (!schema?.foreignKeys || !records) continue;

      for (const fk of schema.foreignKeys) {
        const targetEntity = data[fk.references.entity];
        if (!targetEntity) {
          warnings.push({
            entity: entityName,
            field: fk.field,
            value: null,
            message: `Referenced entity '${fk.references.entity}' not found in data`,
            severity: "warning",
          });
          continue;
        }

        // Build index of target entity primary keys
        const targetPKs = new Set(
          targetEntity.map((r: any) => r[fk.references.field])
        );

        for (const record of records) {
          const fkValue = record[fk.field];

          // Skip null values for nullable foreign keys (like parent_id in forum_comments)
          if (fkValue === null || fkValue === undefined) {
            continue;
          }

          if (!targetPKs.has(fkValue)) {
            errors.push({
              entity: entityName,
              field: fk.field,
              value: fkValue,
              message: `Foreign key violation: ${fk.field}=${fkValue} does not exist in ${fk.references.entity}.${fk.references.field}`,
              severity: "error",
            });
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate ENUM value constraints
   */
  validateEnums(data: MockDatabase): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    for (const [entityName, records] of Object.entries(data)) {
      const schema = SCHEMA_METADATA[entityName];
      if (!schema?.enums || !records) continue;

      for (const [field, allowedValues] of Object.entries(schema.enums)) {
        for (const record of records) {
          const value = record[field];

          // Skip null/undefined for nullable enum fields
          if (value === null || value === undefined) {
            continue;
          }

          if (!allowedValues.includes(value)) {
            errors.push({
              entity: entityName,
              field,
              value,
              message: `Invalid ENUM value: ${value} not in [${allowedValues.join(", ")}]`,
              severity: "error",
            });
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate required fields are not null or undefined
   */
  validateRequiredFields(data: MockDatabase): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    for (const [entityName, records] of Object.entries(data)) {
      const schema = SCHEMA_METADATA[entityName];
      if (!schema?.requiredFields || !records) continue;

      for (const record of records) {
        for (const field of schema.requiredFields) {
          const value = record[field];

          if (value === null || value === undefined) {
            errors.push({
              entity: entityName,
              field,
              value,
              message: `Required field is null or undefined`,
              severity: "error",
            });
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate JSON fields contain valid parseable JSON
   */
  validateJsonFields(data: MockDatabase): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    for (const [entityName, records] of Object.entries(data)) {
      const schema = SCHEMA_METADATA[entityName];
      if (!schema?.jsonFields || !records) continue;

      for (const field of schema.jsonFields) {
        for (const record of records) {
          const value = record[field];

          // Skip null/undefined for nullable JSON fields
          if (value === null || value === undefined) {
            continue;
          }

          // If it's already an object/array, it's valid
          if (typeof value === "object") {
            continue;
          }

          // If it's a string, try to parse it
          if (typeof value === "string") {
            try {
              JSON.parse(value);
            } catch (e) {
              errors.push({
                entity: entityName,
                field,
                value,
                message: `Invalid JSON: ${e instanceof Error ? e.message : "parse error"}`,
                severity: "error",
              });
            }
          } else {
            errors.push({
              entity: entityName,
              field,
              value,
              message: `JSON field must be object, array, or valid JSON string`,
              severity: "error",
            });
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate composite key uniqueness in junction tables
   */
  validateCompositeKeys(data: MockDatabase): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    for (const [entityName, records] of Object.entries(data)) {
      const schema = SCHEMA_METADATA[entityName];
      if (!schema || !records) continue;

      const pkField = schema.primaryKey.field;
      const isComposite = pkField.includes(",");

      if (isComposite) {
        const fields = pkField.split(",");
        const seen = new Set<string>();

        for (const record of records) {
          const compositeValue = fields.map((f) => record[f]).join("|");

          if (seen.has(compositeValue)) {
            errors.push({
              entity: entityName,
              field: pkField,
              value: compositeValue,
              message: `Duplicate composite key pair: (${fields.map((f) => `${f}=${record[f]}`).join(", ")})`,
              severity: "error",
            });
          }
          seen.add(compositeValue);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate one-to-one relationship uniqueness
   * Ensures that for entities with unique constraints (like problem_details.problem_id),
   * there is exactly one related record per parent
   */
  validateOneToOneRelationships(data: MockDatabase): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    for (const [entityName, records] of Object.entries(data)) {
      const schema = SCHEMA_METADATA[entityName];
      if (!schema?.uniqueConstraints || !records) continue;

      for (const field of schema.uniqueConstraints) {
        const seen = new Set<any>();

        for (const record of records) {
          const value = record[field];

          if (value === null || value === undefined) {
            continue;
          }

          if (seen.has(value)) {
            errors.push({
              entity: entityName,
              field,
              value,
              message: `One-to-one relationship violation: ${field}=${value} appears multiple times (should be unique)`,
              severity: "error",
            });
          }
          seen.add(value);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate sequential ordering for entities with order fields
   * Ensures that order fields (like step_order, example_order, sort_order) are sequential
   */
  validateSequentialOrdering(data: MockDatabase): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Define entities and their order fields
    const orderFields: Record<string, { field: string; groupBy?: string }> = {
      problem_approach_steps: { field: "step_order", groupBy: "approach_id" },
      problem_examples: { field: "example_order", groupBy: "problem_id" },
      problem_list_groups: { field: "sort_order" },
    };

    for (const [entityName, config] of Object.entries(orderFields)) {
      const records = data[entityName];
      if (!records) continue;

      if (config.groupBy) {
        // Group records by the groupBy field and check ordering within each group
        const groups = new Map<any, any[]>();

        for (const record of records) {
          const groupKey = record[config.groupBy];
          if (!groups.has(groupKey)) {
            groups.set(groupKey, []);
          }
          groups.get(groupKey)!.push(record);
        }

        for (const [groupKey, groupRecords] of groups.entries()) {
          const orderValues = groupRecords
            .map((r) => r[config.field])
            .sort((a, b) => a - b);

          // Check if values are sequential starting from 0
          for (let i = 0; i < orderValues.length; i++) {
            if (orderValues[i] !== i) {
              errors.push({
                entity: entityName,
                field: config.field,
                value: orderValues,
                message: `Non-sequential ordering in group ${config.groupBy}=${groupKey}: expected ${i}, found ${orderValues[i]}`,
                severity: "error",
              });
              break;
            }
          }
        }
      } else {
        // Check ordering for the entire entity
        const orderValues = records
          .map((r) => r[config.field])
          .sort((a, b) => a - b);

        for (let i = 0; i < orderValues.length; i++) {
          if (orderValues[i] !== i) {
            errors.push({
              entity: entityName,
              field: config.field,
              value: orderValues,
              message: `Non-sequential ordering: expected ${i}, found ${orderValues[i]}`,
              severity: "error",
            });
            break;
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate temporal ordering constraints
   * Ensures that created_at <= published_at for entities with both fields
   */
  validateTemporalOrdering(data: MockDatabase): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Define entities with temporal constraints
    const temporalEntities = ["solution_metas"];

    for (const entityName of temporalEntities) {
      const records = data[entityName];
      if (!records) continue;

      for (const record of records) {
        const createdAt = record.created_at;
        const publishedAt = record.published_at;

        // Skip if either field is missing
        if (!createdAt || !publishedAt) {
          continue;
        }

        // Parse dates and compare
        const createdDate = new Date(createdAt);
        const publishedDate = new Date(publishedAt);

        if (createdDate > publishedDate) {
          errors.push({
            entity: entityName,
            field: "created_at,published_at",
            value: { created_at: createdAt, published_at: publishedAt },
            message: `Temporal ordering violation: created_at (${createdAt}) is after published_at (${publishedAt})`,
            severity: "error",
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Run all validation checks
   */
  validate(data: MockDatabase): ValidationResult {
    const results = [
      this.validatePrimaryKeys(data),
      this.validateForeignKeys(data),
      this.validateEnums(data),
      this.validateRequiredFields(data),
      this.validateJsonFields(data),
      this.validateCompositeKeys(data),
      this.validateOneToOneRelationships(data),
      this.validateSequentialOrdering(data),
      this.validateTemporalOrdering(data),
    ];

    const allErrors = results.flatMap((r) => r.errors);
    const allWarnings = results.flatMap((r) => r.warnings);

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  }
}
