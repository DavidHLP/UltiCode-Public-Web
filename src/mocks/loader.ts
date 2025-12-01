/**
 * Mock Data Loader
 *
 * Centralized module for loading and validating mock data.
 * Provides caching and relationship querying capabilities.
 */

// Import all mock data files
import problemsData from "./db/problems";
import problemDetailData from "./db/problem-detail";
import solutionData from "./db/solution";
import submissionData from "./db/submission";
import testCaseData from "./db/test-case";
import testResultsData from "./db/test-results";
import problemListsData from "./db/problem-lists";
import contestData from "./db/contest";
import forumData from "./db/forum";
import userData from "./db/user";

/**
 * Mock database type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MockDatabase = Record<string, any[]>;

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;

  errors: Array<{
    entity: string;
    field: string;
    message: string;
    severity: string;
    value?: unknown;
  }>;
  warnings: Array<{
    entity: string;
    field: string;
    message: string;
    severity: string;
  }>;
}

/**
 * Configuration for data loading behavior
 */
export interface LoaderConfig {
  enableCaching: boolean; // Whether to cache loaded data
}

const DEFAULT_CONFIG: LoaderConfig = {
  enableCaching: true,
};

/**
 * MockDataLoader class
 *
 * Handles loading, validation, and querying of mock data
 */
export class MockDataLoader {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cache: Map<string, any>;
  private config: LoaderConfig;
  private allDataCache: MockDatabase | null = null;

  constructor(config: Partial<LoaderConfig> = {}) {
    this.cache = new Map();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Load all mock data
   *
   * @returns Complete mock database with all entities
   */
  loadAll(): MockDatabase {
    // Return cached data if available
    if (this.config.enableCaching && this.allDataCache) {
      return this.allDataCache;
    }

    // Combine all data sources into a single database
    const allData = [
      problemsData,
      problemDetailData,
      solutionData,
      submissionData,
      testCaseData,
      testResultsData,
      problemListsData,
      contestData,
      forumData,
      userData,
    ];

    // Merge all data, filtering out non-array properties
    const database: MockDatabase = {};
    for (const dataSource of allData) {
      for (const [key, value] of Object.entries(dataSource)) {
        if (Array.isArray(value)) {
          database[key] = value;
        }
      }
    }

    // Cache the result
    if (this.config.enableCaching) {
      this.allDataCache = database;
    }

    return database;
  }

  /**
   * Load a specific entity with validation
   *
   * @param entityName Name of the entity to load (e.g., 'problems', 'problem_tags')
   * @returns Array of records for the specified entity
   * @throws Error if entity doesn't exist
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loadEntity<T = any>(entityName: string): T[] {
    // Check cache first
    if (this.config.enableCaching && this.cache.has(entityName)) {
      return this.cache.get(entityName) as T[];
    }

    // Load all data and extract the entity
    const database = this.loadAll();

    if (!(entityName in database)) {
      throw new Error(`Entity '${entityName}' not found in mock database`);
    }

    const entityData = database[entityName] as T[];

    // Cache the entity
    if (this.config.enableCaching) {
      this.cache.set(entityName, entityData);
    }

    return entityData;
  }

  /**
   * Get related entities via foreign keys
   *
   * @param entity Name of the entity containing the foreign key
   * @param foreignKey Name of the foreign key field
   * @param value Value of the foreign key to match
   * @returns Array of related records
   *
   * @example
   * // Get all tags for problem with id=1
   * loader.getRelated('problem_tag_relations', 'problem_id', 1)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRelated<T = any>(entity: string, foreignKey: string, value: any): T[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entityData = this.loadEntity<any>(entity);

    return entityData.filter((record) => record[foreignKey] === value) as T[];
  }

  /**
   * Get a single record by primary key
   *
   * @param entity Name of the entity
   * @param primaryKey Name of the primary key field
   * @param value Value of the primary key
   * @returns Single record or undefined if not found
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getByPrimaryKey<T = any>(
    entity: string,
    primaryKey: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
  ): T | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entityData = this.loadEntity<any>(entity);

    return entityData.find((record) => record[primaryKey] === value) as
      | T
      | undefined;
  }

  /**
   * Get records matching a composite key
   *
   * @param entity Name of the entity
   * @param keys Object with key-value pairs to match
   * @returns Array of matching records
   *
   * @example
   * // Get relation for problem_id=1 and tag_id='array'
   * loader.getByCompositeKey('problem_tag_relations', { problem_id: 1, tag_id: 'array' })
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getByCompositeKey<T = any>(entity: string, keys: Record<string, any>): T[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entityData = this.loadEntity<any>(entity);

    return entityData.filter((record) => {
      return Object.entries(keys).every(
        ([key, value]) => record[key] === value,
      );
    }) as T[];
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
    this.allDataCache = null;
  }

  /**
   * Run validation on currently loaded data (stub for compatibility)
   *
   * @returns Validation result indicating success
   */
  validate(): ValidationResult {
    return {
      valid: true,
      errors: [],
      warnings: [],
    };
  }
}

/**
 * Default loader instance for convenience
 */
export const defaultLoader = new MockDataLoader();

/**
 * Convenience functions using the default loader
 */
export const loadAll = () => defaultLoader.loadAll();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadEntity = <T = any>(entityName: string) =>
  defaultLoader.loadEntity<T>(entityName);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getRelated = <T = any>(
  entity: string,
  foreignKey: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
) => defaultLoader.getRelated<T>(entity, foreignKey, value);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getByPrimaryKey = <T = any>(
  entity: string,
  primaryKey: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
) => defaultLoader.getByPrimaryKey<T>(entity, primaryKey, value);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getByCompositeKey = <T = any>(
  entity: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keys: Record<string, any>,
) => defaultLoader.getByCompositeKey<T>(entity, keys);
