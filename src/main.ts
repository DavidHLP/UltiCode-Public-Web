import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import "./style.css";
import VueDnDKitPlugin from "@vue-dnd-kit/core";

async function bootstrap() {
  const app = createApp(App);

  app.use(createPinia());
  app.use(router);
  app.use(VueDnDKitPlugin);
  app.mount("#app");
}

bootstrap();
