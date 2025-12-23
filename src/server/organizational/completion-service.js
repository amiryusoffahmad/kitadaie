"use server";

import { db } from "@/lib/db";

/**
 * Mark a task as completed by a user
 * @param {Object} params - Completion parameters
 * @param {number} params.taskId - Task ID
 * @param {string} params.userId - User ID
 * @param {string} [params.notes] - Optional completion notes
 * @returns {Promise<Object>} - Created completion record
 */
export async function markTaskAsCompleted({ taskId, userId, notes = null }) {
  try {
    // Validate required fields
    if (!taskId || !userId) {
      throw new Error("Task ID and user ID are required");
    }

    // Check if task exists
    const task = await db("organizational_tasks").where({ id: taskId }).first();
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    // Check if user exists
    const user = await db("user").where({ id: userId }).first();
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Check if already completed by this user
    const existing = await db("task_completions")
      .where({
        task_id: taskId,
        user_id: userId,
      })
      .first();

    if (existing) {
      // Update notes if provided
      if (notes !== null) {
        await db("task_completions")
          .where({ id: existing.id })
          .update({
            notes,
            completed_at: db.fn.now(),
          });
        return await getCompletionById(existing.id);
      }
      return existing;
    }

    // Create completion record
    const [completionId] = await db("task_completions").insert({
      task_id: taskId,
      user_id: userId,
      notes,
    });

    // Return the created completion
    return await getCompletionById(completionId);
  } catch (error) {
    console.error("Error marking task as completed:", error);
    throw new Error(`Failed to mark task as completed: ${error.message}`);
  }
}

/**
 * Get a completion record by ID
 * @param {number} completionId - Completion ID
 * @returns {Promise<Object|null>} - Completion record or null
 */
export async function getCompletionById(completionId) {
  try {
    if (!completionId) {
      throw new Error("Completion ID is required");
    }

    const completion = await db("task_completions as tc")
      .leftJoin("organizational_tasks as ot", "tc.task_id", "ot.id")
      .leftJoin("user as u", "tc.user_id", "u.id")
      .where("tc.id", completionId)
      .select(
        "tc.*",
        "ot.title as task_title",
        "u.name as user_name",
        "u.email as user_email"
      )
      .first();

    return completion || null;
  } catch (error) {
    console.error("Error getting completion by ID:", error);
    throw new Error(`Failed to get completion: ${error.message}`);
  }
}

/**
 * Unmark a task completion (remove completion record)
 * @param {Object} params - Parameters
 * @param {number} params.taskId - Task ID
 * @param {string} params.userId - User ID
 * @returns {Promise<boolean>} - True if removed successfully
 */
export async function unmarkTaskCompletion({ taskId, userId }) {
  try {
    if (!taskId || !userId) {
      throw new Error("Task ID and user ID are required");
    }

    const deleted = await db("task_completions")
      .where({
        task_id: taskId,
        user_id: userId,
      })
      .delete();

    return deleted > 0;
  } catch (error) {
    console.error("Error unmarking task completion:", error);
    throw new Error(`Failed to unmark task completion: ${error.message}`);
  }
}

/**
 * Get completion status/statistics for a task
 * @param {number} taskId - Task ID
 * @returns {Promise<Object>} - Completion statistics
 */
export async function getTaskCompletionStatus(taskId) {
  try {
    if (!taskId) {
      throw new Error("Task ID is required");
    }

    // Get task details
    const task = await db("organizational_tasks").where({ id: taskId }).first();
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    // Get total assigned users (via task_assignments and user_role_department_assignments)
    const taskAssignments = await db("task_assignments")
      .where({ task_id: taskId })
      .select("role_id", "department_id");

    if (taskAssignments.length === 0) {
      return {
        task_id: taskId,
        total_assigned: 0,
        total_completed: 0,
        completion_percentage: 0,
        completions: [],
      };
    }

    // Count total assigned users
    const assignedUsers = await db("user_role_department_assignments as urda")
      .where((builder) => {
        taskAssignments.forEach((assignment, index) => {
          const condition = {};
          if (assignment.role_id) {
            condition["urda.role_id"] = assignment.role_id;
          }
          if (assignment.department_id) {
            condition["urda.department_id"] = assignment.department_id;
          }

          if (index === 0) {
            builder.where(condition);
          } else {
            builder.orWhere(condition);
          }
        });
      })
      .where("urda.is_active", true)
      .countDistinct("urda.user_id as count")
      .first();

    const totalAssigned = assignedUsers?.count || 0;

    // Get completions
    const completions = await db("task_completions as tc")
      .join("user as u", "tc.user_id", "u.id")
      .where("tc.task_id", taskId)
      .select(
        "tc.*",
        "u.name as user_name",
        "u.email as user_email",
        "u.username"
      )
      .orderBy("tc.completed_at", "desc");

    const totalCompleted = completions.length;
    const completionPercentage =
      totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

    return {
      task_id: taskId,
      total_assigned: totalAssigned,
      total_completed: totalCompleted,
      completion_percentage: completionPercentage,
      completions,
    };
  } catch (error) {
    console.error("Error getting task completion status:", error);
    throw new Error(`Failed to get task completion status: ${error.message}`);
  }
}

/**
 * Get all completed tasks for a user
 * @param {string} userId - User ID
 * @param {Object} [filters] - Optional filters
 * @param {number} [filters.limit] - Limit number of results
 * @param {number} [filters.offset] - Offset for pagination
 * @returns {Promise<Array>} - List of completed tasks
 */
export async function getUserCompletedTasks(userId, filters = {}) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const { limit, offset } = filters;

    let query = db("task_completions as tc")
      .join("organizational_tasks as ot", "tc.task_id", "ot.id")
      .where("tc.user_id", userId)
      .select(
        "tc.*",
        "ot.title as task_title",
        "ot.description as task_description",
        "ot.training_type",
        "ot.target_month",
        "ot.target_year",
        "ot.status as task_status"
      )
      .orderBy("tc.completed_at", "desc");

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.offset(offset);
    }

    const completedTasks = await query;

    return completedTasks;
  } catch (error) {
    console.error("Error getting user completed tasks:", error);
    throw new Error(`Failed to get user completed tasks: ${error.message}`);
  }
}

/**
 * Check if a user has completed a specific task
 * @param {Object} params - Parameters
 * @param {number} params.taskId - Task ID
 * @param {string} params.userId - User ID
 * @returns {Promise<boolean>} - True if user has completed the task
 */
export async function hasUserCompletedTask({ taskId, userId }) {
  try {
    if (!taskId || !userId) {
      throw new Error("Task ID and user ID are required");
    }

    const completion = await db("task_completions")
      .where({
        task_id: taskId,
        user_id: userId,
      })
      .first();

    return !!completion;
  } catch (error) {
    console.error("Error checking task completion:", error);
    throw new Error(`Failed to check task completion: ${error.message}`);
  }
}

/**
 * Get completion statistics summary
 * @returns {Promise<Object>} - Overall completion statistics
 */
export async function getCompletionStatistics() {
  try {
    // Total tasks
    const [totalTasks] = await db("organizational_tasks").count("id as count");

    // Tasks by status
    const tasksByStatus = await db("organizational_tasks")
      .select("status")
      .count("id as count")
      .groupBy("status");

    // Total completions
    const [totalCompletions] = await db("task_completions").count("id as count");

    // Recent completions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const [recentCompletions] = await db("task_completions")
      .where("completed_at", ">=", sevenDaysAgo.toISOString())
      .count("id as count");

    return {
      total_tasks: totalTasks.count,
      tasks_by_status: tasksByStatus.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {}),
      total_completions: totalCompletions.count,
      recent_completions_7days: recentCompletions.count,
    };
  } catch (error) {
    console.error("Error getting completion statistics:", error);
    throw new Error(`Failed to get completion statistics: ${error.message}`);
  }
}
