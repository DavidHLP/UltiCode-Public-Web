#!/usr/bin/env node

// Lightweight runner around the MockDataValidator so package scripts work.
// Supports --verbose to print every issue and --strict to surface warnings as failures.

import path from 'node:path'
import process from 'node:process'
import { createRequire } from 'module'

const args = new Set(process.argv.slice(2))
const verbose = args.has('--verbose')
const strict = args.has('--strict')

const projectRoot = process.cwd()
const require = createRequire(import.meta.url)
const jiti = require('jiti')(projectRoot, {
  cache: false,
  alias: {
    '@': path.join(projectRoot, 'src'),
  },
})

const { MockDataLoader } = jiti(path.join(projectRoot, 'src/mocks/loader.ts'))
const { MockDataValidator } = jiti(
  path.join(projectRoot, 'src/mocks/validation/validator.ts'),
)

const loader = new MockDataLoader({ validateOnLoad: false, enableCaching: false })
const validator = new MockDataValidator()

const database = loader.loadAll()
const result = validator.validate(database)

const formatIssues = (issues) =>
  issues
    .map(
      (issue) =>
        `- [${issue.severity}] ${issue.entity}.${issue.field}: ${issue.message}${
          issue.value !== undefined ? ` (value: ${JSON.stringify(issue.value)})` : ''
        }`,
    )
    .join('\n')

const hasErrors = result.errors.length > 0
const hasWarnings = result.warnings.length > 0

if (hasErrors || verbose) {
  const header = hasErrors
    ? 'Validation errors found:'
    : 'Validation passed. Verbose report (no errors):'
  console[hasErrors ? 'error' : 'log'](header)
  if (result.errors.length) {
    console.error(formatIssues(result.errors))
  }
}

if (hasWarnings) {
  const prefix = strict ? 'Treating warnings as errors in strict mode:' : 'Warnings:'
  console[strict ? 'error' : 'warn'](prefix)
  console[strict ? 'error' : 'warn'](formatIssues(result.warnings))
}

if (hasErrors || (strict && hasWarnings)) {
  process.exit(1)
}

if (!hasErrors && !hasWarnings) {
  console.log('Mock data validation passed with no issues.')
} else if (!hasErrors) {
  console.log('Mock data validation passed with warnings. Use --strict to fail on warnings.')
}
