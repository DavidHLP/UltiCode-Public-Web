<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useHeaderStore } from "@/stores/headerStore";
import HeaderComponent from "./components/HeaderComponent.vue";

// 使用 Pinia store
const headerStore = useHeaderStore();
const { mainMenuHeaders, userMenuHeaders } = storeToRefs(headerStore);
const { updateMainMenuHeaders, updateUserMenuHeaders } = headerStore;
</script>

<template>
  <HeaderComponent
    :headers="mainMenuHeaders"
    :on-update="updateMainMenuHeaders"
    group="shared-headers"
  />
  <HeaderComponent
    :headers="userMenuHeaders"
    :on-update="updateUserMenuHeaders"
    group="shared-headers"
  />
</template>
