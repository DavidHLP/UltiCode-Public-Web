<script setup lang="ts">
import HeaderComponent from "./components/HeaderComponent.vue";
</script>

<template>
  <HeaderComponent
    :headers="[
      { id: 1, index: 0, title: '首页', icon: 'Home' },
      { id: 2, index: 1, title: '设置', icon: 'Settings' },
    ]"
  />
</template>
