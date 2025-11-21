/**
 * Mock Data Loader
 *
 * Centralized module for loading and validating mock data.
 * Provides caching and relationship querying capabilities.
 */

import { MockDataValidator } from "./validation/validator";
import type { MockDatabase, ValidationResult } from "./validation/validator";

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
 * Configuration for data loading behavior
 */
export interface LoaderConfig {
  validateOnLoad: boolean; // Whether to run validation when loading data
  throwOnValidationError: boolean; // Whether to throw errors on validation failure
  enableCaching: boolean; // Whether to cache loaded data
}

// Determine if we're in development/test mode
const isDevelopment =
  import.meta.env?.MODE === "development" || import.meta.env?.DEV;
const isTest =
  import.meta.env?.MODE === "test" ||
  (typeof process !== "undefined" && process.env.NODE_ENV === "test");

const DEFAULT_CONFIG: LoaderConfig = {
  validateOnLoad: isDevelopment || isTest, // Only validate in dev/test modes
  throwOnValidationError: false,
  enableCaching: true,
};

/**
 * MockDataLoader class
 *
 * Handles loading, validation, and querying of mock data
 */
export class MockDataLoader {
  private validator: MockDataValidator;
  private cache: Map<string, any>;
  private config: LoaderConfig;
  private allDataCache: MockDatabase | null = null;

  constructor(config: Partial<LoaderConfig> = {}) {
    this.validator = new MockDataValidator();
    this.cache = new Map();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Load and validate all mock data
   *
   * @returns Complete mock database with all entities
   * @throws Error if validation fails and throwOnValidationError is true
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

    // Validate if configured
    if (this.config.validateOnLoad) {
      const validationResult = this.validator.validate(database);

      if (!validationResult.valid) {
        const errorMessage = this.formatValidationErrors(validationResult);

        if (this.config.throwOnValidationError) {
          throw new Error(`Mock data validation failed:\n${errorMessage}`);
        } else {
          console.error("Mock data validation failed:");
          console.error(errorMessage);
        }
      }

      // Log warnings even if validation passes
      if (validationResult.warnings.length > 0) {
        console.warn("Mock data validation warnings:");
        console.warn(this.formatValidationWarnings(validationResult));
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
  getRelated<T = any>(entity: string, foreignKey: string, value: any): T[] {
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
  getByPrimaryKey<T = any>(
    entity: string,
    primaryKey: string,
    value: any
  ): T | undefined {
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
  getByCompositeKey<T = any>(entity: string, keys: Record<string, any>): T[] {
    const entityData = this.loadEntity<any>(entity);

    return entityData.filter((record) => {
      return Object.entries(keys).every(
        ([key, value]) => record[key] === value
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
   * Run validation on currently loaded data
   *
   * @returns Validation result
   */
  validate(): ValidationResult {
    const database = this.loadAll();
    return this.validator.validate(database);
  }

  /**
   * Format validation errors for display
   */
  private formatValidationErrors(result: ValidationResult): string {
    return result.errors
      .map(
        (error) =>
          `  [${error.severity.toUpperCase()}] ${error.entity}.${error.field}: ${error.message} (value: ${JSON.stringify(error.value)})`
      )
      .join("\n");
  }

  /**
   * Format validation warnings for display
   */
  private formatValidationWarnings(result: ValidationResult): string {
    return result.warnings
      .map(
        (warning) =>
          `  [${warning.severity.toUpperCase()}] ${warning.entity}.${warning.field}: ${warning.message}`
      )
      .join("\n");
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
export const loadEntity = <T = any>(entityName: string) =>
  defaultLoader.loadEntity<T>(entityName);
export const getRelated = <T = any>(
  entity: string,
  foreignKey: string,
  value: any
) => defaultLoader.getRelated<T>(entity, foreignKey, value);
export const getByPrimaryKey = <T = any>(
  entity: string,
  primaryKey: string,
  value: any
) => defaultLoader.getByPrimaryKey<T>(entity, primaryKey, value);
export const getByCompositeKey = <T = any>(
  entity: string,
  keys: Record<string, any>
) => defaultLoader.getByCompositeKey<T>(entity, keys);
