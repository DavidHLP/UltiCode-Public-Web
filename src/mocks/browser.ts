import { setupWorker } from "msw/browser";
import { handlers } from "@/mocks/handlers";
import { defaultLoader } from "@/mocks/loader";

export const worker = setupWorker(...handlers);

export async function startMockWorker() {
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

  await worker.start({
    onUnhandledRequest: "bypass",
  });
  worker.events?.setMaxListeners?.(0);
}
