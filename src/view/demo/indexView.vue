<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, provide } from "vue";
import { useHeaderStore } from "@/stores/headerStore";
import HeaderComponent from "./components/HeaderComponent.vue";

const headerStore = useHeaderStore();
const { headerGroups } = storeToRefs(headerStore);
const { updateGroupHeaders, moveHeaderBetweenGroups } = headerStore;

const dragState = ref<{
  sourceGroupId: string | null;
  sourceIndex: number | null;
}>({ sourceGroupId: null, sourceIndex: null });

provide('dragState', dragState);
provide('moveHeaderBetweenGroups', moveHeaderBetweenGroups);
</script>

<template>
  <HeaderComponent
    v-for="group in headerGroups"
    v-show="group.headers.length > 0"
    :key="group.id"
    :headers="group.headers"
    :group="group.id"
    :on-update="(newHeaders) => updateGroupHeaders(group.id, newHeaders)"
  />
</template>
