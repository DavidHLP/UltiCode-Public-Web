<script setup lang="ts">
import {
  Bell,
  ChevronsUpDown,
  LogOut,
  User,
  History,
  FileCode,
  Settings,
  Bookmark,
  MessageSquare,
  List,
  CheckCircle2,
} from "lucide-vue-next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const { user } = defineProps<{
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}>();

const { isMobile } = useSidebar();
import { useRouter } from "vue-router";
import { logout } from "@/api/auth";
import { removeToken, removeUserId } from "@/utils/auth";
import { toast } from "vue-sonner";

const router = useRouter();

async function handleLogout() {
  try {
    await logout();
  } catch (error) {
    console.error("Logout failed", error);
    // Continue with local cleanup anyway
  } finally {
    removeToken();
    removeUserId();
    toast.success("Logged out successfully");
    router.push("/login");
  }
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage :src="user.avatar" :alt="user.name" />
              <AvatarFallback class="rounded-lg"> CN </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{{ user.name }}</span>
              <span class="truncate text-xs">{{ user.email }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="start"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :src="user.avatar" :alt="user.name" />
                <AvatarFallback class="rounded-lg">
                  {{ user.name.substring(0, 2).toUpperCase() }}
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">{{ user.name }}</span>
                <span class="truncate text-xs">{{ user.email }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <RouterLink to="/personal">
              <DropdownMenuItem>
                <User class="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
            </RouterLink>
            <RouterLink to="/personal/account">
              <DropdownMenuItem>
                <Settings class="mr-2 h-4 w-4" />
                Account Settings
              </DropdownMenuItem>
            </RouterLink>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <RouterLink to="/personal/submissions">
              <DropdownMenuItem>
                <History class="mr-2 h-4 w-4" />
                Submissions
              </DropdownMenuItem>
            </RouterLink>
            <RouterLink to="/personal/solutions">
              <DropdownMenuItem>
                <CheckCircle2 class="mr-2 h-4 w-4" />
                Solutions
              </DropdownMenuItem>
            </RouterLink>
            <RouterLink to="/personal/problem-lists">
              <DropdownMenuItem>
                <List class="mr-2 h-4 w-4" />
                Problem Lists
              </DropdownMenuItem>
            </RouterLink>
            <RouterLink to="/personal/bookmarks">
              <DropdownMenuItem>
                <Bookmark class="mr-2 h-4 w-4" />
                Bookmarks
              </DropdownMenuItem>
            </RouterLink>
            <RouterLink to="/personal/forum-posts">
              <DropdownMenuItem>
                <MessageSquare class="mr-2 h-4 w-4" />
                Forum Posts
              </DropdownMenuItem>
            </RouterLink>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Bell class="mr-2 h-4 w-4" />
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="handleLogout" class="text-destructive">
            <LogOut class="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
