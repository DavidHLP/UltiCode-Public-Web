# UltiCode Public Web

This is the frontend application for the UltiCode competitive programming platform. It is a modern Single Page Application (SPA) built with Vue.js 3 and Vite.

## Project Overview

*   **Type:** Vue.js Web Application
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **State Management:** Pinia
*   **Routing:** Vue Router
*   **UI Framework:** Tailwind CSS v4 + shadcn-vue (Radix Vue based)
*   **Icons:** Lucide Vue Next & Unplugin Icons
*   **Mocking:** MSW (Mock Service Worker)

### Key Features
*   **Problem Set:** Browse and solve algorithmic problems (`/problem`).
*   **Contests:** Participate in programming contests (`/contest`).
*   **Forum:** Discuss problems and topics (`/forum`).
*   **Code Editor:** Integrated Monaco Editor for writing code.
*   **Markdown & Math:** Rendering support using `markdown-it` and `katex`.
*   **Charts:** Visualization using `echarts` and `@unovis/vue`.

## Directory Structure

*   `src/api/` - API client setup and module-specific API calls.
*   `src/assets/` - Static assets and global styles (e.g., `charts.css`).
*   `src/components/ui/` - Reusable UI components (mostly shadcn-vue).
*   `src/features/` - Feature-specific components (e.g., Layout headers/panels).
*   `src/layout/` - Main page layouts (`AppLayout.vue`, `AppSidebar.vue`).
*   `src/lib/` - Utility functions (`utils.ts` for Tailwind merging).
*   `src/mocks/` - MSW configuration, handlers, and mock data loaders.
*   `src/router/` - Vue Router configuration (`index.ts`).
*   `src/stores/` - Pinia stores (e.g., `headerStore.ts`).
*   `src/view/` - Page views organized by domain (`contest`, `forum`, `problem`).

## Development

### Prerequisites
*   Node.js (v20.19.0+ or >=22.12.0)
*   pnpm or pnpm

### Common Commands

| Command | Description |
| :--- | :--- |
| `pnpm run dev` | Start the development server (default port: 5173). |
| `pnpm run build` | Type-check and build the application for production. |
| `pnpm run test` | Run unit tests using Vitest. |
| `pnpm run lint` | Lint and fix code style issues (ESLint). |
| `pnpm run format` | Format code using Prettier. |
| `pnpm run validate:mocks` | Validate the integrity of mock data. |

## Configuration & Conventions

### UI Styling
*   **Tailwind CSS v4:** Configured via Vite plugin.
*   **Shadcn-vue:** Components are located in `src/components/ui`. New components should follow this pattern.
*   **Icons:** Use `lucide-vue-next` for standard UI icons.

### Mock API
*   The project uses MSW (Mock Service Worker) to simulate a backend.
*   **Handlers:** Defined in `src/mocks/handlers.ts`.
*   **Data:** Mock data is stored in `src/mocks/db/` and loaded via `src/mocks/loader.ts`.
*   **Toggle:** controlled by `USE_MOCK_API` in `src/api/client.ts` (typically checking `import.meta.env`).
*   **Validation:** Run `pnpm run validate:mocks` to ensure mock data consistency.

### Routing
*   Defined in `src/router/index.ts`.
*   Lazy loading is used for route components.
*   Major sections: Forum, Contest, Problem, Demo.
