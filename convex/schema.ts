import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  // User state for tracking last update and current week
  userState: defineTable({
    userId: v.id("users"),
    lastUpdateDate: v.string(), // "2024-03-24"
    currentWeekId: v.optional(v.id("weeks")),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Weekly structure
  weeks: defineTable({
    userId: v.id("users"),
    startDate: v.string(), // "2024-03-18" (Monday)
    endDate: v.string(), // "2024-03-24" (Sunday)
    status: v.union(v.literal("active"), v.literal("completed")),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Daily entries
  days: defineTable({
    weekId: v.id("weeks"),
    date: v.string(), // "2024-03-18"
    status: v.union(
      v.literal("empty"),
      v.literal("today"),
      v.literal("completed"),
      v.literal("missed"),
    ),
    createdAt: v.number(),
  }).index("by_week", ["weekId"]),

  // Skills/habits
  skills: defineTable({
    userId: v.id("users"),
    name: v.string(),
    targetDaysPerWeek: v.number(), // 1-7
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Daily skill completion
  daySkills: defineTable({
    dayId: v.id("days"),
    skillId: v.id("skills"),
    completed: v.boolean(),
    note: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_day", ["dayId"]),
});
