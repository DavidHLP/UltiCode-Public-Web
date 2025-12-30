import type { Component } from "vue";
import {
  Flame,
  LayoutGrid,
  TrendingUp,
  Cpu,
  Globe,
  Home,
  Trophy,
  History,
  MessageSquare,
  Briefcase,
  DollarSign,
  FileText,
  HelpCircle,
  User,
  Settings,
  List,
  Bookmark,
  CheckCircle2,
} from "lucide-vue-next";

export interface SidebarItem {
  title: string;
  url?: string;
  icon?: Component;
  isActive?: boolean;
  isExpanded?: boolean;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  children?: SidebarItem[];
  action?: () => void;
}

export interface SidebarSection {
  name: string;
  items: SidebarItem[];
  collapsible?: boolean;
}

export const forumSidebarData: SidebarSection[] = [
  {
    name: "Platform",
    items: [
      { title: "Home", url: "/forum", icon: Home },
      { title: "Popular", url: "/forum/popular", icon: TrendingUp },
      { title: "Explore", url: "/forum/explore", icon: Globe },
      { title: "All Posts", url: "/forum/all", icon: LayoutGrid },
    ],
  },
  {
    name: "My Space",
    collapsible: true,
    items: [
      { title: "My Posts", url: "/personal/forum-posts", icon: MessageSquare },
      { title: "Saved Posts", url: "/personal/bookmarks", icon: Bookmark },
    ],
  },
  {
    name: "Categories",
    collapsible: true,
    items: [
      {
        title: "Interview Experience",
        url: "/forum/c/interview",
        icon: MessageSquare,
      },
      { title: "Career", url: "/forum/c/career", icon: Briefcase },
      { title: "Compensation", url: "/forum/c/compensation", icon: DollarSign },
      { title: "Technology", url: "/forum/c/technology", icon: Cpu },
    ],
  },
  {
    name: "Resources",
    collapsible: true,
    items: [
      { title: "Guidelines", url: "/forum/guidelines", icon: FileText },
      { title: "Feedback", url: "/forum/feedback", icon: HelpCircle },
    ],
  },
];

import { PROBLEM_CATEGORIES } from "@/constants/problem-categories";

export const problemSidebarData: SidebarSection[] = [
  {
    name: "Problem Set",
    items: [...PROBLEM_CATEGORIES] as unknown as SidebarItem[],
  },
];

export const contestSidebarData: SidebarSection[] = [
  {
    name: "Contest",
    items: [
      { title: "Contest Home", url: "/contest", icon: Home },
      { title: "Past Contests", url: "/contest/past", icon: History },
      { title: "My Contests", url: "/contest/my", icon: Trophy },
    ],
  },
  {
    name: "Ranking",
    collapsible: true,
    items: [
      { title: "Global Ranking", url: "/contest/global-ranking", icon: Globe },
      { title: "Local Ranking", url: "/contest/local-ranking", icon: Flame },
    ],
  },
];

export const personalSidebarData: SidebarSection[] = [
  {
    name: "Account",
    items: [
      { title: "Profile", url: "/personal", icon: User },
      { title: "Account", url: "/personal/account", icon: Settings },
    ],
  },
  {
    name: "Activity",
    items: [
      {
        title: "Submissions",
        url: "/personal/submissions",
        icon: History,
      },
      { title: "Solutions", url: "/personal/solutions", icon: CheckCircle2 },
      { title: "Problem Lists", url: "/personal/problem-lists", icon: List },
      {
        title: "Forum Posts",
        url: "/personal/forum-posts",
        icon: MessageSquare,
      },
      { title: "Bookmarks", url: "/personal/bookmarks", icon: Bookmark },
    ],
  },
];

export const sidebarData = forumSidebarData; // Default fallback
