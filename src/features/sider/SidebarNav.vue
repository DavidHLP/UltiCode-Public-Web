<script setup lang="ts">
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import type { SidebarSection } from "./sidebar.data";

defineProps<{
  sections: SidebarSection[];
}>();
</script>

<template>
  <div class="flex flex-col gap-0">
    <SidebarGroup v-for="section in sections" :key="section.name" class="py-0">
      <Collapsible
        v-if="section.collapsible"
        :default-open="true"
        class="group/collapsible"
      >
        <SidebarGroupLabel
          as-child
          class="group/label w-full text-xs font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <CollapsibleTrigger>
            {{ section.name.toUpperCase() }}
            <ChevronRight
              class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
            />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in section.items" :key="item.title">
              <SidebarMenuButton :tooltip="item.title" as-child>
                <router-link :to="item.url || '#'">
                  <component :is="item.icon" v-if="item.icon" />
                  <span>{{ item.title }}</span>
                  <Badge
                    v-if="item.badge"
                    :variant="item.badgeVariant || 'default'"
                    class="ml-auto h-5 px-1.5 text-[10px]"
                  >
                    {{ item.badge }}
                  </Badge>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>

      <template v-else>
        <!-- Non-collapsible simpler group -->
        <SidebarMenu class="mt-2">
          <SidebarMenuItem v-for="item in section.items" :key="item.title">
            <SidebarMenuButton :tooltip="item.title" as-child>
              <router-link :to="item.url || '#'">
                <component :is="item.icon" v-if="item.icon" />
                <span>{{ item.title }}</span>
                <Badge
                  v-if="item.badge"
                  :variant="item.badgeVariant || 'default'"
                  class="ml-auto h-5 px-1.5 text-[10px]"
                >
                  {{ item.badge }}
                </Badge>
              </router-link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </template>
    </SidebarGroup>
  </div>
</template>
