import { Bus, Zap, Leaf, ShoppingBag, Droplet } from "lucide-react";
import React from "react";

export const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ef4444'];

export const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; fill?: string; className?: string }>> = {
  "Transport": Bus,
  "Home Energy": Zap,
  "Food": Leaf,
  "Shopping": ShoppingBag,
  "Waste": Droplet,
};

// Gamification constants
export const XP_PER_HABIT = 5;
export const XP_PER_ACTION = 15;
export const XP_PER_MISSION = 100;
export const ECOPOINTS_PER_HABIT = 5;
export const ECOPOINTS_PER_ACTION = 20;

// Carbon budget defaults
export const DEFAULT_CARBON_BUDGET_KG = 300;

// Pagination limits
export const LEADERBOARD_PAGE_SIZE = 20;
export const ACTIVITIES_FETCH_LIMIT = 50;
export const NOTIFICATIONS_FETCH_LIMIT = 50;

// Simulator constraints
export const MIN_DAYS_PER_WEEK = 1;
export const MAX_DAYS_PER_WEEK = 7;
export const WEEKS_PER_MONTH = 4;

