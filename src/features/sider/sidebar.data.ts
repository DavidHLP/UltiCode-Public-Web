import type { Component } from 'vue';
import {
  Flame,
  LayoutGrid,
  TrendingUp,
  Globe,
  Home,
  Code2,
  Trophy,
  History,
  Star,
  Box,
  Terminal,
  MessageSquare,
  Briefcase,
  DollarSign,
  Cpu,
  FileText,
  HelpCircle,
} from 'lucide-vue-next';

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
    ]
  },
  {
    name: "Categories",
    collapsible: true,
    items: [
      { title: "Interview Experience", url: "/forum/c/interview", icon: MessageSquare },
      { title: "Career", url: "/forum/c/career", icon: Briefcase },
      { title: "Compensation", url: "/forum/c/compensation", icon: DollarSign },
      { title: "Technology", url: "/forum/c/technology", icon: Cpu },
    ]
  },
  {
    name: "Resources",
    collapsible: true,
    items: [
      { title: "Guidelines", url: "/forum/guidelines", icon: FileText },
      { title: "Feedback", url: "/forum/feedback", icon: HelpCircle },
    ]
  }
];

export const problemSidebarData: SidebarSection[] = [
  {
    name: "Problem Set",
    items: [
      { title: "All Problems", url: "/problem-set", icon: LayoutGrid },
      { title: "Algorithms", url: "/problem-set/algorithms", icon: Code2 },
      { title: "Database", url: "/problem-set/database", icon: Box },
      { title: "Shell", url: "/problem-set/shell", icon: Terminal },
      { title: "Concurrency", url: "/problem-set/concurrency", icon: Cpu },
    ]
  },
  {
    name: "Study Plans",
    items: [
      { title: "Top Interview 150", url: "/study-plan/top-interview-150", icon: Trophy },
      { title: "LeetCode 75", url: "/study-plan/leetcode-75", icon: Star },
    ]
  }
];

export const contestSidebarData: SidebarSection[] = [
  {
    name: "Contest",
    items: [
      { title: "Contest Home", url: "/contest", icon: Home },
      { title: "Past Contests", url: "/contest/past", icon: History },
      { title: "My Contests", url: "/contest/my", icon: Trophy },
    ]
  },
  {
    name: "Ranking",
    collapsible: true,
    items: [
      { title: "Global Ranking", url: "/contest/global-ranking", icon: Globe },
      { title: "Local Ranking", url: "/contest/local-ranking", icon:  Flame},
    ]
  }
];

export const sidebarData = forumSidebarData; // Default fallback
