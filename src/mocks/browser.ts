import { setupWorker, type SetupWorkerApi } from "msw/browser";
import { handlers } from "@/mocks/handlers";
import { defaultLoader } from "@/mocks/loader";

type WorkerState = {
  worker: SetupWorkerApi;
  startPromise?: Promise<void>;
};

const existingState = (globalThis as { __mswWorker?: WorkerState }).__mswWorker;

export const worker =
  existingState?.worker ?? setupWorker(...handlers);

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
      console.log("🔍 Validating mock data...");
      const result = defaultLoader.validate();

      if (!result.valid) {
        console.error("❌ Mock data validation failed:");
        result.errors.forEach((error) => {
          console.error(
            `  [ERROR] ${error.entity}.${error.field}: ${error.message}`
          );
        });
      } else if (result.warnings.length > 0) {
        console.warn("⚠️  Mock data validation warnings:");
        result.warnings.forEach((warning) => {
          console.warn(
            `  [WARNING] ${warning.entity}.${warning.field}: ${warning.message}`
          );
        });
      } else {
        console.log("✅ Mock data validation passed");
      }
    }

    worker.events?.setMaxListeners?.(0);
    await worker.start({
      onUnhandledRequest: "bypass",
    });
    worker.events?.setMaxListeners?.(0);
  })();

  return state.startPromise;
}
