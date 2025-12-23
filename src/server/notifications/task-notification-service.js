"use server";

import { getPendingReminders, markReminderAsSent } from "../organizational/reminder-service";
import { getTaskAssignments, getUsersForTask } from "../organizational/task-service";
import { createNotification } from "./notification-service";
import { getNotificationPreferences } from "./notification-preferences-service";
import {
  sendMessageToGroup,
  sendMessageToUser,
  formatTaskNotification,
  isTelegramConfigured,
} from "@/lib/telegram-bot";
import { db } from "@/lib/db";

/**
 * Main function to check and send task reminders
 * This should be called by a cron job daily
 * @returns {Promise<Object>} - Summary of sent reminders
 */
export async function sendTaskReminders() {
  try {
    console.log("Starting task reminder check...");

    // Get pending reminders for today
    const pendingReminders = await getPendingReminders();

    if (pendingReminders.length === 0) {
      console.log("No pending reminders for today");
      return {
        success: true,
        sent_count: 0,
        message: "No pending reminders for today",
      };
    }

    console.log(`Found ${pendingReminders.length} pending reminder(s)`);

    let successCount = 0;
    const errors = [];

    // Process each reminder
    for (const reminder of pendingReminders) {
      try {
        console.log(`Processing reminder ID ${reminder.id} for task "${reminder.task_title}"`);

        // Send notifications for this task
        await sendTaskNotification(reminder);

        // Mark reminder as sent
        await markReminderAsSent(reminder.id);

        successCount++;
        console.log(`Successfully sent reminder ID ${reminder.id}`);
      } catch (error) {
        console.error(`Error processing reminder ID ${reminder.id}:`, error);
        errors.push({
          reminder_id: reminder.id,
          task_id: reminder.task_id,
          error: error.message,
        });
      }
    }

    console.log(`Reminder check complete. Sent ${successCount}/${pendingReminders.length} reminders`);

    return {
      success: true,
      total_reminders: pendingReminders.length,
      sent_count: successCount,
      errors_count: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Error in sendTaskReminders:", error);
    throw new Error(`Failed to send task reminders: ${error.message}`);
  }
}

/**
 * Send notification for a specific task reminder
 * @param {Object} reminder - Reminder object with task details
 * @returns {Promise<Object>} - Summary of notifications sent
 */
async function sendTaskNotification(reminder) {
  try {
    const taskId = reminder.task_id;

    // Get task assignments to find target groups
    const assignments = await getTaskAssignments(taskId);

    // Get all users assigned to this task
    const users = await getUsersForTask(taskId);

    console.log(`Task ${taskId} has ${users.length} assigned user(s) and ${assignments.length} assignment(s)`);

    let inAppCount = 0;
    let telegramUserCount = 0;
    const telegramGroupsSent = new Set();

    // Send in-app notifications and individual Telegram messages to users
    for (const user of users) {
      try {
        // Create in-app notification
        await sendTaskNotificationToUser(user.user_id, reminder);
        inAppCount++;
      } catch (error) {
        console.error(`Error sending in-app notification to user ${user.user_id}:`, error);
      }

      // Send individual Telegram message if user has it enabled
      try {
        const prefs = await getNotificationPreferences(user.user_id);

        if (prefs.telegram_enabled && prefs.telegram_chat_id) {
          await sendTaskTelegramToUser(prefs.telegram_chat_id, reminder);
          telegramUserCount++;
        }
      } catch (error) {
        console.error(`Error sending Telegram message to user ${user.user_id}:`, error);
      }
    }

    // Send Telegram notifications to groups
    if (isTelegramConfigured()) {
      for (const assignment of assignments) {
        // Send to role group if configured
        if (assignment.role_telegram_group_id && !telegramGroupsSent.has(assignment.role_telegram_group_id)) {
          try {
            await sendTaskNotificationToGroup(assignment.role_telegram_group_id, reminder);
            telegramGroupsSent.add(assignment.role_telegram_group_id);
            console.log(`Sent to role group: ${assignment.role_name}`);
          } catch (error) {
            console.error(`Error sending to role group ${assignment.role_name}:`, error);
          }
        }

        // Send to department group if configured
        if (assignment.department_telegram_group_id && !telegramGroupsSent.has(assignment.department_telegram_group_id)) {
          try {
            await sendTaskNotificationToGroup(assignment.department_telegram_group_id, reminder);
            telegramGroupsSent.add(assignment.department_telegram_group_id);
            console.log(`Sent to department group: ${assignment.department_name}`);
          } catch (error) {
            console.error(`Error sending to department group ${assignment.department_name}:`, error);
          }
        }
      }
    }

    return {
      task_id: taskId,
      in_app_notifications: inAppCount,
      telegram_user_notifications: telegramUserCount,
      telegram_group_notifications: telegramGroupsSent.size,
    };
  } catch (error) {
    console.error("Error sending task notification:", error);
    throw new Error(`Failed to send task notification: ${error.message}`);
  }
}

/**
 * Send in-app notification to a user about a task
 * @param {string} userId - User ID
 * @param {Object} taskReminder - Task reminder object
 * @returns {Promise<Object>} - Created notification
 */
export async function sendTaskNotificationToUser(userId, taskReminder) {
  try {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthName = monthNames[taskReminder.target_month - 1] || taskReminder.target_month;

    const notification = await createNotification({
      userId,
      title: `Task Reminder: ${taskReminder.task_title}`,
      message: `You have a task reminder for ${monthName} ${taskReminder.target_year}. ${taskReminder.task_description || "Click to view details."}`,
      type: "organizational_task",
      resourceId: taskReminder.task_id.toString(),
      resourceType: "organizational_task",
    });

    return notification;
  } catch (error) {
    console.error("Error sending task notification to user:", error);
    throw new Error(`Failed to send notification to user: ${error.message}`);
  }
}

/**
 * Send Telegram message to a user about a task
 * @param {string} chatId - User's Telegram chat ID
 * @param {Object} taskReminder - Task reminder object
 * @returns {Promise<Object>} - Telegram API response
 */
async function sendTaskTelegramToUser(chatId, taskReminder) {
  try {
    if (!isTelegramConfigured()) {
      console.warn("Telegram not configured, skipping Telegram notification");
      return null;
    }

    const message = formatTaskNotification(taskReminder);

    const result = await sendMessageToUser(chatId, message);

    return result;
  } catch (error) {
    console.error("Error sending Telegram message to user:", error);
    throw error;
  }
}

/**
 * Send Telegram notification to a group about a task
 * @param {string} groupId - Telegram group chat ID
 * @param {Object} taskReminder - Task reminder object
 * @returns {Promise<Object>} - Telegram API response
 */
export async function sendTaskNotificationToGroup(groupId, taskReminder) {
  try {
    if (!isTelegramConfigured()) {
      console.warn("Telegram not configured, skipping Telegram notification");
      return null;
    }

    const message = formatTaskNotification(taskReminder);

    const result = await sendMessageToGroup(groupId, message);

    return result;
  } catch (error) {
    console.error("Error sending Telegram message to group:", error);
    throw error;
  }
}

/**
 * Send immediate notification for a newly created task
 * (Optional: can be called when a task is created to notify users immediately)
 * @param {number} taskId - Task ID
 * @returns {Promise<Object>} - Summary of notifications sent
 */
export async function sendNewTaskNotification(taskId) {
  try {
    // Get task details
    const task = await db("organizational_tasks").where({ id: taskId }).first();

    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    // Create a fake reminder object for notification purposes
    const taskReminder = {
      task_id: task.id,
      task_title: task.title,
      task_description: task.description,
      training_type: task.training_type,
      target_month: task.target_month,
      target_year: task.target_year,
      task_status: task.status,
    };

    // Send notification
    return await sendTaskNotification(taskReminder);
  } catch (error) {
    console.error("Error sending new task notification:", error);
    throw new Error(`Failed to send new task notification: ${error.message}`);
  }
}
