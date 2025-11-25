<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, provide, type Ref } from "vue";
import { useHeaderStore } from "@/stores/headerStore";
import HeaderComponent from "./components/LayoutComponent.vue";
import type { HeaderModel } from "@/stores/headerStore";

interface SelectedHeader {
  header: HeaderModel | null;
  group: string | null;
}

const headerStore = useHeaderStore();
const { headerGroups } = storeToRefs(headerStore);
const { updateGroupHeaders, moveHeaderBetweenGroups } = headerStore;

const dragState = ref<{
  sourceGroupId: string | null;
  sourceIndex: number | null;
}>({ sourceGroupId: null, sourceIndex: null });

const selectedHeader = ref<SelectedHeader>({
  header: null,
  group: null
});

provide('dragState', dragState);
provide('moveHeaderBetweenGroups', moveHeaderBetweenGroups);
provide<Ref<SelectedHeader>>('selectedHeader', selectedHeader);

const handleHeaderSelect = (header: HeaderModel, group: string) => {
  selectedHeader.value = { header, group };
};
</script>

<template>
  <div class="flex flex-col h-screen">
    <div class="flex-shrink-0">
      <HeaderComponent
        v-for="group in headerGroups"
        v-show="group.headers.length > 0"
        :key="group.id"
        :headers="group.headers"
        :group="group.id"
        :on-update="(newHeaders) => updateGroupHeaders(group.id, newHeaders)"
        @header-select="handleHeaderSelect"
      />
    </div>
  </div>
</template>