<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useHeaderStore } from "@/stores/headerStore";
import HeaderComponent from "./components/HeaderComponent.vue";

// 使用 Pinia store
const headerStore = useHeaderStore();
const { headerGroups } = storeToRefs(headerStore);
const {
  updateGroupHeaders
} = headerStore;
</script>

<template>
  <HeaderComponent 
    v-for="group in headerGroups" 
    :key="group.id" 
    :headers="group.headers" 
    :on-update="(newHeaders) => updateGroupHeaders(group.id, newHeaders)"
    v-show="group.headers.length > 0"
  />
</template>
