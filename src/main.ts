import { createApp } from "vue";
import { createPinia } from "pinia";
import { USE_MOCK_API } from "@/api/client";

import App from "./App.vue";
import router from "./router";
import "./style.css";

async function bootstrap() {
  if (USE_MOCK_API && typeof window !== "undefined") {
    const { startMockWorker } = await import("@/mocks/browser");
    await startMockWorker();
  }

  const app = createApp(App);

  app.use(createPinia());
  app.use(router);

  app.mount("#app");
}

bootstrap();
