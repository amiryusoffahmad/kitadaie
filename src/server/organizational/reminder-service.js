"use server";

import { db } from "@/lib/db";

/**
 * Create a reminder for a task
 * @param {Object} reminderData - Reminder data
 * @param {number} reminderData.taskId - Task ID
 * @param {number} reminderData.daysBefore - Number of days before target month to send reminder
 * @returns {Promise<Object>} - Created reminder
 */
export async function createReminder({ taskId, daysBefore }) {
  try {
    // Validate required fields
    if (!taskId || daysBefore === undefined) {
      throw new Error("Task ID and days before are required");
    }

    if (daysBefore < 0) {
      throw new Error("Days before cannot be negative");
    }

    // Get the task to calculate reminder date
    const task = await db("organizational_tasks").where({ id: taskId }).first();
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    // Calculate reminder date
    // First day of target month minus daysBefore
    const targetDate = new Date(task.target_year, task.target_month - 1, 1);
    const reminderDate = new Date(targetDate);
    reminderDate.setDate(reminderDate.getDate() - daysBefore);

    // Format date as YYYY-MM-DD for MySQL DATE column
    const reminderDateStr = reminderDate.toISOString().split("T")[0];

    // Check if a reminder already exists for this task and date
    const existing = await db("task_reminders")
      .where({
        task_id: taskId,
        reminder_date: reminderDateStr,
      })
      .first();

    if (existing) {
      throw new Error("A reminder for this task and date already exists");
    }

    const [reminderId] = await db("task_reminders").insert({
      task_id: taskId,
      reminder_date: reminderDateStr,
      days_before: daysBefore,
      sent: false,
    });

    // Return the created reminder
    const reminder = await getReminderById(reminderId);
    return reminder;
  } catch (error) {
    console.error("Error creating reminder:", error);
    throw new Error(`Failed to create reminder: ${error.message}`);
  }
}

/**
 * Get a reminder by ID
 * @param {number} reminderId - Reminder ID
 * @returns {Promise<Object|null>} - Reminder object or null
 */
export async function getReminderById(reminderId) {
  try {
    if (!reminderId) {
      throw new Error("Reminder ID is required");
    }

    const reminder = await db("task_reminders as tr")
      .leftJoin("organizational_tasks as ot", "tr.task_id", "ot.id")
      .where("tr.id", reminderId)
      .select(
        "tr.*",
        "ot.title as task_title",
        "ot.target_month",
        "ot.target_year"
      )
      .first();

    return reminder || null;
  } catch (error) {
    console.error("Error getting reminder by ID:", error);
    throw new Error(`Failed to get reminder: ${error.message}`);
  }
}

/**
 * Update a reminder
 * @param {number} reminderId - Reminder ID
 * @param {Object} updates - Fields to update
 * @param {number} [updates.daysBefore] - Number of days before
 * @returns {Promise<Object>} - Updated reminder
 */
export async function updateReminder(reminderId, updates) {
  try {
    if (!reminderId) {
      throw new Error("Reminder ID is required");
    }

    // Check if reminder exists
    const existing = await db("task_reminders").where({ id: reminderId }).first();
    if (!existing) {
      throw new Error(`Reminder with ID ${reminderId} not found`);
    }

    // If updating daysBefore, recalculate reminder_date
    if (updates.daysBefore !== undefined) {
      if (updates.daysBefore < 0) {
        throw new Error("Days before cannot be negative");
      }

      // Get the task
      const task = await db("organizational_tasks")
        .where({ id: existing.task_id })
        .first();

      if (!task) {
        throw new Error("Associated task not found");
      }

      // Recalculate reminder date
      const targetDate = new Date(task.target_year, task.target_month - 1, 1);
      const reminderDate = new Date(targetDate);
      reminderDate.setDate(reminderDate.getDate() - updates.daysBefore);
      const reminderDateStr = reminderDate.toISOString().split("T")[0];

      await db("task_reminders")
        .where({ id: reminderId })
        .update({
          days_before: updates.daysBefore,
          reminder_date: reminderDateStr,
        });
    }

    // Return updated reminder
    return await getReminderById(reminderId);
  } catch (error) {
    console.error("Error updating reminder:", error);
    throw new Error(`Failed to update reminder: ${error.message}`);
  }
}

/**
 * Delete a reminder
 * @param {number} reminderId - Reminder ID
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export async function deleteReminder(reminderId) {
  try {
    if (!reminderId) {
      throw new Error("Reminder ID is required");
    }

    // Check if reminder exists
    const existing = await db("task_reminders").where({ id: reminderId }).first();
    if (!existing) {
      throw new Error(`Reminder with ID ${reminderId} not found`);
    }

    await db("task_reminders").where({ id: reminderId }).delete();

    return true;
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw new Error(`Failed to delete reminder: ${error.message}`);
  }
}

/**
 * Get all reminders for a task
 * @param {number} taskId - Task ID
 * @returns {Promise<Array>} - List of reminders
 */
export async function getTaskReminders(taskId) {
  try {
    if (!taskId) {
      throw new Error("Task ID is required");
    }

    const reminders = await db("task_reminders")
      .where({ task_id: taskId })
      .orderBy("reminder_date", "asc");

    return reminders;
  } catch (error) {
    console.error("Error getting task reminders:", error);
    throw new Error(`Failed to get task reminders: ${error.message}`);
  }
}

/**
 * Get pending reminders that should be sent today
 * @returns {Promise<Array>} - List of pending reminders with task details
 */
export async function getPendingReminders() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const reminders = await db("task_reminders as tr")
      .join("organizational_tasks as ot", "tr.task_id", "ot.id")
      .where({
        "tr.sent": false,
        "tr.reminder_date": today,
      })
      .select(
        "tr.*",
        "ot.id as task_id",
        "ot.title as task_title",
        "ot.description as task_description",
        "ot.training_type",
        "ot.target_month",
        "ot.target_year",
        "ot.status as task_status"
      );

    return reminders;
  } catch (error) {
    console.error("Error getting pending reminders:", error);
    throw new Error(`Failed to get pending reminders: ${error.message}`);
  }
}

/**
 * Mark a reminder as sent
 * @param {number} reminderId - Reminder ID
 * @returns {Promise<Object>} - Updated reminder
 */
export async function markReminderAsSent(reminderId) {
  try {
    if (!reminderId) {
      throw new Error("Reminder ID is required");
    }

    await db("task_reminders")
      .where({ id: reminderId })
      .update({
        sent: true,
        sent_at: db.fn.now(),
      });

    // Return updated reminder
    return await getReminderById(reminderId);
  } catch (error) {
    console.error("Error marking reminder as sent:", error);
    throw new Error(`Failed to mark reminder as sent: ${error.message}`);
  }
}

/**
 * Get upcoming reminders (next 7 days)
 * @returns {Promise<Array>} - List of upcoming reminders
 */
export async function getUpcomingReminders() {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const todayStr = today.toISOString().split("T")[0];
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    const reminders = await db("task_reminders as tr")
      .join("organizational_tasks as ot", "tr.task_id", "ot.id")
      .where("tr.sent", false)
      .whereBetween("tr.reminder_date", [todayStr, nextWeekStr])
      .select(
        "tr.*",
        "ot.title as task_title",
        "ot.target_month",
        "ot.target_year"
      )
      .orderBy("tr.reminder_date", "asc");

    return reminders;
  } catch (error) {
    console.error("Error getting upcoming reminders:", error);
    throw new Error(`Failed to get upcoming reminders: ${error.message}`);
  }
}
