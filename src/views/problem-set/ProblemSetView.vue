<script setup lang="ts">
import ProblemExplorer from "@/components/problem/ProblemExplorer.vue";
import ProblemSetSidebar from "@/components/problem/ProblemSetSidebar.vue";
import FeaturedBanners from "@/components/problem/FeaturedBanners.vue";
</script>

<template>
  <div class="container mx-auto max-w-[1240px] px-4 sm:px-6 py-6 space-y-8">
    <!-- Top Banners -->
    <section>
      <FeaturedBanners />
    </section>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Problem List (9 cols) -->
      <main class="lg:col-span-9 space-y-6">
        <ProblemExplorer />
      </main>

      <!-- Right Column: Sidebar (3 cols) -->
      <aside class="hidden lg:block lg:col-span-3 space-y-6 sticky top-6">
        <ProblemSetSidebar />
      </aside>
    </div>
  </div>
</template>
