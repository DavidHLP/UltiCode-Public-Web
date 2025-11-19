# GEMINI.md - Project Context for Ulticode

This document provides an overview of the Ulticode project, an online algorithm problem-solving platform, to serve as instructional context for future interactions.

## Project Overview

**Project Name:** Ulticode - 在线算法题解平台 (Online Algorithm Problem Solving Platform)

**Purpose:** Ulticode is a modern online platform for solving algorithm problems, drawing inspiration from LeetCode. It aims to provide a comprehensive environment for users to practice and solve coding challenges.

**Key Technologies:**
*   **Frontend Framework:** Vue 3
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **State Management:** Pinia (Vue's official state management library)
*   **UI Frameworks:** Tailwind CSS, shadcn-vue, Radix Vue
*   **Code Editor:** Monaco Editor
*   **Utility Libraries:** VueUse, Lucide Icons

**Architecture Highlights:**
The project is currently undergoing a significant refactoring effort to modernize its architecture. Key aspects of the new architecture include:
*   **Centralized State Management:** Utilizing Pinia stores to manage application state, replacing scattered component-level state.
*   **Component Decoupling:** Reducing props drilling and improving maintainability through better component design.
*   **Code Reusability:** Extracting common logic into composables.
*   **Type Safety:** Comprehensive TypeScript type definitions across the codebase.
*   **Testability:** Designed for easier unit and integration testing.

## Building and Running

### Environment Requirements

*   **Node.js:** >= 16.x
*   **npm:** >= 7.x (or pnpm/yarn)

### Installation

To set up the project locally, follow these steps:

```bash
# Clone the repository (replace <repository-url> with the actual URL)
git clone <repository-url>
cd edit-ulticode

# Install dependencies
npm install
```

### Development Server

To start the development server:

```bash
npm run dev
```

The application will typically be accessible at `http://localhost:5173`.

### Building for Production

To build the application for production deployment:

```bash
npm run build
```

### Previewing Production Build

To preview the production build locally:

```bash
npm run preview
```

### Testing

The project includes various testing scripts:

*   **Run Unit Tests:**
    ```bash
    npm run test
    ```
*   **Run Tests with Coverage Report:**
    ```bash
    npm run test:coverage
    ```
*   **Run End-to-End (E2E) Tests:**
    ```bash
    npm run test:e2e
    ```

### Code Quality Checks

To ensure code quality and adherence to standards:

*   **Run ESLint Checks:**
    ```bash
    npm run lint
    ```
*   **Automatically Fix ESLint Issues:**
    ```bash
    npm run lint:fix
    ```
*   **Run TypeScript Type Checks:**
    ```bash
    npm run type-check
    ```

## Development Conventions

The project adheres to the following development guidelines:

*   **API Style:** Prefer Vue 3 Composition API over Options API.
*   **Language:** Write type-safe code using TypeScript.
*   **State Management:** Utilize Pinia Stores for managing global application state.
*   **Coding Style:** Follow the Vue 3 Style Guide.
*   **Documentation:** Emphasize writing clear comments and comprehensive documentation.
*   **Contribution:** Detailed contribution guidelines, including branch naming conventions (`feat/xxx`, `fix/xxx`, `refactor/xxx`, etc.), are outlined in the `README.md`.
*   **Issue Tracking:** Use the project's issue tracker for bug reports and feature suggestions.
