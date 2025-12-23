"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getRole } from "@/server/user/user.server";
import * as taskService from "../organizational/task-service";
import * as reminderService from "../organizational/reminder-service";
import * as completionService from "../organizational/completion-service";

/**
 * Check if current user is admin
 * @returns {Promise<boolean>}
 */
async function checkAdminPermission() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    throw new Error("Authentication required");
  }

  const roleData = await getRole(session.user.id);
  if (!roleData || roleData.role !== "admin") {
    throw new Error("Admin permission required");
  }

  return true;
}

// ============================================
// TASK CRUD ACTIONS (Admin Only)
// ============================================

/**
 * Create a new organizational task (admin only)
 * @param {Object} data - Task data
 * @returns {Promise<Object>}
 */
export async function createOrganizationalTask(data) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    await checkAdminPermission();

    // Add createdBy from session
    const taskData = {
      ...data,
      createdBy: session.user.id,
    };

    const task = await taskService.createTask(taskData);

    revalidatePath("/admin-organizational/tasks");
    revalidatePath("/tasks");
    return { success: true, data: task, message: "Task created successfully" };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Update an organizational task (admin only)
 * @param {number} taskId - Task ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>}
 */
export async function updateOrganizationalTask(taskId, updates) {
  try {
    await checkAdminPermission();

    const task = await taskService.updateTask(taskId, updates);

    revalidatePath("/admin-organizational/tasks");
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${taskId}`);
    return { success: true, data: task, message: "Task updated successfully" };
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete an organizational task (admin only)
 * @param {number} taskId - Task ID
 * @returns {Promise<Object>}
 */
export async function deleteOrganizationalTask(taskId) {
  try {
    await checkAdminPermission();

    await taskService.deleteTask(taskId);

    revalidatePath("/admin-organizational/tasks");
    revalidatePath("/tasks");
    return { success: true, message: "Task deleted successfully" };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Get all tasks with filters (admin only)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>}
 */
export async function fetchAllTasks(filters = {}) {
  try {
    await checkAdminPermission();

    const tasks = await taskService.getTasks(filters);

    return { success: true, data: tasks };
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    return { success: false, message: error.message };
  }
}

// ============================================
// TASK ASSIGNMENT ACTIONS (Admin Only)
// ============================================

/**
 * Assign task to roles/departments (admin only)
 * @param {Object} data - Assignment data
 * @param {number} data.taskId - Task ID
 * @param {Array} data.assignments - Array of {roleId, departmentId} objects
 * @returns {Promise<Object>}
 */
export async function assignTask(data) {
  try {
    await checkAdminPermission();

    const { taskId, assignments } = data;

    if (!taskId || !assignments || assignments.length === 0) {
      throw new Error("Task ID and at least one assignment are required");
    }

    const createdAssignments = [];

    for (const assignment of assignments) {
      const result = await taskService.assignTaskToRoleDepartment(taskId, assignment);
      createdAssignments.push(result);
    }

    revalidatePath("/admin-organizational/tasks");
    revalidatePath(`/admin-organizational/tasks/${taskId}`);
    revalidatePath("/tasks");
    return {
      success: true,
      data: createdAssignments,
      message: "Task assigned successfully",
    };
  } catch (error) {
    console.error("Error assigning task:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Remove a task assignment (admin only)
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Object>}
 */
export async function removeTaskAssignment(assignmentId) {
  try {
    await checkAdminPermission();

    await taskService.removeTaskAssignment(assignmentId);

    revalidatePath("/admin-organizational/tasks");
    revalidatePath("/tasks");
    return { success: true, message: "Assignment removed successfully" };
  } catch (error) {
    console.error("Error removing task assignment:", error);
    return { success: false, message: error.message };
  }
}

// ============================================
// REMINDER ACTIONS (Admin Only)
// ============================================

/**
 * Create reminders for a task (admin only)
 * @param {Object} data - Reminder data
 * @param {number} data.taskId - Task ID
 * @param {Array} data.reminders - Array of {daysBefore} objects
 * @returns {Promise<Object>}
 */
export async function createTaskReminders(data) {
  try {
    await checkAdminPermission();

    const { taskId, reminders } = data;

    if (!taskId || !reminders || reminders.length === 0) {
      throw new Error("Task ID and at least one reminder are required");
    }

    const createdReminders = [];

    for (const reminder of reminders) {
      const result = await reminderService.createReminder({
        taskId,
        daysBefore: reminder.daysBefore,
      });
      createdReminders.push(result);
    }

    revalidatePath("/admin-organizational/tasks");
    revalidatePath(`/admin-organizational/tasks/${taskId}`);
    return {
      success: true,
      data: createdReminders,
      message: "Reminders created successfully",
    };
  } catch (error) {
    console.error("Error creating reminders:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Update a reminder (admin only)
 * @param {number} reminderId - Reminder ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>}
 */
export async function updateTaskReminder(reminderId, updates) {
  try {
    await checkAdminPermission();

    const reminder = await reminderService.updateReminder(reminderId, updates);

    revalidatePath("/admin-organizational/tasks");
    return { success: true, data: reminder, message: "Reminder updated successfully" };
  } catch (error) {
    console.error("Error updating reminder:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete a reminder (admin only)
 * @param {number} reminderId - Reminder ID
 * @returns {Promise<Object>}
 */
export async function deleteTaskReminder(reminderId) {
  try {
    await checkAdminPermission();

    await reminderService.deleteReminder(reminderId);

    revalidatePath("/admin-organizational/tasks");
    return { success: true, message: "Reminder deleted successfully" };
  } catch (error) {
    console.error("Error deleting reminder:", error);
    return { success: false, message: error.message };
  }
}

// ============================================
// USER TASK ACTIONS (Current User)
// ============================================

/**
 * Get tasks assigned to current user
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>}
 */
export async function getUserOrganizationalTasks(filters = {}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    const tasks = await taskService.getUserTasks(session.user.id, filters);

    return { success: true, data: tasks };
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Get task details
 * @param {number} taskId - Task ID
 * @returns {Promise<Object>}
 */
export async function getTaskDetails(taskId) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    const task = await taskService.getTaskById(taskId);

    if (!task) {
      throw new Error("Task not found");
    }

    // Get completion status
    const completionStatus = await completionService.getTaskCompletionStatus(taskId);

    // Check if current user has completed this task
    const userCompleted = await completionService.hasUserCompletedTask({
      taskId,
      userId: session.user.id,
    });

    // Get reminders
    const reminders = await reminderService.getTaskReminders(taskId);

    return {
      success: true,
      data: {
        ...task,
        completionStatus,
        userCompleted,
        reminders,
      },
    };
  } catch (error) {
    console.error("Error fetching task details:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Mark a task as complete for current user
 * @param {Object} data - Completion data
 * @param {number} data.taskId - Task ID
 * @param {string} [data.notes] - Optional completion notes
 * @returns {Promise<Object>}
 */
export async function markMyTaskComplete(data) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    const completion = await completionService.markTaskAsCompleted({
      taskId: data.taskId,
      userId: session.user.id,
      notes: data.notes,
    });

    revalidatePath("/tasks");
    revalidatePath(`/tasks/${data.taskId}`);
    revalidatePath("/home");
    return { success: true, data: completion, message: "Task marked as complete" };
  } catch (error) {
    console.error("Error marking task complete:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Unmark task completion for current user
 * @param {number} taskId - Task ID
 * @returns {Promise<Object>}
 */
export async function unmarkMyTaskComplete(taskId) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    await completionService.unmarkTaskCompletion({
      taskId,
      userId: session.user.id,
    });

    revalidatePath("/tasks");
    revalidatePath(`/tasks/${taskId}`);
    revalidatePath("/home");
    return { success: true, message: "Task completion removed" };
  } catch (error) {
    console.error("Error unmarking task completion:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Get user's completed tasks
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>}
 */
export async function getMyCompletedTasks(filters = {}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Authentication required");
    }

    const completedTasks = await completionService.getUserCompletedTasks(
      session.user.id,
      filters
    );

    return { success: true, data: completedTasks };
  } catch (error) {
    console.error("Error fetching completed tasks:", error);
    return { success: false, message: error.message };
  }
}
