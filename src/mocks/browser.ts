import { setupWorker } from "msw/browser";
import { handlers } from "@/mocks/handlers";
import { defaultLoader } from "@/mocks/loader";

type WorkerState = {
  worker: ReturnType<typeof setupWorker>;
  startPromise?: Promise<void>;
};

const existingState = (globalThis as { __mswWorker?: WorkerState }).__mswWorker;

export const worker = existingState?.worker ?? setupWorker(...handlers);

if (!existingState) {
  (globalThis as { __mswWorker?: WorkerState }).__mswWorker = {
    worker,
  };
}

export async function startMockWorker() {
  const state = (globalThis as { __mswWorker?: WorkerState }).__mswWorker!;

  if (state.startPromise) {
    return state.startPromise;
  }

  state.startPromise = (async () => {
    // Validate mock data in development mode
    if (import.meta.env.DEV) {
      const result = defaultLoader.validate();

      if (!result.valid || result.warnings.length > 0) {
        throw new Error(
          "Mock data validation failed or had warnings. See console for details (if any were logged by MSW itself).",
        );
      }
    }

    // Increase max listeners to prevent warning in development
    // MSW creates many event listeners for mocked responses
    if (import.meta.env.DEV) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const emitter = (worker as any).emitter;
      if (emitter && typeof emitter.setMaxListeners === "function") {
        emitter.setMaxListeners(0);
      }
    }

    await worker.start({
      onUnhandledRequest: "bypass",
    });
  })();

  return state.startPromise;
}
