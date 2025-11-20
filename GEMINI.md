# Project Overview

This is a Vue.js web application for a competitive programming platform called UltiCode. It's built with Vite, TypeScript, and Pinia for state management. The UI is built with shadcn-vue and Tailwind CSS. The application features a problem set, a forum, and a contest section. It uses a mock API for development and testing, which is implemented with MSW (Mock Service Worker).

# Building and Running

## Development

To run the development server, use the following command:

```bash
npm run dev
```

This will start the Vite development server and the application will be available at `http://localhost:5173`.

## Building for Production

To build the application for production, use the following command:

```bash
npm run build
```

This will create a `dist` directory with the production-ready assets.

## Testing

To run the unit tests, use the following command:

```bash
npm run test
```

# Development Conventions

## Code Style

The project uses ESLint and Prettier for code formatting and style checking. Before committing, it's recommended to run the following commands:

```bash
npm run lint
npm run format
```

## Mock API

The project uses a mock API for development. The mock data is located in the `src/mocks/db` directory and the handlers are in `src/mocks/handlers`. You can enable or disable the mock API by setting the `VITE_API_USE_MOCK` environment variable in a `.env.local` file.

To validate the mock data, you can run the following command:

```bash
npm run validate:mocks
```
