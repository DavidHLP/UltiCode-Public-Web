# Repository Guidelines

## Project Structure & Module Organization
- Frontend lives in `src/` with Vue 3 + TypeScript. Key areas: `components/` (UI kit and markdown widgets), `features/` (feature-specific views), `layout/` (shell + navigation), `router/` (routes), `stores/` (Pinia), `lib/` (utilities), and `api/` (REST client + typed endpoints). Shared assets and styles sit in `assets/` and `style.css`. `mocks/` holds MSW handlers and sample data used when the mock API flag is on.
- Public files served by Vite live in `public/`. Build output goes to `dist/`.
- Scripts that support development (e.g., mock validators) are in `scripts/`.

## Build, Test, and Development Commands
- Use `pnpm` (lockfile is checked in). Node 20+ per `package.json`.
- `pnpm dev`: start Vite dev server with hot reload.
- `pnpm build`: type-check then build for production (`pnpm build-only` skips type-check if needed); `pnpm preview` serves the built bundle.
- `pnpm lint` and `pnpm format`: ESLint (Vue/TS) with auto-fix and Prettier formatting for `src/`.
- `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`: run Vitest, optionally with watch or coverage.
- `pnpm validate:mocks[:strict|:verbose]`: verify mock API data stays in sync with schemas.

## Coding Style & Naming Conventions
- TypeScript with single-file `.vue` components; prefer `<script setup>` when possible.
- Components should use MultiWord names (ESLint enforced) and PascalCase filenames; composables/utilities use camelCase; folders stay kebab-case.
- Follow Prettier defaults and keep imports ordered by tooling; 2-space indentation is standard across the codebase.
- Tailwind utilities are used via `@tailwindcss/vite`; keep shared tokens in `style.css`.

## Testing Guidelines
- Vitest is the test runner; use `jsdom` for DOM-facing units. Place specs alongside source as `*.spec.ts` or `*.test.ts`.
- Aim for coverage on core business logic and stores; prefer testing rendered output for components rather than implementation details.
- If the mock API changes, add/update MSW handlers in `src/mocks/` and validate with `pnpm validate:mocks:strict`.

## Commit & Pull Request Guidelines
- Follow Conventional Commits seen in history (`feat(scope): ...`, `refactor(scope): ...`, `chore(scope): ...`). Keep scopes meaningful (e.g., `header`, `problem`, `eslint`) and messages concise.
- PRs should include: a summary of changes, linked issue or task, manual test notes/commands, and UI screenshots or recordings for visible changes.
- Keep diffs focused; split large refactors from feature work. Update relevant docs when behavior or APIs change.

## Environment & Mock API Tips
- Runtime config comes from Vite env vars: `VITE_API_BASE_URL` for real endpoints and `VITE_API_USE_MOCK` (defaults to `true`) to toggle MSW. Base paths normalize automatically in `src/api/client.ts`.
- When using mocks during local dev, ensure the service worker starts via `startMockWorker()` (already wired in `main.ts`). Disable mocks before pointing at staging/prod APIs.
