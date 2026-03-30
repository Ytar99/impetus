import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Helper function to get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

// Get current user info
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get("users", userId);
    return user;
  },
});

// Get weeks for current user
export const getWeeks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId)
      return {
        weeks: [],
        currentWeek: null,
        needsUpdate: false,
        weekExpired: false,
      };

    // Get user state
    const userState = await ctx.db
      .query("userState")
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();

    // Get all weeks for user
    const weeks = await ctx.db
      .query("weeks")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();

    // Get current week (active week)
    const currentWeek = weeks.find((w) => w.status === "active");

    // Check if week has expired (only check, don't modify in query)
    let weekExpired = false;
    if (currentWeek) {
      const today = getTodayDate();
      if (today > currentWeek.endDate) {
        weekExpired = true;
      }
    }

    // Check if needs update
    const needsUpdate = userState && userState.lastUpdateDate < getTodayDate();

    // Get days for all weeks with task counts
    const weeksWithDays = await Promise.all(
      weeks.map(async (week) => {
        const days = await ctx.db
          .query("days")
          .filter((q) => q.eq(q.field("weekId"), week._id))
          .order("asc")
          .collect();

        const daysWithTasks = await Promise.all(
          days.map(async (day) => {
            // Get task count for this day
            const daySkills = await ctx.db
              .query("daySkills")
              .filter((q) => q.eq(q.field("dayId"), day._id))
              .collect();

            const totalTasks = daySkills.length;
            const completedTasks = daySkills.filter(
              (ds) => ds.completed,
            ).length;

            return {
              date: day.date,
              status: day.status,
              taskCount: totalTasks,
              completedCount: completedTasks,
            };
          }),
        );

        return {
          ...week,
          days: daysWithTasks,
        };
      }),
    );

    // Get days for current week with task counts
    let currentWeekWithDays = null;
    if (currentWeek) {
      const days = await ctx.db
        .query("days")
        .filter((q) => q.eq(q.field("weekId"), currentWeek._id))
        .order("asc")
        .collect();

      const daysWithTasks = await Promise.all(
        days.map(async (day) => {
          // Get task count for this day
          const daySkills = await ctx.db
            .query("daySkills")
            .filter((q) => q.eq(q.field("dayId"), day._id))
            .collect();

          const totalTasks = daySkills.length;
          const completedTasks = daySkills.filter((ds) => ds.completed).length;

          return {
            date: day.date,
            status: day.status,
            taskCount: totalTasks,
            completedCount: completedTasks,
          };
        }),
      );

      currentWeekWithDays = {
        ...currentWeek,
        days: daysWithTasks,
      };
    }

    // Add "start" week placeholder when there's no active week
    const weeksWithStartPlaceholder = currentWeek
      ? weeksWithDays
      : [
          {
            _id: "start-week-placeholder" as Id<"weeks">,
            userId: userId as Id<"users">,
            startDate: "",
            endDate: "",
            status: "start" as "active" | "completed",
            createdAt: Date.now(),
            days: [],
          },
          ...weeksWithDays,
        ];

    return {
      weeks: weeksWithStartPlaceholder,
      currentWeek: currentWeekWithDays,
      needsUpdate: needsUpdate || false,
      weekExpired: weekExpired,
    };
  },
});

// Get today's tasks
export const getTodayTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { todayTasks: [] };

    // Get current week
    const currentWeek = await ctx.db
      .query("weeks")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .unique();

    if (!currentWeek) return { todayTasks: [] };

    // Get today's day
    const today = getTodayDate();
    const todayDay = await ctx.db
      .query("days")
      .filter((q) => q.eq(q.field("weekId"), currentWeek._id))
      .filter((q) => q.eq(q.field("date"), today))
      .unique();

    if (!todayDay) return { todayTasks: [] };

    // Get skills for today
    const daySkills = await ctx.db
      .query("daySkills")
      .filter((q) => q.eq(q.field("dayId"), todayDay._id))
      .collect();

    const skills = await Promise.all(
      daySkills.map(async (ds) => {
        const skill = await ctx.db.get("skills", ds.skillId);
        if (!skill) return null;
        return {
          id: skill._id,
          name: skill.name,
          completed: ds.completed,
          note: ds.note,
          dayId: ds.dayId,
        };
      }),
    );

    // Filter out null values
    const validSkills = skills.filter((skill) => skill !== null);

    return { todayTasks: validSkills };
  },
});

// Get skills for current user
export const getSkills = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { skills: [] };

    const skills = await ctx.db
      .query("skills")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    return { skills };
  },
});

// Create new week
export const createWeek = mutation({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already has an active week
    const existingActiveWeek = await ctx.db
      .query("weeks")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .unique();

    if (existingActiveWeek) {
      throw new Error("You already have an active week");
    }

    // Create week
    const weekId = await ctx.db.insert("weeks", {
      userId,
      startDate: args.startDate,
      endDate: args.endDate,
      status: "active",
      createdAt: Date.now(),
    });

    // Create 7 days
    const days = [];
    const start = new Date(args.startDate);
    const today = getTodayDate();

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateString = date.toISOString().split("T")[0];

      // Determine status based on date:
      // - Past days (before today): "missed"
      // - Today: "today"
      // - Future days: "empty"
      let status: "empty" | "today" | "missed";
      if (dateString < today) {
        status = "missed";
      } else if (dateString === today) {
        status = "today";
      } else {
        status = "empty";
      }

      const dayId = await ctx.db.insert("days", {
        weekId,
        date: dateString,
        status,
        createdAt: Date.now(),
      });

      days.push(dayId);
    }

    // Update user state
    const userState = await ctx.db
      .query("userState")
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();

    if (userState) {
      await ctx.db.patch("userState", userState._id, {
        currentWeekId: weekId,
        lastUpdateDate: getTodayDate(),
      });
    } else {
      await ctx.db.insert("userState", {
        userId,
        currentWeekId: weekId,
        lastUpdateDate: getTodayDate(),
        createdAt: Date.now(),
      });
    }

    return { weekId, days };
  },
});

// Add skill
export const addSkill = mutation({
  args: {
    name: v.string(),
    targetDaysPerWeek: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.targetDaysPerWeek < 1 || args.targetDaysPerWeek > 7) {
      throw new Error("Target days per week must be between 1 and 7");
    }

    const skillId = await ctx.db.insert("skills", {
      userId,
      name: args.name,
      targetDaysPerWeek: args.targetDaysPerWeek,
      createdAt: Date.now(),
    });

    return { skillId };
  },
});

// Distribute skills to current week
export const distributeSkills = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get current week
    const currentWeek = await ctx.db
      .query("weeks")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .unique();

    if (!currentWeek) throw new Error("No active week found");

    // Get all days in week
    const days = await ctx.db
      .query("days")
      .filter((q) => q.eq(q.field("weekId"), currentWeek._id))
      .order("asc")
      .collect();

    // Get all skills
    const skills = await ctx.db
      .query("skills")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    // Clear existing daySkills for this week
    const existingDaySkills = await ctx.db
      .query("daySkills")
      .filter((q) => {
        const dayIds = days.map((d) => d._id);
        return q.or(...dayIds.map((dayId) => q.eq(q.field("dayId"), dayId)));
      })
      .collect();

    for (const daySkill of existingDaySkills) {
      await ctx.db.delete("daySkills", daySkill._id);
    }

    // Distribute skills with uniform load balancing
    // Create array of all skill assignments needed
    const assignments = [];
    for (const skill of skills) {
      for (let i = 0; i < skill.targetDaysPerWeek; i++) {
        assignments.push(skill._id);
      }
    }

    // Shuffle assignments for randomness
    for (let i = assignments.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
    }

    // Distribute assignments to days with minimum current load
    for (const skillId of assignments) {
      // Get current load for each day (number of existing daySkills)
      const dayLoads = await Promise.all(
        days.map(async (day) => {
          const count = await ctx.db
            .query("daySkills")
            .filter((q) => q.eq(q.field("dayId"), day._id))
            .collect();
          return { day, load: count.length };
        }),
      );

      // Find minimum load
      const minLoad = Math.min(...dayLoads.map((dl) => dl.load));

      // Get days with minimum load
      const minLoadDays = dayLoads.filter((dl) => dl.load === minLoad);

      // Randomly select one of the days with minimum load
      const randomIndex = Math.floor(Math.random() * minLoadDays.length);
      const selectedDay = minLoadDays[randomIndex].day;

      // Create daySkill entry
      await ctx.db.insert("daySkills", {
        dayId: selectedDay._id,
        skillId: skillId,
        completed: false,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Get tasks for specific day
export const getDayTasks = query({
  args: {
    dayIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { dayTasks: [] };

    // Get current week
    const currentWeek = await ctx.db
      .query("weeks")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .unique();

    if (!currentWeek) return { dayTasks: [] };

    // Get all days in week
    const days = await ctx.db
      .query("days")
      .filter((q) => q.eq(q.field("weekId"), currentWeek._id))
      .order("asc")
      .collect();

    const selectedDay = days[args.dayIndex];
    if (!selectedDay) return { dayTasks: [] };

    // Get skills for selected day
    const daySkills = await ctx.db
      .query("daySkills")
      .filter((q) => q.eq(q.field("dayId"), selectedDay._id))
      .collect();

    const skills = await Promise.all(
      daySkills.map(async (ds) => {
        const skill = await ctx.db.get("skills", ds.skillId);
        if (!skill) return null;
        return {
          id: skill._id,
          name: skill.name,
          completed: ds.completed,
          note: ds.note,
          dayId: ds.dayId,
        };
      }),
    );

    // Filter out null values
    const validSkills = skills.filter((skill) => skill !== null);

    return { dayTasks: validSkills };
  },
});

// Update skill
export const updateSkill = mutation({
  args: {
    skillId: v.id("skills"),
    name: v.string(),
    targetDaysPerWeek: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.targetDaysPerWeek < 1 || args.targetDaysPerWeek > 7) {
      throw new Error("Target days per week must be between 1 and 7");
    }

    // Check if skill belongs to user
    const skill = await ctx.db.get("skills", args.skillId);
    if (!skill || skill.userId !== userId) throw new Error("Unauthorized");

    // Update the skill
    await ctx.db.patch("skills", args.skillId, {
      name: args.name,
      targetDaysPerWeek: args.targetDaysPerWeek,
    });

    return { success: true };
  },
});

// Remove skill
export const removeSkill = mutation({
  args: {
    skillId: v.id("skills"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if skill belongs to user
    const skill = await ctx.db.get("skills", args.skillId);
    if (!skill || skill.userId !== userId) throw new Error("Unauthorized");

    // Remove the skill
    await ctx.db.delete("skills", args.skillId);

    return { success: true };
  },
});

// Toggle skill completion
export const toggleSkill = mutation({
  args: {
    dayId: v.id("days"),
    skillId: v.id("skills"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if day belongs to user
    const day = await ctx.db.get("days", args.dayId);
    if (!day) throw new Error("Day not found");

    const week = await ctx.db.get("weeks", day.weekId);
    if (!week || week.userId !== userId) throw new Error("Unauthorized");

    // Find or create daySkill
    const existingDaySkill = await ctx.db
      .query("daySkills")
      .filter((q) => q.eq(q.field("dayId"), args.dayId))
      .filter((q) => q.eq(q.field("skillId"), args.skillId))
      .unique();

    if (existingDaySkill) {
      await ctx.db.patch("daySkills", existingDaySkill._id, {
        completed: args.completed,
      });
    } else {
      await ctx.db.insert("daySkills", {
        dayId: args.dayId,
        skillId: args.skillId,
        completed: args.completed,
        createdAt: Date.now(),
      });
    }

    // Update day status based on all skills for that day
    const daySkills = await ctx.db
      .query("daySkills")
      .filter((q) => q.eq(q.field("dayId"), args.dayId))
      .collect();

    const allCompleted = daySkills.every((ds) => ds.completed);
    const hasAnyCompleted = daySkills.some((ds) => ds.completed);
    const today = getTodayDate();

    let newStatus: "empty" | "today" | "completed" | "missed";

    if (day.date === today) {
      // Today's status logic
      if (allCompleted) {
        newStatus = "completed";
      } else {
        newStatus = "today";
      }
    } else {
      // Past days status logic
      if (allCompleted) {
        newStatus = "completed";
      } else if (hasAnyCompleted) {
        newStatus = "today"; // Partially completed past days show as today (in progress)
      } else {
        newStatus = "missed";
      }
    }

    await ctx.db.patch("days", args.dayId, {
      status: newStatus,
    });

    return { success: true };
  },
});

// Complete expired week (mark as completed and mark empty days as missed)
export const completeExpiredWeek = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get user state
    const userState = await ctx.db
      .query("userState")
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();

    if (!userState || !userState.currentWeekId) {
      return { completed: false }; // No active week to complete
    }

    // Get current week
    const currentWeek = await ctx.db.get("weeks", userState.currentWeekId);
    if (!currentWeek || currentWeek.status !== "active") {
      return { completed: false }; // No active week
    }

    // Check if week has expired (today is after end date)
    const today = getTodayDate();
    if (today <= currentWeek.endDate) {
      return { completed: false }; // Week hasn't expired yet
    }

    // Get all days in week
    const days = await ctx.db
      .query("days")
      .filter((q) => q.eq(q.field("weekId"), currentWeek._id))
      .collect();

    // Update all empty/today days to missed
    for (const day of days) {
      if (day.status === "empty" || day.status === "today") {
        await ctx.db.patch("days", day._id, {
          status: "missed",
        });
      }
    }

    // Mark week as completed
    await ctx.db.patch("weeks", currentWeek._id, {
      status: "completed",
    });

    // Clear currentWeekId in userState
    await ctx.db.patch("userState", userState._id, {
      currentWeekId: undefined,
    });

    return { completed: true };
  },
});

// Update day (handle missed days)
export const updateDay = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get user state
    const userState = await ctx.db
      .query("userState")
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();

    if (!userState) throw new Error("User state not found");

    const lastUpdate = new Date(userState.lastUpdateDate);
    const today = new Date(getTodayDate());
    const daysDiff = Math.floor(
      (today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff <= 0) return { success: true }; // No update needed

    // Get current week
    const currentWeek = await ctx.db.get("weeks", userState.currentWeekId!);
    if (!currentWeek) throw new Error("No active week found");

    // Get all days in week
    const days = await ctx.db
      .query("days")
      .filter((q) => q.eq(q.field("weekId"), currentWeek._id))
      .collect();

    // Process each missed day
    for (let i = 1; i <= daysDiff; i++) {
      const checkDate = new Date(lastUpdate);
      checkDate.setDate(lastUpdate.getDate() + i);
      const checkDateString = checkDate.toISOString().split("T")[0];

      const day = days.find((d) => d.date === checkDateString);
      if (day) {
        // Check if all skills for this day are completed
        const daySkills = await ctx.db
          .query("daySkills")
          .filter((q) => q.eq(q.field("dayId"), day._id))
          .collect();

        const allCompleted = daySkills.every((ds) => ds.completed);

        if (!allCompleted) {
          await ctx.db.patch("days", day._id, {
            status: "missed",
          });
        } else {
          await ctx.db.patch("days", day._id, {
            status: "completed",
          });
        }
      }
    }

    // Update today's status
    const todayDay = days.find((d) => d.date === getTodayDate());
    if (todayDay) {
      await ctx.db.patch("days", todayDay._id, {
        status: "today",
      });
    }

    // Update user state
    await ctx.db.patch("userState", userState._id, {
      lastUpdateDate: getTodayDate(),
    });

    return { success: true };
  },
});
