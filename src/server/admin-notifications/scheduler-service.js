"use server";

import { db } from "@/lib/db";
import { sendAdminNotification } from "./notification-sender-service";

/**
 * Process due scheduled notifications
 * Called by cron job
 * @returns {Promise<Object>} - Summary of processed notifications
 */
export async function processScheduledNotifications() {
  try {
    // Get all scheduled notifications that are due
    const dueNotifications = await db("admin_notifications")
      .where("status", "scheduled")
      .where("scheduled_at", "<=", db.fn.now())
      .select("*");

    console.log(`Found ${dueNotifications.length} due scheduled notifications`);

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [],
    };

    for (const notification of dueNotifications) {
      try {
        await sendAdminNotification(notification.id);
        results.succeeded++;
        console.log(`Sent scheduled notification ${notification.id}: ${notification.title}`);
      } catch (error) {
        results.failed++;
        results.errors.push({
          notificationId: notification.id,
          title: notification.title,
          error: error.message,
        });
        console.error(
          `Failed to send scheduled notification ${notification.id}:`,
          error
        );
      }
      results.processed++;
    }

    return results;
  } catch (error) {
    console.error("Error processing scheduled notifications:", error);
    throw error;
  }
}

/**
 * Process recurring notifications
 * Called by cron job daily
 * @returns {Promise<Object>} - Summary of processed recurrences
 */
export async function processRecurringNotifications() {
  try {
    // Get all active recurring notifications
    const recurringNotifications = await db("admin_notifications")
      .where("status", "recurring_active")
      .select("*");

    console.log(
      `Found ${recurringNotifications.length} active recurring notifications`
    );

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    for (const notification of recurringNotifications) {
      try {
        // Check if already executed today
        const executedToday = await db("admin_notification_recurrence_log")
          .where("admin_notification_id", notification.id)
          .where("execution_date", today)
          .first();

        if (executedToday) {
          results.skipped++;
          console.log(
            `Skipping notification ${notification.id} - already executed today`
          );
          continue;
        }

        // Check if should run today based on recurrence pattern
        const shouldRun = shouldRunToday(notification);

        if (shouldRun) {
          // Send the notification
          const sendResult = await sendAdminNotification(notification.id);

          // Log the execution
          await logRecurrenceExecution(
            notification.id,
            sendResult.sentCount,
            "success"
          );

          // Reset status back to recurring_active (since sendAdminNotification sets it to 'sent')
          await db("admin_notifications")
            .where("id", notification.id)
            .update({ status: "recurring_active" });

          results.succeeded++;
          console.log(
            `Sent recurring notification ${notification.id}: ${notification.title} (${sendResult.sentCount} recipients)`
          );
        } else {
          results.skipped++;
          console.log(
            `Skipping notification ${notification.id} - not scheduled for today`
          );
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          notificationId: notification.id,
          title: notification.title,
          error: error.message,
        });

        // Log the failed execution
        await logRecurrenceExecution(
          notification.id,
          0,
          "failed",
          error.message
        );

        console.error(
          `Failed to send recurring notification ${notification.id}:`,
          error
        );
      }
      results.processed++;
    }

    return results;
  } catch (error) {
    console.error("Error processing recurring notifications:", error);
    throw error;
  }
}

/**
 * Check if a recurring notification should run today
 * @param {Object} notification - Notification with recurrence pattern and config
 * @returns {boolean}
 */
function shouldRunToday(notification) {
  const { recurrence_pattern, recurrence_config } = notification;

  if (!recurrence_pattern || !recurrence_config) {
    return false;
  }

  // Parse config if it's a string
  let config = recurrence_config;
  if (typeof config === "string") {
    try {
      config = JSON.parse(config);
    } catch (error) {
      console.error("Failed to parse recurrence config:", error);
      return false;
    }
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Parse configured time
  const [configHour, configMinute] = (config.time || "09:00")
    .split(":")
    .map(Number);

  // Check if current time matches configured time (within 1 hour window)
  const timeMatches =
    currentHour === configHour && currentMinute <= configMinute + 60;

  if (!timeMatches) {
    return false; // Not the right time yet
  }

  if (recurrence_pattern === "daily") {
    // Run every day
    return true;
  }

  if (recurrence_pattern === "weekly") {
    // Run on specific day of week (0 = Sunday, 6 = Saturday)
    const currentDayOfWeek = now.getDay();
    return currentDayOfWeek === parseInt(config.dayOfWeek);
  }

  if (recurrence_pattern === "monthly") {
    // Run on specific day of month (1-31)
    const currentDayOfMonth = now.getDate();
    return currentDayOfMonth === parseInt(config.dayOfMonth);
  }

  return false;
}

/**
 * Calculate next execution date for recurring notification
 * @param {string} recurrencePattern
 * @param {Object} recurrenceConfig
 * @returns {Date}
 */
function calculateNextExecution(recurrencePattern, recurrenceConfig) {
  const now = new Date();
  const [hour, minute] = (recurrenceConfig.time || "09:00")
    .split(":")
    .map(Number);

  const nextExecution = new Date(now);
  nextExecution.setHours(hour, minute, 0, 0);

  if (recurrencePattern === "daily") {
    // Next day at configured time
    if (nextExecution <= now) {
      nextExecution.setDate(nextExecution.getDate() + 1);
    }
    return nextExecution;
  }

  if (recurrencePattern === "weekly") {
    // Next occurrence of day of week
    const targetDay = parseInt(recurrenceConfig.dayOfWeek);
    const currentDay = now.getDay();

    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget <= 0 || (daysUntilTarget === 0 && nextExecution <= now)) {
      daysUntilTarget += 7;
    }

    nextExecution.setDate(nextExecution.getDate() + daysUntilTarget);
    return nextExecution;
  }

  if (recurrencePattern === "monthly") {
    // Next occurrence of day of month
    const targetDay = parseInt(recurrenceConfig.dayOfMonth);

    nextExecution.setDate(targetDay);
    if (nextExecution <= now) {
      // Move to next month
      nextExecution.setMonth(nextExecution.getMonth() + 1);
    }
    return nextExecution;
  }

  return nextExecution;
}

/**
 * Log recurring notification execution
 * @param {number} adminNotificationId
 * @param {number} sentCount
 * @param {string} status - 'success', 'failed', 'partial'
 * @param {string} errorMessage
 */
async function logRecurrenceExecution(
  adminNotificationId,
  sentCount,
  status,
  errorMessage = null
) {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    await db("admin_notification_recurrence_log").insert({
      admin_notification_id: adminNotificationId,
      execution_date: today,
      sent_count: sentCount,
      status,
      error_message: errorMessage,
    });
  } catch (error) {
    console.error("Failed to log recurrence execution:", error);
    // Don't throw - this is just logging
  }
}

/**
 * Get upcoming scheduled notifications (for preview/debugging)
 * @param {number} daysAhead - Number of days to look ahead
 * @returns {Promise<Array>} - List of upcoming notifications
 */
export async function getUpcomingScheduledNotifications(daysAhead = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const notifications = await db("admin_notifications")
    .where("status", "scheduled")
    .where("scheduled_at", "<=", futureDate.toISOString())
    .where("scheduled_at", ">=", db.fn.now())
    .orderBy("scheduled_at", "asc")
    .select("*");

  return notifications;
}

/**
 * Get next execution date for a recurring notification
 * @param {number} adminNotificationId
 * @returns {Promise<Date|null>}
 */
export async function getNextRecurrenceExecution(adminNotificationId) {
  const notification = await db("admin_notifications")
    .where("id", adminNotificationId)
    .where("status", "recurring_active")
    .first();

  if (!notification) {
    return null;
  }

  let config = notification.recurrence_config;
  if (typeof config === "string") {
    try {
      config = JSON.parse(config);
    } catch (error) {
      return null;
    }
  }

  return calculateNextExecution(notification.recurrence_pattern, config);
}
